package com.example.myapp.initializer;

import com.example.myapp.auth.OfficialUserManager;
import com.example.myapp.dto.Item.Collection.CollectionInput;
import com.example.myapp.dto.Item.CollectionSet.CollectionSetInput;
import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.CollectionSetService;
import com.example.myapp.service.QuestionService;
import com.example.myapp.util.CsvParser;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import java.io.FileInputStream;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

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
            User officialUser = OfficialUserManager.getOfficialUser();

            for (File collectionSetDir : collectionSetDirs) {
                String collectionSetName = collectionSetDir.getName();
                Optional<CollectionSet> collectionSetOpt = collectionSetService
                        .findByUserAndName(officialUser, collectionSetName);
                CollectionSet collectionSet;
                    
                if (!collectionSetOpt.isPresent()) {
                    CollectionSetInput collectionSetInput = new CollectionSetInput(collectionSetName);
                    collectionSet = collectionSetService.createCollectionSet(collectionSetInput, officialUser);
                } else {
                    collectionSet = collectionSetOpt.get();
                }
                
                collectionSetService.changeVisibility(collectionSet, true);

                File[] csvFiles = collectionSetDir.listFiles((dir, name) -> name.endsWith(".csv"));
                if (csvFiles != null) {
                    for (File csvFile : csvFiles) {
                        String collectionName = csvFile.getName().replace(".csv", "");

                        if (collectionService.alreadyExists(collectionSet, collectionName))
                            continue;

                        CollectionInput collectionInput = new CollectionInput(collectionName, true);
                        Collection collection = collectionService.createCollection(collectionInput, collectionSet, officialUser);

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
