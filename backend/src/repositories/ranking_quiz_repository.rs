use sqlx::PgPool;
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
        let quiz = sqlx::query_file_as!(
            RankingQuiz,
            "src/queries/ranking/insert_ranking_quiz.sql",
            user_id,
            collection_id,
            &question_ids,
            total_questions
        )
        .fetch_one(pool)
        .await?;

        Ok(quiz)
    }

    pub async fn find_active_by_id(
        pool: &PgPool,
        quiz_id: Uuid,
    ) -> Result<RankingQuiz, sqlx::Error> {
        sqlx::query_file_as!(
            RankingQuiz,
            "src/queries/ranking/find_active_by_id.sql",
            quiz_id
        )
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
            sqlx::query_file!(
                "src/queries/ranking/insert_ranking_quiz_answer.sql",
                quiz_id,
                ans.question_id,
                ans.answer,
                *is_correct,
                ans.time_taken_millis
            )
            .execute(&mut *tx)
            .await?;
        }

        // 2. Update the main quiz record as completed
        let correct_count = correct_results.iter().filter(|&&c| c).count() as i32;
        let answered_ids: Vec<Uuid> = answers.iter().map(|a| a.question_id).collect();

        let updated_quiz = sqlx::query_file_as!(
            RankingQuiz,
            "src/queries/ranking/update_ranking_quiz_completed.sql",
            quiz_id,
            &answered_ids,
            correct_count as i32
        )
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
        sqlx::query_file!(
            "src/queries/ranking/insert_ranking_quiz_answer.sql",
            quiz_id,
            question_id,
            user_answer,
            is_correct,
            time_taken_millis
        )
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

        let updated_quiz = sqlx::query_file_as!(
            RankingQuiz,
            "src/queries/ranking/update_ranking_quiz_progress.sql",
            quiz_id,
            question_id,
            correct_inc,
            is_active,
            completed_at as Option<chrono::DateTime<chrono::Utc>>
        )
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
        sqlx::query_file!(
            "src/queries/ranking/insert_ranking_record.sql",
            user_id,
            collection_id,
            score,
            correct_count,
            total_questions,
            total_time_millis
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn get_user_rank(
        pool: &PgPool,
        user_id: Uuid,
        collection_id: Uuid,
    ) -> Result<Option<i64>, sqlx::Error> {
        let result = sqlx::query_file!(
            "src/queries/ranking/get_user_rank.sql",
            user_id,
            collection_id
        )
        .fetch_optional(pool)
        .await?;

        Ok(result.and_then(|r| r.rank))
    }

    pub async fn get_leaderboard(
        pool: &PgPool,
        collection_id: Uuid,
    ) -> Result<Vec<crate::dtos::collection_dto::LeaderboardEntry>, sqlx::Error> {
        let entries = sqlx::query_file_as!(
            crate::dtos::collection_dto::LeaderboardEntry,
            "src/queries/ranking/get_leaderboard.sql",
            collection_id
        )
        .fetch_all(pool)
        .await?;

        Ok(entries)
    }
}
