package com.example.myapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Async;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.util.ListTransformUtil;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Async
    public CompletableFuture<List<CreateRequest<QuestionInput>>> generateQuestions(String theme,
            String questionFormat, String answerFormat, String questionExample,
            String answerExample, int numQuestions) { // numQuestions を引数として追加
        String prompt = "テーマ: " + theme + "\\n問題のフォーマット: " + questionFormat + "(例: "
                + questionExample + ")\\n" + "回答のフォーマット: " + answerFormat + "(例: " + answerExample
                + ")\\n" + "以下の JSON 形式で" + numQuestions + "問生成してください:\\n" // ここで numQuestions を利用
                + "{ \"questions\": [ { \"question\": \"問題文\", \"answer\": \"解答\", \"description\": \"補足知識(50文字程度)\"}, ... ] }\n"
                + "答えが一意に定まるように, 解答は単語や短いフレーズで、問題文は明確で具体的にしてください。\n";

        log.debug("Prompt for text generation: {}", prompt);

        String apiUrl = UriComponentsBuilder.fromHttpUrl(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent")
                .queryParam("key", apiKey).toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        String requestBody = "{" + "\"contents\": [{" + "\"parts\": [{" + "\"text\": \""
                + prompt.replace("\"", "\\\"") + "\"" + "}]" + "}]" + "}";

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response =
                    restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
            log.debug("Gemini API text generation response: {}", response.getBody());
            return CompletableFuture.completedFuture(parseAiResponse(response.getBody()));
        } catch (Exception e) {
            log.error("AIによるテキストからの問題生成中にエラー発生", e);
            return CompletableFuture.completedFuture(Collections.emptyList());
        }
    }

    @Async
    public CompletableFuture<List<CreateRequest<QuestionInput>>> generateQuizFromPdf(
            byte[] pdfBytes, String theme, int numQuestions) {
        // このメソッドは変更ありませんが、完全性のために含めます
        String prompt = String.format(
            "以下のPDFの内容に基づいて、テーマ「%s」に関するクイズを%d問生成してください。\n" +
            "クイズの形式はJSONフォーマットで、各問題は「question」（問題文）、「answer」（正解）、「description」（補足知識）の3つのキーを持つオブジェクトにしてください。\n" +
            "「description」は50文字程度の簡潔な説明にしてください。\n"  + "答えが一意に定まるように, 解答は単語や短いフレーズで、問題文は明確で具体的にしてください。\n" +
            "JSON形式:\n" +
            "{ \"questions\": [ { \"question\": \"問題文\", \"answer\": \"解答\", \"description\": \"補足知識(50文字程度)\"}, ... ] }"
            , theme, numQuestions);

        log.debug("Prompt for PDF generation: {}", prompt);

        String apiUrl = UriComponentsBuilder.fromHttpUrl(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent")
                .queryParam("key", apiKey).toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

        String requestBody = "{"
            + "\"contents\": [{"
            + "\"parts\": ["
            + "{"
            + "\"inlineData\": {"
            + "\"mimeType\": \"application/pdf\","
            + "\"data\": \"" + base64Pdf + "\""
            + "}"
            + "},"
            + "{"
            + "\"text\": \"" + prompt.replace("\"", "\\\"") + "\""
            + "}"
            + "]"
            + "}]"
            + "}";

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response =
                    restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
            log.debug("Gemini API PDF generation response: {}", response.getBody());
            return CompletableFuture.completedFuture(parseAiResponse(response.getBody()));
        } catch (Exception e) {
            log.error("AIによるPDFからの問題生成中にエラー発生", e);
            return CompletableFuture.completedFuture(Collections.emptyList());
        }
    }

    private List<CreateRequest<QuestionInput>> parseAiResponse(String responseBody) {
        // このメソッドは変更ありません
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);

            String rawJson = jsonNode.get("candidates").get(0).get("content").get("parts").get(0)
                    .get("text").asText();
            String cleanedJson = rawJson.replaceAll("```json", "").replaceAll("```", "").trim();
            cleanedJson = cleanedJson.replaceAll(",\\s*\\]\\s*}\\s*$", "]}");


            JsonNode parsedJson = objectMapper.readTree(cleanedJson);

            List<QuestionInput> questionInputs = new ArrayList<>();
            if (parsedJson.has("questions") && parsedJson.get("questions").isArray()) {
                for (JsonNode node : parsedJson.get("questions")) {
                    if (node.has("question") && node.has("answer") && node.has("description")) {
                        String questionText = node.get("question").asText();
                        String correctAnswer = node.get("answer").asText();
                        String descriptionText = node.get("description").asText();

                        QuestionInput question =
                                new QuestionInput(questionText, correctAnswer, descriptionText);
                        questionInputs.add(question);
                    } else {
                        log.warn("AIレスポンス内の問題オブジェクトに不足しているフィールドがあります: {}", node.toString());
                    }
                }
            } else {
                log.warn("AIレスポンスに 'questions' 配列が見つからないか、不正な形式です: {}", parsedJson.toString());
            }
            return ListTransformUtil.toCreateRequest(questionInputs);
        } catch (Exception e) {
            log.error("AIレスポンスのパース中にエラー発生", e);
            return Collections.emptyList();
        }
    }
}
