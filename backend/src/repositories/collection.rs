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

    pub async fn upsert_search_metadata(
        pool: &PgPool,
        collection_id: Uuid,
        user_id: Uuid,
        difficulty_level: i16,
        tags: Vec<String>,
    ) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(
            r#"
            INSERT INTO collection_search_metadata (collection_id, difficulty_level, tags, updated_at)
            SELECT c.id, $3, $4::text[], NOW()
            FROM collections c
            WHERE c.id = $1 AND c.user_id = $2
            ON CONFLICT (collection_id)
            DO UPDATE SET
                difficulty_level = EXCLUDED.difficulty_level,
                tags = EXCLUDED.tags,
                updated_at = NOW();
            "#,
        )
        .bind(collection_id)
        .bind(user_id)
        .bind(difficulty_level)
        .bind(tags)
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn search_open_collections(
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
        let query_text = query
            .map(|q| q.trim().to_string())
            .filter(|q| !q.is_empty());
        let tags_filter = if tags.is_empty() { None } else { Some(tags) };
        let is_popular_sort = sort.eq_ignore_ascii_case("popular");
        let is_difficulty_asc_sort = sort.eq_ignore_ascii_case("difficultyAsc");
        let is_difficulty_desc_sort = sort.eq_ignore_ascii_case("difficultyDesc");

        let collections = sqlx::query_as::<_, crate::dtos::collection_dto::CollectionSearchResponse>(
            r#"
            SELECT
                c.id,
                c.user_id,
                c.name,
                c.description_text,
                c.created_at,
                c.updated_at,
                c.is_open,
                c.default_mode,
                COALESCE(u.username, '') as author_name,
                u.icon_url as author_icon_url,
                u.is_official,
                cs.favorite_count::bigint as favorite_count,
                cs.question_count::bigint as question_count,
                COALESCE(EXISTS (
                    SELECT 1 FROM favorite_collections
                    WHERE user_id = $10::uuid AND collection_id = c.id
                ), false) as is_favorited,
                (
                    SELECT r.rank FROM (
                        SELECT user_id, RANK() OVER (ORDER BY MAX(score) DESC) as rank
                        FROM ranking_records
                        WHERE collection_id = c.id
                        GROUP BY user_id
                    ) r WHERE r.user_id = $10::uuid
                ) as user_rank,
                COALESCE(sm.difficulty_level, 3::smallint)::smallint as difficulty_level,
                COALESCE(sm.tags, '{}'::text[]) as tags
            FROM collections c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN collection_stats cs ON cs.collection_id = c.id
            LEFT JOIN collection_search_metadata sm ON sm.collection_id = c.id
            WHERE
                c.is_open = true
                AND (
                    $1::text IS NULL
                    OR c.name ILIKE ('%' || $1 || '%')
                    OR COALESCE(c.description_text, '') ILIKE ('%' || $1 || '%')
                    OR EXISTS (
                        SELECT 1
                        FROM unnest(COALESCE(sm.tags, '{}'::text[])) t
                        WHERE t ILIKE ('%' || $1 || '%')
                    )
                )
                AND (
                    $2::smallint IS NULL
                    OR COALESCE(sm.difficulty_level, 3::smallint)::smallint >= $2
                )
                AND (
                    $3::smallint IS NULL
                    OR COALESCE(sm.difficulty_level, 3::smallint)::smallint <= $3
                )
                AND (
                    $4::text[] IS NULL
                    OR NOT EXISTS (
                        SELECT 1
                        FROM unnest($4::text[]) req
                        WHERE NOT EXISTS (
                            SELECT 1
                            FROM unnest(COALESCE(sm.tags, '{}'::text[])) t
                            WHERE lower(t) = req
                        )
                    )
                )
            ORDER BY
                CASE WHEN $5::bool THEN COALESCE(cs.favorite_count, 0) END DESC,
                CASE WHEN $6::bool THEN COALESCE(sm.difficulty_level, 3::smallint)::smallint END ASC,
                CASE WHEN $7::bool THEN COALESCE(sm.difficulty_level, 3::smallint)::smallint END DESC,
                c.created_at DESC
            LIMIT $8 OFFSET $9;
            "#,
        )
        .bind(query_text)
        .bind(difficulty_min)
        .bind(difficulty_max)
        .bind(tags_filter)
        .bind(is_popular_sort)
        .bind(is_difficulty_asc_sort)
        .bind(is_difficulty_desc_sort)
        .bind(limit)
        .bind(offset)
        .bind(requester_id)
        .fetch_all(pool)
        .await?;

        Ok(collections)
    }

    pub async fn get_popular_tags(
        pool: &PgPool,
        limit: i64,
        query: Option<String>,
    ) -> Result<Vec<crate::dtos::collection_dto::PopularTagResponse>, sqlx::Error> {
        let query_text = query
            .map(|q| q.trim().to_string())
            .filter(|q| !q.is_empty());

        let tags = sqlx::query_as::<_, crate::dtos::collection_dto::PopularTagResponse>(
            r#"
            SELECT
                t.tag,
                COUNT(*)::bigint as count
            FROM (
                SELECT unnest(COALESCE(sm.tags, '{}'::text[])) as tag
                FROM collection_search_metadata sm
                JOIN collections c ON c.id = sm.collection_id
                WHERE c.is_open = true
            ) t
            WHERE $2::text IS NULL OR t.tag ILIKE ('%' || $2 || '%')
            GROUP BY t.tag
            ORDER BY COUNT(*) DESC, t.tag ASC
            LIMIT $1;
            "#,
        )
        .bind(limit)
        .bind(query_text)
        .fetch_all(pool)
        .await?;

        Ok(tags)
    }
}
