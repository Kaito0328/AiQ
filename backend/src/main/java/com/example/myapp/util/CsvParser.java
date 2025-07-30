package com.example.myapp.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.dto.Item.Request.CreateRequest;

public final class CsvParser {
    public static List<CreateRequest<QuestionInput>> parseCsv(InputStream inputStream)
            throws Exception {
        List<QuestionInput> questionInputs = new ArrayList<>();
        try (BufferedReader br =
                new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            String[] headers = null;
            int questionIndex = 0, answerIndex = 1, descriptionIndex = 2; // デフォルトのカラム位置を2に設定

            List<String[]> rows = new ArrayList<>();

            while ((line = br.readLine()) != null) {
                String[] columns = line.split(",");
                if (isFirstLine) {
                    isFirstLine = false;

                    // ヘッダーかどうかを判定
                    if (columns.length > 1 && columns[0].toLowerCase().contains("question")
                            && columns[1].toLowerCase().contains("answer")) {
                        headers = columns;

                        // 動的にインデックスを設定
                        for (int i = 0; i < headers.length; i++) {
                            String header = headers[i].trim().toLowerCase();
                            if (header.equals("question")) {
                                questionIndex = i;
                            } else if (header.equals("answer")) {
                                answerIndex = i;
                            } else if (header.equals("description")) {
                                descriptionIndex = i;
                            }
                        }
                        continue; // ヘッダー行をスキップ
                    }
                }
                rows.add(columns);
            }

            // データ行を処理
            for (String[] columns : rows) {
                if (columns.length > Math.max(questionIndex, answerIndex)) {
                    String questionText = columns[questionIndex].trim();
                    String correctAnswer = columns[answerIndex].trim();
                    String descriptionText = (descriptionIndex < columns.length) // カラム数を超えないようにチェック
                            ? columns[descriptionIndex].trim()
                            : null;

                    QuestionInput questionInput =
                            new QuestionInput(questionText, correctAnswer, descriptionText);
                    questionInputs.add(questionInput);
                }
            }
        }
        return ListTransformUtil.toCreateRequest(questionInputs);
    }
}
