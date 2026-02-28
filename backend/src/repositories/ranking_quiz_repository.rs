use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::models::ranking_quiz::RankingQuiz;

pub struct RankingQuizRepository;

impl RankingQuizRepository {
    pub async fn create(
        pool: &PgPool,
        user_id: Uuid,
        collection_id: Uuid,
        question_ids: Vec<Uuid>,
        total_questions: i32,
    ) -> Result<RankingQuiz, sqlx::Error> {
        let quiz = sqlx::query_as::<_, RankingQuiz>(
            r#"
            INSERT INTO ranking_quizzes (user_id, collection_id, question_ids, total_questions)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, collection_id, question_ids, answered_question_ids, total_questions, correct_count, started_at, completed_at, is_active, created_at, updated_at
            "#,
        )
        .bind(user_id)
        .bind(collection_id)
        .bind(&question_ids)
        .bind(total_questions)
        .fetch_one(pool)
        .await?;

        Ok(quiz)
    }

    pub async fn find_active_by_id(
        pool: &PgPool,
        quiz_id: Uuid,
    ) -> Result<RankingQuiz, sqlx::Error> {
        sqlx::query_as::<_, RankingQuiz>(
            r#"
            SELECT id, user_id, collection_id, question_ids, answered_question_ids, total_questions, correct_count, started_at, completed_at, is_active, created_at, updated_at
            FROM ranking_quizzes
            WHERE id = $1 AND is_active = true
            "#,
        )
        .bind(quiz_id)
        .fetch_one(pool)
        .await
    }

    pub async fn record_all_answers(
        pool: &PgPool,
        quiz_id: Uuid,
        answers: Vec<crate::dtos::ranking_quiz_dto::RankingQuizAnswerDto>,
        correct_results: Vec<bool>, // Pre-calculated in service
        _total_time_millis: i64,
    ) -> Result<RankingQuiz, sqlx::Error> {
        let mut tx = pool.begin().await?;

        // 1. Insert all answers
        for (ans, is_correct) in answers.iter().zip(correct_results.iter()) {
            sqlx::query(
                r#"
                INSERT INTO ranking_quiz_answers (ranking_quiz_id, question_id, user_answer, is_correct, time_taken_millis)
                VALUES ($1, $2, $3, $4, $5)
                "#,
            )
            .bind(quiz_id)
            .bind(ans.question_id)
            .bind(&ans.answer)
            .bind(*is_correct)
            .bind(ans.time_taken_millis)
            .execute(&mut *tx)
            .await?;
        }

        // 2. Update the main quiz record as completed
        let correct_count = correct_results.iter().filter(|&&c| c).count() as i32;
        let answered_ids: Vec<Uuid> = answers.iter().map(|a| a.question_id).collect();

        let updated_quiz = sqlx::query_as::<_, RankingQuiz>(
            r#"
            UPDATE ranking_quizzes
            SET answered_question_ids = $2::uuid[],
                correct_count = $3,
                is_active = false,
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, user_id, collection_id, question_ids, answered_question_ids, total_questions, correct_count, started_at, completed_at, is_active, created_at, updated_at
            "#,
        )
        .bind(quiz_id)
        .bind(&answered_ids)
        .bind(correct_count as i32)
        .fetch_one(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(updated_quiz)
    }

    pub async fn record_answer(
        pool: &PgPool,
        quiz_id: Uuid,
        question_id: Uuid,
        user_answer: &str,
        is_correct: bool,
        time_taken_millis: i64,
        is_completed: bool,
    ) -> Result<RankingQuiz, sqlx::Error> {
        let mut tx = pool.begin().await?;

        // Insert into answers
        sqlx::query(
            r#"
            INSERT INTO ranking_quiz_answers (ranking_quiz_id, question_id, user_answer, is_correct, time_taken_millis)
            VALUES ($1, $2, $3, $4, $5)
            "#,
        )
        .bind(quiz_id)
        .bind(question_id)
        .bind(user_answer)
        .bind(is_correct)
        .bind(time_taken_millis)
        .execute(&mut *tx)
        .await?;

        // Update the main quiz record
        let correct_inc = if is_correct { 1 } else { 0 };
        let completed_at = if is_completed {
            Some(chrono::Utc::now())
        } else {
            None
        };
        let is_active = !is_completed;

        let updated_quiz = sqlx::query_as::<_, RankingQuiz>(
            r#"
            UPDATE ranking_quizzes
            SET answered_question_ids = array_append(answered_question_ids, $2),
                correct_count = correct_count + $3,
                is_active = $4,
                completed_at = COALESCE($5, completed_at),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, user_id, collection_id, question_ids, answered_question_ids, total_questions, correct_count, started_at, completed_at, is_active, created_at, updated_at
            "#,
        )
        .bind(quiz_id)
        .bind(question_id)
        .bind(correct_inc)
        .bind(is_active)
        .bind(completed_at)
        .fetch_one(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(updated_quiz)
    }

    pub async fn save_ranking_record(
        pool: &PgPool,
        user_id: Uuid,
        collection_id: Uuid,
        score: i32,
        correct_count: i32,
        total_questions: i32,
        total_time_millis: i64,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO ranking_records (user_id, collection_id, score, correct_count, total_questions, total_time_millis)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
        )
        .bind(user_id)
        .bind(collection_id)
        .bind(score)
        .bind(correct_count)
        .bind(total_questions)
        .bind(total_time_millis)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn get_user_rank(
        pool: &PgPool,
        user_id: Uuid,
        collection_id: Uuid,
    ) -> Result<Option<i64>, sqlx::Error> {
        let row = sqlx::query(
            r#"
            WITH RankedScores AS (
                SELECT 
                    user_id,
                    MAX(score) as max_score,
                    MAX(correct_count) as max_correct,
                    MIN(total_time_millis) as min_time
                FROM ranking_records
                WHERE collection_id = $2
                GROUP BY user_id
            ),
            Ranks AS (
                SELECT 
                    user_id,
                    RANK() OVER (ORDER BY max_score DESC, max_correct DESC, min_time ASC) as rank
                FROM RankedScores
            )
            SELECT rank FROM Ranks WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .bind(collection_id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| r.get::<i64, _>("rank")))
    }

    pub async fn get_leaderboard(
        pool: &PgPool,
        collection_id: Uuid,
    ) -> Result<Vec<crate::dtos::collection_dto::LeaderboardEntry>, sqlx::Error> {
        let entries = sqlx::query_as::<_, crate::dtos::collection_dto::LeaderboardEntry>(
            include_str!("../queries/ranking/get_leaderboard.sql")
        )
        .bind(collection_id)
        .fetch_all(pool)
        .await?;

        Ok(entries)
    }
}
