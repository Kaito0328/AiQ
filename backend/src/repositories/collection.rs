use crate::models::collection::Collection;
use sqlx::PgPool;
use uuid::Uuid;

pub struct CollectionRepository;

impl CollectionRepository {
    // 問題集と統計情報を同時に作成
    pub async fn create(
        pool: &PgPool,
        user_id: Uuid,
        name: String,
        description_text: Option<String>,
        is_open: bool,
        default_mode: String,
    ) -> Result<Collection, sqlx::Error> {
        let mut tx = pool.begin().await?;

        // 1. 問題集本体の作成
        let collection = sqlx::query_file_as!(
            Collection,
            "src/queries/collections/insert_collection.sql",
            user_id,
            name,
            description_text,
            is_open,
            default_mode
        )
        .fetch_one(&mut *tx)
        .await?;

        // 2. 統計情報の初期レコード作成
        sqlx::query_file!("src/queries/collections/insert_stats.sql", collection.id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;

        Ok(collection)
    }

    // IDによる問題集の取得 (Response形式)
    pub async fn find_by_id_as_response(
        pool: &PgPool,
        collection_id: Uuid,
        requester_id: Option<Uuid>,
    ) -> Result<crate::dtos::collection_dto::CollectionResponse, sqlx::Error> {
        let collection = sqlx::query_file_as!(
            crate::dtos::collection_dto::CollectionResponse,
            "src/queries/collections/find_by_id_as_response.sql",
            collection_id,
            requester_id
        )
        .fetch_one(pool)
        .await?;

        Ok(collection)
    }

    // IDによる問題集の取得
    pub async fn find_by_id(pool: &PgPool, collection_id: Uuid) -> Result<Collection, sqlx::Error> {
        let collection = sqlx::query_file_as!(
            Collection,
            "src/queries/collections/find_by_id.sql",
            collection_id
        )
        .fetch_one(pool)
        .await?;

        Ok(collection)
    }

    // ユーザーが作成した問題集の一覧取得
    pub async fn find_by_user_id(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<Vec<Collection>, sqlx::Error> {
        let collections = sqlx::query_file_as!(
            Collection,
            "src/queries/collections/find_by_user_id.sql",
            user_id
        )
        .fetch_all(pool)
        .await?;

        Ok(collections)
    }

    pub async fn find_by_user_id_as_response(
        pool: &PgPool,
        user_id: Uuid,
        requester_id: Option<Uuid>,
    ) -> Result<Vec<crate::dtos::collection_dto::CollectionResponse>, sqlx::Error> {
        let collections = sqlx::query_file_as!(
            crate::dtos::collection_dto::CollectionResponse,
            "src/queries/collections/find_by_user_id_as_response.sql",
            user_id,
            requester_id
        )
        .fetch_all(pool)
        .await?;

        Ok(collections)
    }

    // 問題集の更新 (作成者のみ更新可能とするため user_id も引数に取る)
    pub async fn update(
        pool: &PgPool,
        collection_id: Uuid,
        user_id: Uuid,
        name: String,
        description_text: Option<String>,
        is_open: bool,
        default_mode: String,
    ) -> Result<Collection, sqlx::Error> {
        let collection = sqlx::query_file_as!(
            Collection,
            "src/queries/collections/update_collection.sql",
            name,
            description_text,
            is_open,
            default_mode,
            collection_id,
            user_id
        )
        .fetch_one(pool)
        .await?;

        Ok(collection)
    }

    pub async fn delete(
        pool: &PgPool,
        collection_id: Uuid,
        user_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        let result = sqlx::query_file!(
            "src/queries/collections/delete_collection.sql",
            collection_id,
            user_id
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn batch_upsert(
        pool: &PgPool,
        user_id: Uuid,
        items: Vec<crate::dtos::collection_dto::UpsertCollectionItem>,
    ) -> Result<Vec<Collection>, sqlx::Error> {
        if items.is_empty() {
            return Ok(Vec::new());
        }

        let mut tx = pool.begin().await?;
        let mut results = Vec::new();
        let mut new_ids = Vec::new();

        for item in items {
            let is_new = item.id.is_none();
            let item_id = item.id.unwrap_or_else(Uuid::new_v4);

            if is_new {
                // INSERT
                let name = item.name.unwrap_or_else(|| "Untitled".to_string());
                let is_open = item.is_open.unwrap_or(false);
                let default_mode = item.default_mode.unwrap_or_else(|| "omakase".to_string());

                let result = sqlx::query_file_as!(
                    Collection,
                    "src/queries/collections/insert_collection_with_id.sql",
                    item_id,
                    user_id,
                    name,
                    item.description_text,
                    is_open,
                    default_mode
                )
                .fetch_one(&mut *tx)
                .await?;

                results.push(result);
                new_ids.push(item_id);
            } else {
                // UPDATE
                let result = sqlx::query_file_as!(
                    Collection,
                    "src/queries/collections/update_collection_with_coalesce.sql",
                    item_id,
                    item.name,
                    item.description_text,
                    item.is_open,
                    item.default_mode,
                    user_id
                )
                .fetch_optional(&mut *tx)
                .await?;

                if let Some(r) = result {
                    results.push(r);
                }
            }
        }

        // upsert collection_stats for new collections safely
        if !new_ids.is_empty() {
            sqlx::query_file!("src/queries/collections/insert_stats_batch.sql", &new_ids)
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;

        Ok(results)
    }

    pub async fn batch_delete(
        pool: &PgPool,
        user_id: Uuid,
        collection_ids: Vec<Uuid>,
    ) -> Result<u64, sqlx::Error> {
        if collection_ids.is_empty() {
            return Ok(0);
        }

        let result = sqlx::query_file!(
            "src/queries/collections/delete_collections_by_ids.sql",
            user_id,
            &collection_ids
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }

    pub async fn find_followee_collections(
        pool: &PgPool,
        follower_id: Uuid,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<crate::dtos::collection_dto::CollectionResponse>, sqlx::Error> {
        let collections = sqlx::query_file_as!(
            crate::dtos::collection_dto::CollectionResponse,
            "src/queries/collections/get_followee_collections.sql",
            follower_id,
            limit,
            offset
        )
        .fetch_all(pool)
        .await?;

        Ok(collections)
    }

    pub async fn find_recent_collections(
        pool: &PgPool,
        limit: i64,
        offset: i64,
        requester_id: Option<Uuid>,
    ) -> Result<Vec<crate::dtos::collection_dto::CollectionResponse>, sqlx::Error> {
        let collections = sqlx::query_file_as!(
            crate::dtos::collection_dto::CollectionResponse,
            "src/queries/collections/get_recent_collections.sql",
            limit,
            offset,
            requester_id
        )
        .fetch_all(pool)
        .await?;

        Ok(collections)
    }
}
