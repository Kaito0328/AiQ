#[tokio::test]
#[ignore]
async fn test_gemini_api_direct() {
    // This test actually calls the Gemini API.
    // Run it with: `cargo test test_gemini_api_direct -- --ignored`
    // Make sure `GEMINI_API_KEY` is set in your environment.

    dotenvy::dotenv().ok();
    if std::env::var("GEMINI_API_KEY").is_err() {
        println!("Skipping Gemini API test because GEMINI_API_KEY is not set.");
        return;
    }

    let prompt = "Rustの所有権について、専門用語を少なくして簡単な問題を生成してください。";
    let count = 2;

    match backend::services::ai_service::AiService::generate_questions(prompt, count).await {
        Ok(questions) => {
            assert_eq!(questions.len(), 2);
            println!("Generated Questions: {:?}", questions);
        }
        Err(e) => {
            panic!("AI generation failed: {:?}", e);
        }
    }
}
