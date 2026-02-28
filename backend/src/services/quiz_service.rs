use crate::models::quiz::CasualQuiz;
use crate::repositories::quiz::QuizRepository;
use crate::repositories::question::QuestionRepository;
use crate::repositories::collection::CollectionRepository;
use crate::error::AppError;
use sqlx::PgPool;
use uuid::Uuid;
use std::env;
use rand::seq::SliceRandom;
use rand::thread_rng;

pub struct QuizService;

impl QuizService {
    pub async fn start_casual_quiz(
        pool: &PgPool,
        user_id: Uuid,
        req: crate::dtos::quiz_dto::StartCasualQuizRequest,
    ) -> Result<CasualQuiz, AppError> {
        let mut collection_ids = req.collection_ids;

        // If collection_set_id is provided, resolve it to collection ids
        if let Some(set_id) = req.collection_set_id {
            let set = crate::repositories::collection_set::CollectionSetRepository::find_by_id(pool, set_id)
                .await
                .map_err(|_| AppError::InternalServerError("Collection set not found".into()))?;

            // Security check: must be open or owned by requester
            if !set.is_open && set.user_id != user_id {
                return Err(AppError::Forbidden("Private collection set".into()));
            }

            let collections_in_set = crate::repositories::collection_set::CollectionSetRepository::find_collections_by_set_id(pool, set_id)
                .await
                .map_err(|e| AppError::InternalServerError(format!("Failed to fetch collections in set: {}", e)))?;
            
            for c in collections_in_set {
                if !collection_ids.contains(&c.id) {
                    collection_ids.push(c.id);
                }
            }
        }

        if collection_ids.is_empty() {
            return Err(AppError::BadRequest("No collections specified".into()));
        }

        // Collect collection names for the quiz metadata
        let mut collection_names = Vec::new();
        for cid in &collection_ids {
            let col = CollectionRepository::find_by_id(pool, *cid).await.map_err(|e| {
                AppError::InternalServerError(format!("Failed to find collection: {}", e))
            })?;
            
            // Security check for each collection
            if !col.is_open && col.user_id != user_id {
                 continue; // Skip private collections not owned by user
            }

            collection_names.push(col.name);
        }

        // Fetch all questions from the given collections
        let mut all_questions = Vec::new();
        for cid in &collection_ids {
            // Respect privacy during question fetching
            let col = CollectionRepository::find_by_id(pool, *cid).await.ok();
            if let Some(c) = col {
                if c.is_open || c.user_id == user_id {
                    let mut qs = QuestionRepository::find_by_collection_id(pool, *cid).await.unwrap_or_default();
                    all_questions.append(&mut qs);
                }
            }
        }

        if all_questions.is_empty() {
            return Err(AppError::InternalServerError("No questions found for the given collections".to_string()));
        }

        {
            let mut rng = thread_rng();
            all_questions.shuffle(&mut rng);
        }

        let selected = all_questions.into_iter().take(req.total_questions as usize).collect::<Vec<_>>();
        let question_ids: Vec<Uuid> = selected.iter().map(|q| q.id).collect();

        // Enforce max active quizzes limit
        let limit = env::var("MAX_ACTIVE_QUIZZES")
            .unwrap_or_else(|_| "5".to_string())
            .parse::<i64>()
            .unwrap_or(5);

        // Delete oldest active quiz if we are at or above the limit
        QuizRepository::delete_oldest_active_if_exceeds(pool, user_id, limit).await.ok();

        let quiz = QuizRepository::create_casual_quiz(
            pool,
            user_id,
            req.filter_types,
            req.sort_keys,
            collection_names,
            question_ids,
            selected.len() as i32,
        )
        .await
        .map_err(|e| AppError::InternalServerError(format!("Failed to create quiz: {}", e)))?;

        Ok(quiz)
    }

    pub async fn submit_answer(
        pool: &PgPool,
        user_id: Uuid,
        quiz_id: Uuid,
        question_id: Uuid,
        user_answer: Option<String>,
        elapsed_millis: i64,
    ) -> Result<CasualQuiz, AppError> {
        // Get the quiz
        let mut quiz = QuizRepository::find_by_id(pool, quiz_id).await.map_err(|_| {
            AppError::InternalServerError("Quiz not found".to_string())
        })?;

        if quiz.user_id != user_id {
            return Err(AppError::Unauthorized("Not your quiz".to_string()));
        }

        if !quiz.is_active {
            return Err(AppError::InternalServerError("Quiz is already completed".to_string()));
        }

        // Check if question belongs to quiz
        if !quiz.question_ids.contains(&question_id) {
            return Err(AppError::InternalServerError("Question not in quiz".to_string()));
        }
        
        // Check if already answered
        if quiz.answered_question_ids.contains(&question_id) {
            return Err(AppError::InternalServerError("Question already answered".to_string()));
        }

        // Get the actual question to check answer
        let question = QuestionRepository::find_by_id(pool, question_id).await.map_err(|_| {
            AppError::InternalServerError("Question not found".to_string())
        })?;

        let is_correct = match &user_answer {
            Some(ans) => {
                let trimmed_ans = ans.trim();
                question.correct_answers.iter().any(|correct| {
                    trimmed_ans.eq_ignore_ascii_case(correct.trim())
                })
            },
            None => false,
        };

        // Insert answer
        QuizRepository::insert_answer(pool, quiz_id, question_id, user_answer.clone(), is_correct)
            .await.map_err(|e| AppError::InternalServerError(format!("Failed to insert answer: {}", e)))?;

        // Update user stats
        QuizRepository::upsert_user_question_stat(pool, user_id, question_id, is_correct)
            .await.map_err(|e| AppError::InternalServerError(format!("Failed to update stats: {}", e)))?;

        // Update quiz progress
        quiz.answered_question_ids.push(question_id);
        if is_correct {
            quiz.correct_count += 1;
        }
        quiz.elapsed_time_millis += elapsed_millis;

        if quiz.answered_question_ids.len() == quiz.question_ids.len() {
            quiz.is_active = false;
        }

        let updated_quiz = QuizRepository::update_progress(
            pool,
            quiz.id,
            quiz.answered_question_ids,
            quiz.correct_count,
            quiz.elapsed_time_millis,
            quiz.is_active,
        )
        .await
        .map_err(|e| AppError::InternalServerError(format!("Failed to update quiz progress: {}", e)))?;

        Ok(updated_quiz)
    }

    pub async fn get_resumes(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<Vec<CasualQuiz>, AppError> {
        let quizzes = QuizRepository::find_active_quizzes(pool, user_id)
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to get resumes: {}", e)))?;

        Ok(quizzes)
    }

    pub async fn resume_quiz(
        pool: &PgPool,
        user_id: Uuid,
        quiz_id: Uuid,
    ) -> Result<CasualQuiz, AppError> {
        let quiz = QuizRepository::find_by_id(pool, quiz_id).await.map_err(|_| {
            AppError::InternalServerError("Quiz not found".to_string())
        })?;

        if quiz.user_id != user_id {
            return Err(AppError::Unauthorized("Not your quiz".to_string()));
        }

        Ok(quiz)
    }
}
