use crate::dtos::collection_dto::CreateCollectionRequest;
use crate::dtos::question_dto::CreateQuestionRequest;
use crate::repositories::user::find_by_username;
use crate::services::collection_service::CollectionService;
use crate::services::question_service::QuestionService;
use crate::services::user_service::register_user;
use serde::Deserialize;
use sqlx::PgPool;
use std::fs;

#[derive(Deserialize)]
struct SeedData {
    collection: SeedCollection,
    questions: Vec<SeedQuestion>,
}

#[derive(Deserialize)]
struct SeedCollection {
    name: String,
    description: String,
    quiz_type: String,
    is_open: bool,
}

#[derive(Deserialize)]
struct SeedQuestion {
    content: String,
    answer: String,
    note: String,
    display_order: i32,
}

pub async fn seed_official_data(pool: &PgPool) {
    let username = "official_user";
    let password = "dummy_password_that_cannot_be_logged_into_12345!@#";

    match find_by_username(pool, username).await {
        Ok(Some(user)) => {
            // Ensure flag is true if user already existed from before the migration
            if !user.is_official {
                let user_id: uuid::Uuid = user.id;
                sqlx::query!("UPDATE users SET is_official = true WHERE id = $1", user_id)
                    .execute(pool)
                    .await
                    .ok();
            }
            println!("Official user already seeded (id: {})", user.id);
        }
        Ok(None) => {
            println!("Official user not found. Seeding...");
            // Create the official user
            match register_user(pool, username, password).await {
                Ok(user) => {
                    let user_id: uuid::Uuid = user.id;
                    // Update the is_official flag to true
                    sqlx::query!("UPDATE users SET is_official = true WHERE id = $1", user_id)
                        .execute(pool)
                        .await
                        .ok();

                    // Read seed.json
                    if let Ok(file_content) = fs::read_to_string("seed.json") {
                        if let Ok(seeds) = serde_json::from_str::<Vec<SeedData>>(&file_content) {
                            for seed in seeds {
                                // Create Collection
                                let req = CreateCollectionRequest {
                                    name: seed.collection.name,
                                    description_text: Some(seed.collection.description),
                                    is_open: seed.collection.is_open,
                                };
                                if let Ok(collection) =
                                    CollectionService::create_collection(pool, user.id, req).await
                                {
                                    // Pre-set display_order logic in DB actually doesn't use the json field yet,
                                    // but we can just insert them sequentially so they get natural IDs
                                    for q in seed.questions {
                                        let q_req = CreateQuestionRequest {
                                            question_text: q.content,
                                            correct_answer: q.answer,
                                            description_text: Some(q.note),
                                        };
                                        let _ = QuestionService::create_question(
                                            pool,
                                            collection.id,
                                            user.id,
                                            q_req,
                                        )
                                        .await;
                                    }
                                    println!(
                                        "Seeded collection '{}' with questions.",
                                        collection.name
                                    );
                                }
                            }
                        } else {
                            println!("Failed to parse seed.json.");
                        }
                    } else {
                        println!("seed.json not found. Skipping data seeding.");
                    }
                }
                Err(e) => println!("Failed to create official user: {:?}", e),
            }
        }
        Err(e) => println!("Error checking official user: {:?}", e),
    }
}
