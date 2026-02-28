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

        let quiz = sqlx::query_as::<_, CasualQuiz>(include_str!("../queries/quiz/insert_casual_quiz.sql"))
            .bind(user_id)
            .bind(&filter_types)
            .bind(&sort_keys)
            .bind(&collection_names)
            .bind(&question_ids)
            .bind(&answered_question_ids)
            .bind(total_questions)
            .bind(correct_count)
            .bind(elapsed_time_millis)
            .bind(is_active)
            .fetch_one(pool)
            .await?;

        Ok(quiz)
    }

    pub async fn find_active_quizzes(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<Vec<CasualQuiz>, sqlx::Error> {
        let quizzes = sqlx::query_as::<_, CasualQuiz>(include_str!("../queries/quiz/find_active_quizzes.sql"))
            .bind(user_id)
            .fetch_all(pool)
            .await?;

        Ok(quizzes)
    }

    pub async fn find_by_id(
        pool: &PgPool,
        quiz_id: Uuid,
    ) -> Result<CasualQuiz, sqlx::Error> {
        let quiz = sqlx::query_as::<_, CasualQuiz>(include_str!("../queries/quiz/find_by_id.sql"))
            .bind(quiz_id)
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
        let quiz = sqlx::query_as::<_, CasualQuiz>(include_str!("../queries/quiz/update_quiz_progress.sql"))
            .bind(quiz_id)
            .bind(&answered_question_ids)
            .bind(correct_count)
            .bind(elapsed_time_millis)
            .bind(is_active)
            .fetch_one(pool)
            .await?;

        Ok(quiz)
    }

    pub async fn delete_oldest_active_if_exceeds(
        pool: &PgPool,
        user_id: Uuid,
        limit: i64,
    ) -> Result<Option<CasualQuiz>, sqlx::Error> {
        let deleted = sqlx::query_as::<_, CasualQuiz>(include_str!("../queries/quiz/delete_oldest_active.sql"))
            .bind(user_id)
            .bind(limit)
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
        let answer = sqlx::query_as::<_, CasualQuizAnswer>(include_str!("../queries/quiz/insert_answer.sql"))
            .bind(quiz_id)
            .bind(question_id)
            .bind(user_answer)
            .bind(is_correct)
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
        let stat = sqlx::query_as::<_, UserQuestionStat>(include_str!("../queries/quiz/upsert_stat.sql"))
            .bind(user_id)
            .bind(question_id)
            .bind(is_correct)
            .fetch_one(pool)
            .await?;

        Ok(stat)
    }

    pub async fn find_answers_by_quiz_id(
        pool: &PgPool,
        quiz_id: Uuid,
    ) -> Result<Vec<CasualQuizAnswer>, sqlx::Error> {
        let answers = sqlx::query_as::<_, CasualQuizAnswer>(include_str!("../queries/quiz/find_answers.sql"))
            .bind(quiz_id)
            .fetch_all(pool)
            .await?;

        Ok(answers)
    }
}
