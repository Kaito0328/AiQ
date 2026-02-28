use crate::dtos::collection_dto::CreateCollectionRequest;
use crate::dtos::question_dto::CreateQuestionRequest;
use crate::repositories::user::find_by_username;
use crate::services::collection_service::CollectionService;
use crate::services::question_service::QuestionService;
use crate::services::user_service::register_user;
use crate::error::AppError;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;
use std::fs;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ManifestUser {
    username: String,
    display_name: String,
    bio: String,
    collections: Vec<ManifestCollection>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ManifestCollection {
    name: String,
    description: String,
    csv_file: String,
}

#[derive(Deserialize)]
struct ManifestCollectionSet {
    owner: String,
    name: String,
    collections: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Manifest {
    users: Vec<ManifestUser>,
    follows: Vec<(String, String)>,
    favorites: Vec<(String, String)>,
    collection_sets: Vec<ManifestCollectionSet>,
}

pub async fn seed_data(pool: &PgPool) {
    // 1. Official User Setup
    let official_username = "official_user";
    let official_password = std::env::var("OFFICIAL_USER_PASSWORD")
        .unwrap_or_else(|_| "dummy_password_that_cannot_be_logged_into_12345!@#".to_string());

    let _ = ensure_user(pool, official_username, &official_password, true).await;

    // 2. Read Manifest
    let manifest_path = "seeds/manifest.json";
    let file_content = match fs::read_to_string(manifest_path) {
        Ok(c) => c,
        Err(_) => {
            println!("manifest.json not found at {}. Skipping seeding.", manifest_path);
            return;
        }
    };

    let manifest: Manifest = match serde_json::from_str(&file_content) {
        Ok(m) => m,
        Err(e) => {
            println!("Failed to parse manifest: {}", e);
            return;
        }
    };

    let dummy_password = std::env::var("DUMMY_USER_PASSWORD").unwrap_or_else(|_| "demo1234".to_string());
    let force_reseed = std::env::var("RESEED_DUMMY_DATA").map(|v| v == "true").unwrap_or(false);

    // 3. Create Users and Collections
    for m_user in manifest.users {
        if let Ok(user) = ensure_user(pool, &m_user.username, &dummy_password, false).await {
            // Update profile
            let _ = crate::repositories::user::update_profile(
                pool,
                user.id,
                None, // username
                Some(m_user.display_name),
                Some(m_user.bio),
                None, // icon_url
            ).await;

            for m_coll in m_user.collections {
                // Determine if we should delete existing
                if force_reseed {
                    if let Ok(Some(existing)) = sqlx::query!(
                        "SELECT id FROM collections WHERE user_id = $1 AND name = $2",
                        user.id,
                        m_coll.name
                    ).fetch_optional(pool).await {
                        println!("Force Reseed: Deleting collection '{}' for user '{}'.", m_coll.name, user.username);
                        let _ = CollectionService::delete_collection(pool, existing.id, user.id).await;
                    }
                }

                // Check if collection already exists for this user
                let existing = sqlx::query!(
                    "SELECT id FROM collections WHERE user_id = $1 AND name = $2",
                    user.id,
                    m_coll.name
                ).fetch_optional(pool).await.ok().flatten();

                if existing.is_none() {
                    let req = CreateCollectionRequest {
                        name: m_coll.name,
                        description_text: Some(m_coll.description),
                        is_open: true,
                    };
                    if let Ok(collection) = CollectionService::create_collection(pool, user.id, req).await {
                        // Import CSV
                        let csv_path = format!("seeds/questions/{}", m_coll.csv_file);
                        if let Ok(csv_bytes) = fs::read(csv_path) {
                            if let Ok(items) = crate::services::csv_service::CsvService::parse_csv(&csv_bytes) {
                                for item in items {
                                    let q_req = CreateQuestionRequest {
                                        question_text: item.question_text.unwrap_or_default(),
                                        correct_answers: item.correct_answers.unwrap_or_default(),
                                        description_text: item.description_text,
                                    };
                                    let _ = QuestionService::create_question(pool, collection.id, user.id, q_req).await;
                                }
                            }
                        }
                        println!("Seeded collection '{}' for user '{}'.", collection.name, user.username);
                    }
                }
            }
        }
    }

    // 4. Seeding Relationships (Follows)
    for (follower_name, followee_name) in manifest.follows {
        if let (Ok(Some(follower)), Ok(Some(followee))) = (find_by_username(pool, &follower_name).await, find_by_username(pool, &followee_name).await) {
            let _ = crate::repositories::follow::follow_user(pool, follower.id, followee.id).await;
        }
    }

    // 5. Seeding Favorites
    for (username, collection_name) in manifest.favorites {
        if let (Ok(Some(user)), Ok(Some(collection))) = (
            find_by_username(pool, &username).await,
            sqlx::query!("SELECT id FROM collections WHERE name = $1 LIMIT 1", collection_name).fetch_optional(pool).await
        ) {
            let collection_id = collection.id;
            // Directly insert into favorites if not exists
            let _ = sqlx::query!(
                "INSERT INTO favorite_collections (user_id, collection_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                user.id,
                collection_id
            ).execute(pool).await;
        }
    }

    // 6. Seeding Collection Sets
    for m_set in manifest.collection_sets {
        if let Ok(Some(owner)) = find_by_username(pool, &m_set.owner).await {
            // Check if exists
            let set_id = if let Ok(Some(existing)) = sqlx::query!(
                "SELECT id FROM collection_sets WHERE user_id = $1 AND name = $2",
                owner.id,
                m_set.name
            ).fetch_optional(pool).await {
                existing.id
            } else {
                match sqlx::query!(
                    "INSERT INTO collection_sets (user_id, name) VALUES ($1, $2) RETURNING id",
                    owner.id,
                    m_set.name
                ).fetch_one(pool).await {
                    Ok(r) => r.id,
                    Err(_) => continue,
                }
            };

            for coll_name in m_set.collections {
                if let Ok(Some(coll)) = sqlx::query!("SELECT id FROM collections WHERE name = $1 LIMIT 1", coll_name).fetch_optional(pool).await {
                    let _ = sqlx::query!(
                        "INSERT INTO collection_set_collections (collection_set_id, collection_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                        set_id,
                        coll.id
                    ).execute(pool).await;
                }
            }
        }
    }

    // 7. Seed mock resumable quizzes and edit requests for official user (for UI testing)
    if let Ok(Some(official)) = find_by_username(pool, "official_user").await {
        // Only seed if none exist to avoid bloat
        let existing_quizzes = sqlx::query!("SELECT COUNT(*) as count FROM casual_quizzes WHERE user_id = $1", official.id)
            .fetch_one(pool)
            .await
            .map(|r| r.count.unwrap_or(0))
            .unwrap_or(0);

        if existing_quizzes == 0 {
            let mock_colls = ["世界史：ルネサンス", "心理学入門", "TypeScript発展", "ワインの知識"];
            for (i, &name) in mock_colls.iter().enumerate() {
                let _ = sqlx::query!(
                    "INSERT INTO casual_quizzes (user_id, collection_names, total_questions, answered_question_ids, is_active) VALUES ($1, $2, $3, $4, true)",
                    official.id,
                    &[name.to_string()],
                    20,
                    &[Uuid::new_v4(); 7][..] 
                ).execute(pool).await;
            }
        }

        let existing_requests = sqlx::query!("SELECT COUNT(*) as count FROM edit_requests WHERE requester_id = $1", official.id)
            .fetch_one(pool)
            .await
            .map(|r| r.count.unwrap_or(0))
            .unwrap_or(0);

        if existing_requests == 0 {
            // Fetch some real questions from different collections to make requests realistic
            let mock_req_data = [
                ("世界史：ルネサンス", "レオナルド・ダ・ヴィンチの生年を1452年に修正してください"),
                ("心理学入門", "マズローの欲求階層説の第4段階の説明を補足したいです"),
                ("TypeScript発展", "Genericsの例題に型制約の説明を追加してください"),
                ("ワインの知識", "シャブリの産地情報をより詳細に修正してください")
            ];

            for (coll_name, req_text) in mock_req_data.iter() {
                if let Ok(Some(question)) = sqlx::query!(
                    "SELECT q.id FROM questions q JOIN collections c ON q.collection_id = c.id WHERE c.name = $1 LIMIT 1",
                    coll_name
                ).fetch_optional(pool).await {
                    let _ = sqlx::query!(
                        "INSERT INTO edit_requests (question_id, requester_id, question_text, correct_answers, reason_id, status) VALUES ($1, $2, $3, $4, 1, 'pending')",
                        question.id,
                        official.id,
                        req_text,
                        &vec!["修正済みの内容が入ります".to_string()]
                    ).execute(pool).await;
                }
            }
        }
    }

    println!("Data seeding completed.");
}

async fn ensure_user(pool: &PgPool, username: &str, password: &str, is_official: bool) -> Result<crate::models::user::User, AppError> {
    match find_by_username(pool, username).await {
        Ok(Some(user)) => {
            if is_official && !user.is_official {
                sqlx::query!("UPDATE users SET is_official = true WHERE id = $1", user.id)
                    .execute(pool)
                    .await
                    .ok();
            }
            Ok(user)
        }
        _ => {
            let user = register_user(pool, username, password).await?;
            if is_official {
                sqlx::query!("UPDATE users SET is_official = true WHERE id = $1", user.id)
                    .execute(pool)
                    .await
                    .ok();
            }
            Ok(user)
        }
    }
}
