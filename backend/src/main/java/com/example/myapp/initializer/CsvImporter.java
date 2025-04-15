package com.example.myapp.initializer;

import com.example.myapp.dto.Item.Collection.CollectionInput;
import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.CollectionSetService;
import com.example.myapp.service.QuestionService;
import com.example.myapp.service.UserService;
import com.example.myapp.util.CsvParser;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import java.io.FileInputStream;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Component
public class CsvImporter {

    private static final String DATA_PATH = "src/main/resources/data/";

    private final CollectionSetService collectionSetService;
    private final CollectionService collectionService;
    private final QuestionService questionService;

    @Autowired
    public CsvImporter(CollectionSetService collectionSetService,
            CollectionService collectionService, QuestionService questionService) {
        this.collectionSetService = collectionSetService;
        this.collectionService = collectionService;
        this.questionService = questionService;
    }

    public void importCsvFiles() throws IOException {
        File dataRoot = new File(DATA_PATH);
        File[] collectionSetDirs = dataRoot.listFiles(File::isDirectory);

        if (collectionSetDirs != null) {
            User officialUser = UserService.getOfficialUser();

            for (File collectionSetDir : collectionSetDirs) {
                CollectionSet collectionSet = collectionSetService
                        .getOrCreateCollectionSet(collectionSetDir.getName(), officialUser);
                collectionSetService.changeVisibility(collectionSet, true);

                File[] csvFiles = collectionSetDir.listFiles((dir, name) -> name.endsWith(".csv"));
                if (csvFiles != null) {
                    for (File csvFile : csvFiles) {
                        String collectionName = csvFile.getName().replace(".csv", "");
                        CollectionInput collectionInput = new CollectionInput(collectionName, true);
                        Collection collection = new Collection(collectionInput, collectionSet);

                        if (collectionService.isDuplicate(collection))
                            continue;

                        collection = collectionService.save(collection);

                        InputStream inputStream = new FileInputStream(csvFile);
                        try {
                            List<CreateRequest<QuestionInput>> createRequests =
                                    CsvParser.parseCsv(inputStream);

                            // 質問を一括で保存
                            if (!createRequests.isEmpty()) {
                                questionService.batchUpsertQuestion(collection, null,
                                        createRequests, officialUser);
                            }
                        } catch (Exception e) {
                            e.printStackTrace(); // エラーログを出力
                        }
                    }
                }
            }
        }
    }
}
