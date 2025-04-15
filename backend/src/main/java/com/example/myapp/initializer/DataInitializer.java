package com.example.myapp.initializer;

import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import com.example.myapp.service.UserService;
import org.springframework.boot.ApplicationArguments;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private CsvImporter csvImporter;

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("=== Data Initialization Started ===");

        // 1. 公式ユーザーを作成
        userService.saveOfficialUser();
        System.out.println("Official user initialized.");

        // CSVデータのインポート（エラーハンドリング付き）
        try {
            csvImporter.importCsvFiles();
            System.out.println("CSV data imported successfully.");
        } catch (IOException e) {
            System.err.println("Error importing CSV files: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("=== Data Initialization Completed ===");
    }
}
