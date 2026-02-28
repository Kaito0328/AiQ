use rand::seq::SliceRandom;
use sqlx::PgPool;
use uuid::Uuid;

use crate::dtos::ranking_quiz_dto::{
    RankingQuizQuestionDto, RankingQuizResultDto, StartRankingQuizRequest, StartRankingQuizResponse,
    SubmitRankingAllAnswersRequest, SubmitRankingAnswerRequest, SubmitRankingAnswerResponse,
};
use crate::error::AppError;
use crate::repositories::collection::CollectionRepository;
use crate::repositories::question::QuestionRepository;
use crate::repositories::ranking_quiz_repository::RankingQuizRepository;

pub struct RankingQuizService;

impl RankingQuizService {
    pub async fn start_quiz(
        pool: &PgPool,
        user_id: Uuid,
        req: StartRankingQuizRequest,
    ) -> Result<StartRankingQuizResponse, AppError> {
        // Check collection accessibility
        let collection = CollectionRepository::find_by_id(pool, req.collection_id)
            .await
            .map_err(|_| AppError::InternalServerError("Collection not found".into()))?;

        if !collection.is_open && collection.user_id != user_id {
            return Err(AppError::Unauthorized("Cannot access this collection".into()));
        }

        // Fetch all questions
        let mut questions = QuestionRepository::find_by_collection_id(pool, req.collection_id)
            .await
            .map_err(|_| AppError::InternalServerError("Failed to fetch questions".into()))?;

        if questions.is_empty() {
            return Err(AppError::InternalServerError("Collection has no questions".into()));
        }

        // Shuffle questions randomly
        {
            let mut rng = rand::thread_rng();
            questions.shuffle(&mut rng);
        }

        // Map to IDs
        let question_ids: Vec<Uuid> = questions.iter().map(|q| q.id).collect();
        let total_questions = question_ids.len() as i32;

        // Create ranking quiz state in DB
        let quiz = RankingQuizRepository::create(
            pool,
            user_id,
            req.collection_id,
            question_ids.clone(),
            total_questions,
        )
        .await
        .map_err(|e| AppError::InternalServerError(format!("Failed to create ranking quiz: {}", e)))?;

        // Format all questions (Hide answers!)
        let questions_dto: Vec<RankingQuizQuestionDto> = questions
            .into_iter()
            .map(|q| RankingQuizQuestionDto {
                id: q.id,
                question_text: q.question_text,
            })
            .collect();

        Ok(StartRankingQuizResponse {
            quiz_id: quiz.id,
            collection_id: quiz.collection_id,
            total_questions: quiz.total_questions,
            started_at: quiz.started_at,
            questions: questions_dto,
        })
    }

    pub async fn submit_all_answers(
        pool: &PgPool,
        user_id: Uuid,
        quiz_id: Uuid,
        req: SubmitRankingAllAnswersRequest,
    ) -> Result<RankingQuizResultDto, AppError> {
        // 1. Fetch active quiz
        let quiz = RankingQuizRepository::find_active_by_id(pool, quiz_id)
            .await
            .map_err(|_| AppError::InternalServerError("Active quiz not found or already finished".into()))?;

        if quiz.user_id != user_id {
            return Err(AppError::Unauthorized("Not your quiz".into()));
        }

        if req.answers.len() != quiz.question_ids.len() {
            return Err(AppError::InternalServerError("Missing answers for some questions".into()));
        }

        // 2. Fetch all real questions to check answers
        let mut correct_results = Vec::new();
        let mut detailed_results = Vec::new();
        for ans in &req.answers {
            let actual_question = QuestionRepository::find_by_id(pool, ans.question_id)
                .await
                .map_err(|_| AppError::InternalServerError("Question not found".into()))?;
            
            let trimmed_ans = ans.answer.trim().to_lowercase();
            let is_correct = actual_question.correct_answers.iter().any(|correct| {
                correct.trim().to_lowercase() == trimmed_ans
            });
            correct_results.push(is_correct);
            detailed_results.push(crate::dtos::ranking_quiz_dto::RankingAnswerResultDto {
                question_id: ans.question_id,
                is_correct,
                correct_answer: actual_question.correct_answers.join(" / "),
            });
        }

        // 3. Record all answers and complete quiz
        let total_time_millis = chrono::Utc::now().timestamp_millis() - quiz.started_at.timestamp_millis();
        let updated_quiz = RankingQuizRepository::record_all_answers(
            pool,
            quiz_id,
            req.answers,
            correct_results,
            total_time_millis,
        )
        .await
        .map_err(|e| AppError::InternalServerError(format!("Failed to record answers: {}", e)))?;

        // 4. Calculate score and save record
        // Basic Score Formula: (Correct * 1000) - (Time in seconds * 10)
        let time_penalty = (total_time_millis / 1000) * 10;
        let mut final_score = (updated_quiz.correct_count as i64 * 1000) - time_penalty;
        if final_score < 0 {
            final_score = 0;
        }

        RankingQuizRepository::save_ranking_record(
            pool,
            user_id,
            updated_quiz.collection_id,
            final_score as i32,
            updated_quiz.correct_count,
            updated_quiz.total_questions,
            total_time_millis,
        )
        .await
        .map_err(|e| AppError::InternalServerError(format!("Failed to save ranking: {}", e)))?;

        // 5. Fetch user rank
        let rank = RankingQuizRepository::get_user_rank(pool, user_id, updated_quiz.collection_id)
            .await
            .unwrap_or(None);

        Ok(RankingQuizResultDto {
            quiz_id,
            collection_id: updated_quiz.collection_id,
            score: final_score as i32,
            correct_count: updated_quiz.correct_count,
            total_questions: updated_quiz.total_questions,
            total_time_millis,
            completed_at: updated_quiz.completed_at.unwrap_or_else(chrono::Utc::now),
            rank,
            detailed_results,
        })
    }

    pub async fn submit_answer(
        pool: &PgPool,
        user_id: Uuid,
        quiz_id: Uuid,
        req: SubmitRankingAnswerRequest,
    ) -> Result<SubmitRankingAnswerResponse, AppError> {
        // 1. Fetch active quiz
        let quiz = RankingQuizRepository::find_active_by_id(pool, quiz_id)
            .await
            .map_err(|_| AppError::InternalServerError("Active quiz not found or already finished".into()))?;

        if quiz.user_id != user_id {
            return Err(AppError::Unauthorized("Not your quiz".into()));
        }

        // 2. Identify current question index
        let current_index = quiz.answered_question_ids.len();
        if current_index >= quiz.question_ids.len() {
            return Err(AppError::InternalServerError("Quiz already completed".into()));
        }

        let expected_question_id = quiz.question_ids[current_index];
        if expected_question_id != req.question_id {
            return Err(AppError::InternalServerError("Question ID mismatch (anti-cheat)".into()));
        }

        // 3. Fetch the real Question to check answer
        let actual_question = QuestionRepository::find_by_id(pool, req.question_id)
            .await
            .map_err(|_| AppError::InternalServerError("Question not found".into()))?;

        let trimmed_ans = req.answer.trim();
        let is_correct = actual_question.correct_answers.iter().any(|correct| {
            correct.trim() == trimmed_ans
        });

        // 4. Update state
        let next_index = current_index + 1;
        let is_completed = next_index == quiz.question_ids.len();

        let updated_quiz = RankingQuizRepository::record_answer(
            pool,
            quiz_id,
            req.question_id,
            &req.answer,
            is_correct,
            req.time_taken_millis,
            is_completed,
        )
        .await
        .map_err(|e| AppError::InternalServerError(format!("Failed to record answer: {}", e)))?;

        // 5. If completed, calculate score and save to ranking_records
        let mut result_dto = None;
        if is_completed {
            let total_time_millis = match updated_quiz.completed_at {
                Some(ended) => ended.timestamp_millis() - updated_quiz.started_at.timestamp_millis(),
                None => 0,
            };

            // Basic Score Formula: (Correct * 1000) - (Time in seconds * 10)
            let time_penalty = (total_time_millis / 1000) * 10;
            let mut final_score = (updated_quiz.correct_count as i64 * 1000) - time_penalty;
            if final_score < 0 {
                final_score = 0;
            }

            RankingQuizRepository::save_ranking_record(
                pool,
                user_id,
                updated_quiz.collection_id,
                final_score as i32,
                updated_quiz.correct_count,
                updated_quiz.total_questions,
                total_time_millis,
            )
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to save ranking: {}", e)))?;

            // 5. Fetch user rank
            let rank = RankingQuizRepository::get_user_rank(pool, user_id, updated_quiz.collection_id)
                .await
                .unwrap_or(None);

            result_dto = Some(RankingQuizResultDto {
                quiz_id,
                collection_id: updated_quiz.collection_id,
                score: final_score as i32,
                correct_count: updated_quiz.correct_count,
                total_questions: updated_quiz.total_questions,
                total_time_millis,
                completed_at: updated_quiz.completed_at.unwrap_or_else(chrono::Utc::now),
                rank,
                detailed_results: Vec::new(), // In single-step mode, we don't necessarily return history here unless needed
            });
        }

        // 6. Fetch next question if any (hide answer)
        let mut next_question_dto = None;
        if !is_completed {
            let next_q_id = quiz.question_ids[next_index];
            let next_q = QuestionRepository::find_by_id(pool, next_q_id)
                .await
                .map_err(|_| AppError::InternalServerError("Next question not found".into()))?;

            next_question_dto = Some(RankingQuizQuestionDto {
                id: next_q.id,
                question_text: next_q.question_text,
            });
        }

        Ok(SubmitRankingAnswerResponse {
            is_correct,
            correct_answer: actual_question.correct_answers.join(" / "),
            description_text: actual_question.description_text,
            next_question: next_question_dto,
            is_completed,
            result: result_dto,
        })
    }

    pub async fn get_leaderboard(
        pool: &PgPool,
        collection_id: Uuid,
    ) -> Result<crate::dtos::collection_dto::LeaderboardResponse, AppError> {
        let entries = RankingQuizRepository::get_leaderboard(pool, collection_id)
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to fetch leaderboard: {}", e)))?;

        Ok(crate::dtos::collection_dto::LeaderboardResponse {
            collection_id,
            entries,
        })
    }
}
