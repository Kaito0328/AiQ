use sqlx::PgPool;
use uuid::Uuid;
use crate::dtos::collection_dto::CollectionResponse;
use crate::error::AppError;

pub struct FavoriteCollectionRepository;

impl FavoriteCollectionRepository {
    pub async fn add_favorite(pool: &PgPool, user_id: Uuid, collection_id: Uuid) -> Result<(), AppError> {
        sqlx::query_file!(
            "src/queries/favorite_collections/add.sql",
            user_id,
            collection_id
        )
        .execute(pool)
        .await?;
        
        Ok(())
    }

    pub async fn remove_favorite(pool: &PgPool, user_id: Uuid, collection_id: Uuid) -> Result<(), AppError> {
        sqlx::query_file!(
            "src/queries/favorite_collections/remove.sql",
            user_id,
            collection_id
        )
        .execute(pool)
        .await?;
        
        Ok(())
    }

    pub async fn list_favorites(pool: &PgPool, user_id: Uuid) -> Result<Vec<CollectionResponse>, AppError> {
        let collections = sqlx::query_file_as!(
            CollectionResponse,
            "src/queries/favorite_collections/list_by_user.sql",
            user_id
        )
        .fetch_all(pool)
        .await?;
        
        Ok(collections)
    }
}
