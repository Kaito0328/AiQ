use sqlx::PgPool;
use uuid::Uuid;

use crate::dtos::collection_dto::{CreateCollectionRequest, UpdateCollectionRequest};
use crate::models::collection::Collection;
use crate::repositories::collection::CollectionRepository;

pub struct CollectionService;

impl CollectionService {
    fn normalize_tags(tags: Option<Vec<String>>) -> Vec<String> {
        let mut normalized = Vec::new();
        for raw in tags.unwrap_or_default() {
            let trimmed = raw.trim().trim_start_matches('#').to_lowercase();
            if trimmed.is_empty() {
                continue;
            }

            // タグ長を10文字に揃える
            let short: String = trimmed.chars().take(10).collect();
            if short.is_empty() {
                continue;
            }
            if !normalized.iter().any(|t| t == &short) {
                normalized.push(short);
            }
            if normalized.len() >= 10 {
                break;
            }
        }
        normalized
    }

    fn normalize_difficulty(level: Option<i16>) -> i16 {
        level.unwrap_or(3).clamp(1, 5)
    }

    /// 新規問題集の作成
    pub async fn create_collection(
        pool: &PgPool,
        user_id: Uuid,
        req: CreateCollectionRequest,
    ) -> Result<Collection, sqlx::Error> {
        // ※ 必要であればここに「名前が空文字でないか」「長すぎないか」等のバリデーションを追加します

        CollectionRepository::create(
            pool,
            user_id,
            req.name,
            req.description_text,
            req.is_open,
            req.default_mode.unwrap_or_else(|| "omakase".to_string()),
        )
        .await
    }

    pub async fn get_collection(
        pool: &PgPool,
        collection_id: Uuid,
        requester_id: Option<Uuid>,
    ) -> Result<crate::dtos::collection_dto::CollectionResponse, sqlx::Error> {
        let collection =
            CollectionRepository::find_by_id_as_response(pool, collection_id, requester_id).await?;

        // 🌟 非公開 かつ 自分のコレクションでない場合はエラー
        if !collection.is_open && requester_id != Some(collection.user_id) {
            return Err(sqlx::Error::RowNotFound); // 存在を隠蔽する
        }
        Ok(collection)
    }

    pub async fn get_user_collections(
        pool: &PgPool,
        target_user_id: Uuid,
        requester_id: Option<Uuid>,
    ) -> Result<Vec<crate::dtos::collection_dto::CollectionResponse>, sqlx::Error> {
        let collections =
            CollectionRepository::find_by_user_id_as_response(pool, target_user_id, requester_id)
                .await?;
        let is_owner = requester_id == Some(target_user_id);

        let filtered = collections
            .into_iter()
            .filter(|c| c.is_open || is_owner)
            .collect();

        Ok(filtered)
    }

    /// 問題集の更新
    pub async fn update_collection(
        pool: &PgPool,
        collection_id: Uuid,
        user_id: Uuid, // 実行者のID
        req: UpdateCollectionRequest,
    ) -> Result<Collection, sqlx::Error> {
        // Repository側で「自身の問題集しか更新できない」ようにSQL（WHERE user_id = $5）
        // が組まれているため、他人の問題集IDを渡されても自動的にエラー（NotFound）になります。
        CollectionRepository::update(
            pool,
            collection_id,
            user_id,
            req.name,
            req.description_text,
            req.is_open,
            req.default_mode.unwrap_or_else(|| "omakase".to_string()),
        )
        .await
    }

    /// 問題集の削除
    pub async fn delete_collection(
        pool: &PgPool,
        collection_id: Uuid,
        user_id: Uuid, // 実行者のID
    ) -> Result<bool, sqlx::Error> {
        // 更新時と同様、他人の問題集は削除されません
        CollectionRepository::delete(pool, collection_id, user_id).await
    }

    pub async fn batch_collections(
        pool: &PgPool,
        user_id: Uuid,
        req: crate::dtos::collection_dto::BatchCollectionsRequest,
    ) -> Result<(Vec<Collection>, u64), sqlx::Error> {
        let upserted = CollectionRepository::batch_upsert(pool, user_id, req.upsert_items).await?;
        let deleted = CollectionRepository::batch_delete(pool, user_id, req.delete_ids).await?;

        Ok((upserted, deleted))
    }

    pub async fn get_followee_collections(
        pool: &PgPool,
        follower_id: Uuid,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<crate::dtos::collection_dto::CollectionResponse>, sqlx::Error> {
        CollectionRepository::find_followee_collections(pool, follower_id, limit, offset).await
    }

    pub async fn get_recent_collections(
        pool: &PgPool,
        limit: i64,
        offset: i64,
        requester_id: Option<Uuid>,
    ) -> Result<Vec<crate::dtos::collection_dto::CollectionResponse>, sqlx::Error> {
        CollectionRepository::find_recent_collections(pool, limit, offset, requester_id).await
    }

    pub async fn upsert_search_metadata(
        pool: &PgPool,
        collection_id: Uuid,
        user_id: Uuid,
        req: crate::dtos::collection_dto::UpsertCollectionSearchMetadataRequest,
    ) -> Result<bool, sqlx::Error> {
        let difficulty_level = Self::normalize_difficulty(req.difficulty_level);
        let tags = Self::normalize_tags(req.tags);

        CollectionRepository::upsert_search_metadata(
            pool,
            collection_id,
            user_id,
            difficulty_level,
            tags,
        )
        .await
    }

    pub async fn search_collections(
        pool: &PgPool,
        query: Option<String>,
        tags: Vec<String>,
        difficulty_min: Option<i16>,
        difficulty_max: Option<i16>,
        sort: &str,
        limit: i64,
        offset: i64,
        requester_id: Option<Uuid>,
    ) -> Result<Vec<crate::dtos::collection_dto::CollectionSearchResponse>, sqlx::Error> {
        let normalized_tags = Self::normalize_tags(Some(tags));
        let normalized_difficulty_min = difficulty_min.map(|v| v.clamp(1, 5));
        let normalized_difficulty_max = difficulty_max.map(|v| v.clamp(1, 5));

        CollectionRepository::search_open_collections(
            pool,
            query,
            normalized_tags,
            normalized_difficulty_min,
            normalized_difficulty_max,
            sort,
            limit,
            offset,
            requester_id,
        )
        .await
    }

    pub async fn get_popular_tags(
        pool: &PgPool,
        limit: i64,
        query: Option<String>,
    ) -> Result<Vec<crate::dtos::collection_dto::PopularTagResponse>, sqlx::Error> {
        CollectionRepository::get_popular_tags(pool, limit.max(1).min(30), query).await
    }
}
