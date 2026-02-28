use sqlx::PgPool;
use uuid::Uuid;
use crate::dtos::collection_dto::CollectionResponse;
use crate::error::AppError;

pub struct FavoriteCollectionRepository;

impl FavoriteCollectionRepository {
    pub async fn add_favorite(pool: &PgPool, user_id: Uuid, collection_id: Uuid) -> Result<(), AppError> {
        sqlx::query(include_str!("../queries/favorite_collections/add.sql"))
            .bind(user_id)
            .bind(collection_id)
            .execute(pool)
            .await?;
        
        Ok(())
    }

    pub async fn remove_favorite(pool: &PgPool, user_id: Uuid, collection_id: Uuid) -> Result<(), AppError> {
        sqlx::query(include_str!("../queries/favorite_collections/remove.sql"))
            .bind(user_id)
            .bind(collection_id)
            .execute(pool)
            .await?;
        
        Ok(())
    }

    pub async fn list_favorites(pool: &PgPool, user_id: Uuid) -> Result<Vec<CollectionResponse>, AppError> {
        let collections = sqlx::query_as::<_, CollectionResponse>(
            include_str!("../queries/favorite_collections/list_by_user.sql")
        )
        .bind(user_id)
        .fetch_all(pool)
        .await?;
        
        Ok(collections)
    }
}
