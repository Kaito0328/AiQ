use sqlx::PgPool;
use uuid::Uuid;

use crate::dtos::question_dto::{CreateQuestionRequest, UpdateQuestionRequest};
use crate::models::question::Question;
use crate::repositories::collection::CollectionRepository;
use crate::repositories::question::QuestionRepository;

pub struct QuestionService;

impl QuestionService {
    /// 問題の新規作成
    pub async fn create_question(
        pool: &PgPool,
        collection_id: Uuid,
        user_id: Uuid, // 実行者のID
        req: CreateQuestionRequest,
    ) -> Result<Question, sqlx::Error> {
        // 1. 対象の問題集を取得して、実行者が所有者かどうか確認する
        let collection = CollectionRepository::find_by_id(pool, collection_id).await?;
        if collection.user_id != user_id {
            return Err(sqlx::Error::RowNotFound); // 権限がない場合はエラー
        }

        // 2. 問題を作成
        QuestionRepository::create(
            pool,
            collection_id,
            req.question_text,
            req.correct_answers,
            req.answer_rubis.unwrap_or_default(),
            req.distractors.unwrap_or_default(),
            req.preferred_mode.unwrap_or_else(|| "default".to_string()),
            req.recommended_mode.unwrap_or_else(|| "recall".to_string()),
            req.description_text,
        )
        .await
    }

    pub async fn get_collection_questions(
        pool: &PgPool,
        collection_id: Uuid,
        requester_id: Option<Uuid>, // 追加
    ) -> Result<Vec<Question>, sqlx::Error> {
        // 🌟 まず親であるコレクションを取得し、閲覧権限があるかチェックする
        let collection = CollectionRepository::find_by_id(pool, collection_id).await?;

        if !collection.is_open && requester_id != Some(collection.user_id) {
            return Err(sqlx::Error::RowNotFound); // 親が非公開なら問題も見せない
        }

        QuestionRepository::find_by_collection_id(pool, collection_id).await
    }

    /// 問題の更新
    pub async fn update_question(
        pool: &PgPool,
        question_id: Uuid,
        user_id: Uuid,
        req: UpdateQuestionRequest,
    ) -> Result<Question, sqlx::Error> {
        // 1. 対象の問題を取得
        let question = QuestionRepository::find_by_id(pool, question_id).await?;

        // 2. その問題が属する問題集の所有者を確認
        let collection = CollectionRepository::find_by_id(pool, question.collection_id).await?;
        if collection.user_id != user_id {
            return Err(sqlx::Error::RowNotFound);
        }

        // 3. 更新を実行
        QuestionRepository::update(
            pool,
            question_id,
            req.question_text,
            req.correct_answers,
            req.answer_rubis.unwrap_or_default(),
            req.distractors.unwrap_or_default(),
            req.preferred_mode.unwrap_or_else(|| "default".to_string()),
            req.recommended_mode.unwrap_or_else(|| "recall".to_string()),
            req.description_text,
        )
        .await
    }

    /// 問題の削除
    pub async fn delete_question(
        pool: &PgPool,
        question_id: Uuid,
        user_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        let question = QuestionRepository::find_by_id(pool, question_id).await?;
        let collection = CollectionRepository::find_by_id(pool, question.collection_id).await?;

        if collection.user_id != user_id {
            return Err(sqlx::Error::RowNotFound);
        }

        QuestionRepository::delete(pool, question_id).await
    }

    pub async fn batch_questions(
        pool: &PgPool,
        collection_id: Uuid,
        user_id: Uuid,
        req: crate::dtos::question_dto::BatchQuestionsRequest,
    ) -> Result<(Vec<Question>, u64), sqlx::Error> {
        let collection = CollectionRepository::find_by_id(pool, collection_id).await?;
        if collection.user_id != user_id {
            return Err(sqlx::Error::RowNotFound); // Forbidden
        }

        let upserted =
            QuestionRepository::batch_upsert(pool, collection_id, req.upsert_items).await?;
        let deleted = QuestionRepository::batch_delete(pool, req.delete_ids).await?;

        Ok((upserted, deleted))
    }
}
