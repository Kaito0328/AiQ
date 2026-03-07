use sqlx::Row;
use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await?;

    println!("--- COLLECTIONS ---");
    let collections = sqlx::query!("SELECT id, name FROM collections").fetch_all(&pool).await?;
    for c in collections {
        let q_count = sqlx::query!("SELECT count(*) as count FROM questions WHERE collection_id = $1", c.id)
            .fetch_one(&pool)
            .await?
            .count
            .unwrap_or(0);
        println!("ID: {}, Name: {}, Questions: {}", c.id, c.name, q_count);
    }

    let target_id_str = "c41f172a-4c5c-46ac-9f51-3cd8b04e68c3";
    if let Ok(id) = Uuid::parse_str(target_id_str) {
        println!("\n--- TESTING ANY OPERATOR ({}) ---", target_id_str);
        let ids = vec![id];
        
        // Using QueryBuilder like in the repository
        let mut builder = sqlx::QueryBuilder::new("SELECT count(*) as count FROM questions WHERE collection_id = ANY(");
        builder.push_bind(&ids);
        builder.push(")");
        
        let row = builder.build().fetch_one(&pool).await?;
        let count: i64 = row.get("count");
        println!("Questions found with ANY: {}", count);
        
        // Using direct query
        let count2 = sqlx::query!("SELECT count(*) as count FROM questions WHERE collection_id = ANY($1)", &ids)
            .fetch_one(&pool).await?.count.unwrap_or(0);
        println!("Questions found with direct query ANY: {}", count2);
    }

    Ok(())
}
