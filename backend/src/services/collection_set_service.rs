use sqlx::PgPool;
use uuid::Uuid;

use crate::dtos::collection_set_dto::{
    AddCollectionToSetRequest, CreateCollectionSetRequest, UpdateCollectionSetRequest,
};
use crate::models::collection::CollectionSet;
use crate::repositories::collection_set::CollectionSetRepository;

pub struct CollectionSetService;

impl CollectionSetService {
    /// まとめ枠の新規作成
    pub async fn create_set(
        pool: &PgPool,
        user_id: Uuid,
        req: CreateCollectionSetRequest,
    ) -> Result<CollectionSet, sqlx::Error> {
        CollectionSetRepository::create(pool, user_id, req.name, req.description_text, req.is_open)
            .await
    }

    pub async fn get_set(
        pool: &PgPool,
        set_id: Uuid,
        requester_id: Option<Uuid>, // 追加
    ) -> Result<crate::dtos::collection_set_dto::CollectionSetResponse, sqlx::Error> {
        let set = CollectionSetRepository::find_by_id(pool, set_id).await?;

        // 🌟 判定ロジック
        if !set.is_open && requester_id != Some(set.user_id) {
            return Err(sqlx::Error::RowNotFound);
        }

        let collections = CollectionSetRepository::find_collections_by_set_id(pool, set_id).await?;

        Ok(crate::dtos::collection_set_dto::CollectionSetResponse { set, collections })
    }

    pub async fn get_user_sets(
        pool: &PgPool,
        target_user_id: Uuid,
        requester_id: Option<Uuid>, // 追加
    ) -> Result<Vec<CollectionSet>, sqlx::Error> {
        let sets = CollectionSetRepository::find_by_user_id(pool, target_user_id).await?;
        let is_owner = requester_id == Some(target_user_id);

        // 🌟 フィルタリング
        let filtered = sets.into_iter().filter(|s| s.is_open || is_owner).collect();

        Ok(filtered)
    }

    /// まとめ枠の更新
    pub async fn update_set(
        pool: &PgPool,
        set_id: Uuid,
        user_id: Uuid,
        req: UpdateCollectionSetRequest,
    ) -> Result<CollectionSet, sqlx::Error> {
        // Repository側で「user_idが一致するもののみ更新」となっているため安全です
        CollectionSetRepository::update(
            pool,
            set_id,
            user_id,
            req.name,
            req.description_text,
            req.is_open,
        )
        .await
    }

    /// まとめ枠の削除
    pub async fn delete_set(
        pool: &PgPool,
        set_id: Uuid,
        user_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        CollectionSetRepository::delete(pool, set_id, user_id).await
    }

    pub async fn add_collection(
        pool: &PgPool,
        set_id: Uuid,
        user_id: Uuid,
        req: AddCollectionToSetRequest,
    ) -> Result<(), sqlx::Error> {
        // 追加先のまとめ枠が自分のものであるかチェック
        let set = CollectionSetRepository::find_by_id(pool, set_id).await?;
        if set.user_id != user_id {
            return Err(sqlx::Error::RowNotFound);
        }

        // ここで Collection が公開されているか自信のものかチェックする
        let collection = crate::repositories::collection::CollectionRepository::find_by_id(pool, req.collection_id).await?;
        if !collection.is_open && collection.user_id != user_id {
            return Err(sqlx::Error::RowNotFound);
        }

        CollectionSetRepository::add_collection(pool, set_id, req.collection_id, req.display_order)
            .await
    }

    /// まとめ枠から問題集を外す
    pub async fn remove_collection(
        pool: &PgPool,
        set_id: Uuid,
        collection_id: Uuid,
        user_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        // 外そうとしているまとめ枠が自分のものであるかチェック
        let set = CollectionSetRepository::find_by_id(pool, set_id).await?;
        if set.user_id != user_id {
            return Err(sqlx::Error::RowNotFound);
        }

        CollectionSetRepository::remove_collection(pool, set_id, collection_id).await
    }
}
