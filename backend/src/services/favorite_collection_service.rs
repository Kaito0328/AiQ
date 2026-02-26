use sqlx::PgPool;
use uuid::Uuid;
use crate::dtos::collection_dto::CollectionResponse;
use crate::repositories::favorite_collection::FavoriteCollectionRepository;
use crate::error::AppError;
use std::sync::Arc;

pub struct FavoriteCollectionService {
    pool: Arc<PgPool>,
}

impl FavoriteCollectionService {
    pub fn new(pool: Arc<PgPool>) -> Self {
        Self { pool }
    }

    pub async fn add_favorite(&self, user_id: Uuid, collection_id: Uuid) -> Result<(), AppError> {
        FavoriteCollectionRepository::add_favorite(&self.pool, user_id, collection_id).await
    }

    pub async fn remove_favorite(&self, user_id: Uuid, collection_id: Uuid) -> Result<(), AppError> {
        FavoriteCollectionRepository::remove_favorite(&self.pool, user_id, collection_id).await
    }

    pub async fn list_favorites(&self, user_id: Uuid) -> Result<Vec<CollectionResponse>, AppError> {
        FavoriteCollectionRepository::list_favorites(&self.pool, user_id).await
    }
}
