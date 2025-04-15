package com.example.myapp.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.service.CsvUploadService;
import com.example.myapp.util.CsvParser;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.stereotype.Service;

@Service
public class CsvUploadService {
    public List<CreateRequest<QuestionInput>> parseCsvFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            List<CreateRequest<QuestionInput>> questionCreateRequests =
                    CsvParser.parseCsv(inputStream);
            return questionCreateRequests;
        } catch (IOException e) {
            e.printStackTrace(); // エラーログを出力
            return null; // エラー発生時は null を返す
        } catch (Exception e) {
            e.printStackTrace(); // エラーログを出力
            return null; // エラー発生時は null を返す
        }
    }
}
