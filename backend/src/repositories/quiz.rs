use crate::models::{
    quiz::{CasualQuiz, CasualQuizAnswer},
    question::UserQuestionStat,
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct QuizRepository;

impl QuizRepository {
    pub async fn create_casual_quiz(
        pool: &PgPool,
        user_id: Uuid,
        filter_types: Vec<String>,
        sort_keys: Vec<String>,
        collection_names: Vec<String>,
        question_ids: Vec<Uuid>,
        total_questions: i32,
    ) -> Result<CasualQuiz, sqlx::Error> {
        let answered_question_ids: Vec<Uuid> = vec![];
        let correct_count = 0;
        let elapsed_time_millis = 0;
        let is_active = true;

        let quiz = sqlx::query_file_as!(
            CasualQuiz,
            "src/queries/quiz/insert_casual_quiz.sql",
            user_id,
            &filter_types,
            &sort_keys,
            &collection_names,
            &question_ids,
            &answered_question_ids,
            total_questions,
            correct_count,
            elapsed_time_millis,
            is_active
        )
        .fetch_one(pool)
        .await?;

        Ok(quiz)
    }

    pub async fn find_active_quizzes(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<Vec<CasualQuiz>, sqlx::Error> {
        let quizzes = sqlx::query_file_as!(
            CasualQuiz,
            "src/queries/quiz/find_active_quizzes.sql",
            user_id
        )
        .fetch_all(pool)
        .await?;

        Ok(quizzes)
    }

    pub async fn find_by_id(
        pool: &PgPool,
        quiz_id: Uuid,
    ) -> Result<CasualQuiz, sqlx::Error> {
        let quiz = sqlx::query_file_as!(
            CasualQuiz,
            "src/queries/quiz/find_by_id.sql",
            quiz_id
        )
        .fetch_one(pool)
        .await?;

        Ok(quiz)
    }

    pub async fn update_progress(
        pool: &PgPool,
        quiz_id: Uuid,
        answered_question_ids: Vec<Uuid>,
        correct_count: i32,
        elapsed_time_millis: i64,
        is_active: bool,
    ) -> Result<CasualQuiz, sqlx::Error> {
        let quiz = sqlx::query_file_as!(
            CasualQuiz,
            "src/queries/quiz/update_quiz_progress.sql",
            quiz_id,
            &answered_question_ids,
            correct_count,
            elapsed_time_millis,
            is_active
        )
        .fetch_one(pool)
        .await?;

        Ok(quiz)
    }

    pub async fn delete_oldest_active_if_exceeds(
        pool: &PgPool,
        user_id: Uuid,
        limit: i64,
    ) -> Result<Option<CasualQuiz>, sqlx::Error> {
        let deleted = sqlx::query_file_as!(
            CasualQuiz,
            "src/queries/quiz/delete_oldest_active.sql",
            user_id,
            limit
        )
        .fetch_optional(pool)
        .await?;

        Ok(deleted)
    }

    pub async fn insert_answer(
        pool: &PgPool,
        quiz_id: Uuid,
        question_id: Uuid,
        user_answer: Option<String>,
        is_correct: bool,
    ) -> Result<CasualQuizAnswer, sqlx::Error> {
        let answer = sqlx::query_file_as!(
            CasualQuizAnswer,
            "src/queries/quiz/insert_answer.sql",
            quiz_id,
            question_id,
            user_answer,
            is_correct
        )
        .fetch_one(pool)
        .await?;

        Ok(answer)
    }

    pub async fn upsert_user_question_stat(
        pool: &PgPool,
        user_id: Uuid,
        question_id: Uuid,
        is_correct: bool,
    ) -> Result<UserQuestionStat, sqlx::Error> {
        let stat = sqlx::query_file_as!(
            UserQuestionStat,
            "src/queries/quiz/upsert_stat.sql",
            user_id,
            question_id,
            is_correct
        )
        .fetch_one(pool)
        .await?;

        Ok(stat)
    }

    pub async fn find_answers_by_quiz_id(
        pool: &PgPool,
        quiz_id: Uuid,
    ) -> Result<Vec<CasualQuizAnswer>, sqlx::Error> {
        let answers = sqlx::query_file_as!(
            CasualQuizAnswer,
            "src/queries/quiz/find_answers.sql",
            quiz_id
        )
        .fetch_all(pool)
        .await?;

        Ok(answers)
    }
}
