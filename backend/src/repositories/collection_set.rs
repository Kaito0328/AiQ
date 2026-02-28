use crate::models::collection::CollectionSet;
use sqlx::PgPool;
use uuid::Uuid;

pub struct CollectionSetRepository;

impl CollectionSetRepository {
    pub async fn create(
        pool: &PgPool,
        user_id: Uuid,
        name: String,
        description_text: Option<String>,
        is_open: bool,
    ) -> Result<CollectionSet, sqlx::Error> {
        let set = sqlx::query_as::<_, CollectionSet>(include_str!("../queries/collection_sets/insert_set.sql"))
            .bind(user_id)
            .bind(name)
            .bind(description_text)
            .bind(is_open)
            .fetch_one(pool)
            .await?;

        Ok(set)
    }

    pub async fn find_by_id(pool: &PgPool, set_id: Uuid) -> Result<CollectionSet, sqlx::Error> {
        let set = sqlx::query_as::<_, CollectionSet>(include_str!("../queries/collection_sets/find_by_id.sql"))
            .bind(set_id)
            .fetch_one(pool)
            .await?;

        Ok(set)
    }

    pub async fn find_collections_by_set_id(
        pool: &PgPool,
        set_id: Uuid,
    ) -> Result<Vec<crate::models::collection::Collection>, sqlx::Error> {
        let collections = sqlx::query_as::<_, crate::models::collection::Collection>(
            include_str!("../queries/collection_sets/find_collections_by_set_id.sql")
        )
        .bind(set_id)
        .fetch_all(pool)
        .await?;

        Ok(collections)
    }

    pub async fn find_by_user_id(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<Vec<CollectionSet>, sqlx::Error> {
        let sets = sqlx::query_as::<_, CollectionSet>(include_str!("../queries/collection_sets/find_by_user_id.sql"))
            .bind(user_id)
            .fetch_all(pool)
            .await?;

        Ok(sets)
    }

    pub async fn update(
        pool: &PgPool,
        set_id: Uuid,
        user_id: Uuid,
        name: String,
        description_text: Option<String>,
        is_open: bool,
    ) -> Result<CollectionSet, sqlx::Error> {
        let set = sqlx::query_as::<_, CollectionSet>(include_str!("../queries/collection_sets/update_set.sql"))
            .bind(name)
            .bind(description_text)
            .bind(is_open)
            .bind(set_id)
            .bind(user_id)
            .fetch_one(pool)
            .await?;

        Ok(set)
    }

    pub async fn delete(pool: &PgPool, set_id: Uuid, user_id: Uuid) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(include_str!("../queries/collection_sets/delete_set.sql"))
            .bind(set_id)
            .bind(user_id)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    // まとめ枠に問題集を追加するメソッド
    pub async fn add_collection(
        pool: &PgPool,
        set_id: Uuid,
        collection_id: Uuid,
        display_order: i32,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(include_str!("../queries/collection_sets/add_collection.sql"))
            .bind(set_id)
            .bind(collection_id)
            .bind(display_order)
            .execute(pool)
            .await?;

        Ok(())
    }

    // まとめ枠から問題集を外すメソッド
    pub async fn remove_collection(
        pool: &PgPool,
        set_id: Uuid,
        collection_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(include_str!("../queries/collection_sets/remove_collection.sql"))
            .bind(set_id)
            .bind(collection_id)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }
}
