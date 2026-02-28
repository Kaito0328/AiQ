use crate::dtos::match_dto::{CreateMatchRoomRequest, CreateMatchRoomResponse, MatchRoomListItem};
use crate::error::AppError;
use crate::repositories::question::QuestionRepository;
use crate::state::match_state::{MatchQuestion, RoomState, RoomVisibility, SharedMatchState};
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
        // Fetch host info
        let host = crate::repositories::user::find_by_id(pool, host_id)
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to fetch host: {}", e)))?
            .ok_or_else(|| AppError::BadRequest("Host user not found".to_string()))?;

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
                correct_answers: q.correct_answers,
            })
            .collect();

        // Generate a new room ID
        let room_id = Uuid::new_v4();
        let visibility = req.visibility.unwrap_or(RoomVisibility::Private);

        // Create RoomState
        let room = RoomState::new(
            room_id,
            host_id,
            host.username,
            selected,
            req.max_buzzes_per_round as usize,
            visibility,
        );

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

    pub async fn list_public_rooms(
        match_state: &SharedMatchState,
    ) -> Result<Vec<MatchRoomListItem>, AppError> {
        let rooms = match_state.read().await;
        let list: Vec<MatchRoomListItem> = rooms
            .values()
            .filter(|r| r.visibility == RoomVisibility::Public && r.status != crate::state::match_state::RoomStatus::Finished)
            .map(|r| MatchRoomListItem {
                room_id: r.room_id,
                host_id: r.host_id,
                host_username: r.host_username.clone(),
                player_count: r.players.len(),
                status: format!("{:?}", r.status),
                total_questions: r.questions.len(),
            })
            .collect();

        Ok(list)
    }
}
