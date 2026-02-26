use crate::dtos::match_dto::{CreateMatchRoomRequest, CreateMatchRoomResponse};
use crate::error::AppError;
use crate::repositories::question::QuestionRepository;
use crate::state::match_state::{MatchQuestion, RoomState, SharedMatchState};
use rand::seq::SliceRandom;
use rand::thread_rng;
use sqlx::PgPool;
use uuid::Uuid;

pub struct MatchService;

impl MatchService {
    pub async fn create_room(
        pool: &PgPool,
        match_state: &SharedMatchState,
        host_id: Uuid,
        req: CreateMatchRoomRequest,
    ) -> Result<CreateMatchRoomResponse, AppError> {
        // Fetch all questions from the given collections
        let mut all_questions = Vec::new();
        for cid in &req.collection_ids {
            let mut qs = QuestionRepository::find_by_collection_id(pool, *cid)
                .await
                .unwrap_or_default();
            all_questions.append(&mut qs);
        }

        // Shuffle
        {
            let mut rng = thread_rng();
            all_questions.shuffle(&mut rng);
        }

        // Take requested amount
        let selected: Vec<MatchQuestion> = all_questions
            .into_iter()
            .take(req.total_questions as usize)
            .map(|q| MatchQuestion {
                id: q.id,
                question_text: q.question_text,
                description_text: q.description_text,
                correct_answer: q.correct_answer,
            })
            .collect();

        // Generate a new room ID
        let room_id = Uuid::new_v4();

        // Create RoomState
        let room = RoomState::new(room_id, host_id, selected, req.max_buzzes_per_round);

        // Store in memory
        {
            let mut rooms = match_state.write().await;
            rooms.insert(room_id, room);
        }

        // Return the room ID and a generated join token
        Ok(CreateMatchRoomResponse {
            room_id,
            join_token: format!(
                "{}-{}",
                &room_id.to_string()[..8],
                &Uuid::new_v4().to_string()[..4]
            ),
        })
    }
}
