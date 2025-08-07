# AiQ Backend

## アプリケーション概要

このアプリケーションは、学習者が自分だけのクイズ問題集を作成・管理・学習できるWebアプリケーションのバックエンドAPIです。

### 主な機能

**問題・コレクション管理**
- 問題の作成、編集、削除
- 問題をテーマごとにまとめた「コレクション」の管理
- コレクションをさらに分類する「コレクションセット」機能
- 問題の公開・非公開設定による共有機能

**AI問題生成**
- Google Gemini AIを活用した自動問題生成
- テキスト入力からの問題作成
- PDFファイルアップロードからの問題抽出
- CSVファイルからの一括問題インポート

**クイズ機能**
- カスタムクイズの作成・実行
- 問題の並び順やフィルタリング設定
- 解答履歴の記録・管理
- クイズの中断・再開機能

**ソーシャル機能**
- ユーザー登録・認証（JWT認証）
- 他ユーザーのフォロー・フォロワー機能
- コレクションのお気に入り登録
- 公開されたコレクションの閲覧

**学習記録**
- 解答履歴の統計情報
- ユーザーごとの学習進捗管理
- クイズ結果の保存・分析

## 使用技術・環境

### フレームワーク・ライブラリ
- **Java 21** - プログラミング言語
- **Spring Boot 3.2.2** - Webアプリケーションフレームワーク
- **Spring Data JPA** - データアクセス層
- **Spring Security** - セキュリティ・認証
- **Spring WebSocket** - リアルタイム通信（AI生成進捗通知）
- **QueryDSL** - タイプセーフなクエリ構築
- **Lombok** - ボイラープレートコード削減

### データベース・永続化
- **PostgreSQL** - メインデータベース
- **Flyway** - データベースマイグレーション管理
- **Hibernate** - JPA実装

### 認証・セキュリティ
- **JWT (JSON Web Token)** - 認証トークン
- **BCrypt** - パスワードハッシュ化

### 外部API・サービス
- **Google Gemini API** - AI問題生成
- **WebSocket** - リアルタイム通信

### 開発・ビルドツール
- **Gradle** - ビルドツール
- **Spring Boot DevTools** - 開発効率化
- **Docker** - コンテナ化対応

## 開発環境セットアップ

### 前提条件
- **Java 21** 以上
- **Docker** & **Docker Compose** (データベース用)

### 1. データベース起動
```bash
# PostgreSQLをDockerで起動
docker-compose up db
```

### 2. 環境変数設定
```bash
# backend/.env ファイルを作成
# GEMINI_API_KEY=your-gemini-api-key
# JWT_SECRET=your-jwt-secret-key
...
```

### 3. アプリケーション起動
```bash
cd backend
./gradlew bootRun
```

### 4. アクセス確認
- **API**: http://localhost:8080

## データベース設計

### 主要テーブル構成

#### ユーザー関連
```
users (ユーザー情報)
├── id (PK)
├── username (ユニーク)
├── email
├── password (ハッシュ化)
├── user_stats_id (FK) → user_stats
├── created_at, updated_at

user_stats (ユーザー統計)
├── id (PK)
├── follower_count
├── following_count

follows (フォロー関係)
├── follower_id (FK) → users
├── followee_id (FK) → users
└── created_at
```

#### コンテンツ管理
```
collection_sets (コレクションセット)
├── id (PK)
├── name
├── open (公開フラグ)
├── description_text
├── user_id (FK) → users
└── created_at, updated_at

collections (問題集)
├── id (PK)
├── name
├── open (公開フラグ)
├── description_text
├── collection_set_id (FK) → collection_sets
├── collection_stats_id (FK) → collection_stats
└── created_at, updated_at

questions (問題)
├── id (PK)
├── question_text
├── correct_answer
├── description_text
├── collection_id (FK) → collections
└── created_at, updated_at
```

#### クイズ・学習記録
```
casual_quiz (カスタムクイズ)
├── id (PK)
├── user_id (FK) → users
├── filter_types (問題フィルタ設定)
├── sort_keys (並び順設定)
├── collection_names (対象コレクション)
├── total_questions
└── created_at, updated_at

answer_history (解答履歴)
├── answer_id (PK)
├── user_id (FK) → users
├── quiz_id (FK) → casual_quiz
├── question_id (FK) → questions
├── user_answer
├── is_correct
└── created_at

```

### 設計思想

#### 階層構造設計
- **CollectionSet → Collection → Question** の3層構造
- ユーザーが大きなテーマ（例：「英語学習」）の下に細かいトピック（例：「TOEIC単語」「文法」）を整理可能
- 権限管理も階層に応じて細かく制御

#### 柔軟なクイズシステム
- `CasualQuiz`で様々な条件でのクイズ作成に対応
- 問題のフィルタリング、ソート機能
- 複数コレクションからの出題に対応
- 中断・再開機能付き

#### 拡張性を考慮した設計
- `BaseTimeEntity`による共通タイムスタンプ管理
- 統計情報の分離（`UserStats`, `CollectionStats`）
- お気に入り機能（`FavoriteCollection`）の独立テーブル化

#### パフォーマンス最適化
- QueryDSLによるタイプセーフなクエリ
- 適切なインデックス設計（ユニーク制約等）
- フェッチタイプの最適化（EAGER/LAZY）

## Java コード設計思想

### アーキテクチャパターン
- **レイヤードアーキテクチャ**採用
  - Controller（プレゼンテーション層）
  - Service（ビジネスロジック層）
  - Repository（データアクセス層）
  - Model（ドメイン層）

### 主要設計原則

#### 1. 責任の分離
```java
@RestController  // HTTP通信の責任
@Service        // ビジネスロジックの責任  
@Repository     // データアクセスの責任
@Entity         // ドメインモデルの責任
```

#### 2. DTOパターンの活用
- 入力用：`QuestionInput`, `CollectionInput`等
- 出力用：`QuestionOutput`, `CollectionOutput`等
- レスポンス用：`QuizStartResponse`, `BatchUpsertResponse`等
- APIレイヤーとビジネスロジック層の分離

#### 3. 例外処理の統一
```java
@ControllerAdvice  // グローバル例外ハンドリング
CustomException    // 独自例外クラス
ErrorCode         // エラーコードの列挙
```

#### 4. セキュリティ設計
```java
@AuthenticationPrincipal CustomUserDetails  // ユーザー認証情報
PermissionCheck.checkManagePermission()      // 権限チェックの統一
```

#### 5. 非同期処理
```java
@Async                    // AI問題生成の非同期実行
CompletableFuture<>      // 非同期結果の管理
WebSocketHandler         // 進捗のリアルタイム通知
```

#### 6. バッチ処理最適化
```java
BatchUpsertRequest<>     // 一括更新・作成
BatchDeleteResponse<>    // 一括削除
BatchUpsertResponse<>    // バッチ処理結果
```

#### 7. QueryDSL活用
- コンパイル時のクエリ検証
- タイプセーフなデータベースアクセス
- 複雑な検索条件の構築

### ユーティリティクラス設計
- `ListTransformUtil` - データ変換の共通化
- `PermissionCheck` - 権限チェックロジックの共通化
- `UserService.getLoginUser()` - ログインユーザー取得の統一

この設計により、保守性・拡張性・テスタビリティを確保し、チーム開発に適したコードベースを実現しています。

## テスト

### テスト構成
プロジェクトには包括的なテストスイートが含まれており、APIの動作を検証します。

#### テストカバレッジ
- **コントローラーテスト** - 各REST APIエンドポイントの動作検証
- **サービステスト** - ビジネスロジックの単体テスト
- **統合テスト** - データベースを含む完全な機能テスト

#### 主要テストクラス
- `AuthControllerTest` - 認証・登録API
- `UserControllerTest` - ユーザー管理API
- `CollectionSetControllerTest` - コレクションセット管理API
- `CollectionControllerTest` - コレクション管理API
- `QuestionControllerTest` - 問題管理API
- `QuizControllerTest` - クイズ実行API
- `FollowControllerTest` - フォロー機能API
- `QuestionGenerationControllerTest` - AI問題生成API
- `UserServiceTest` - ユーザーサービスロジック

#### テスト技術スタック
- **JUnit 5** - テストフレームワーク
- **MockMvc** - Spring MVCテスト
- **H2 Database** - インメモリテストデータベース
- **Mockito** - モックライブラリ
- **Spring Security Test** - セキュリティテスト
- **TestContainers** - 統合テスト用コンテナ

### テスト実行
```bash
# 全テスト実行
./gradlew test

# 特定のテストクラス実行
./gradlew test --tests "AuthControllerTest"

# テスト詳細出力
./gradlew test --info
```

### テスト設計方針
- **Given-When-Then** パターンによる明確なテスト構造
- **認証が必要なAPI**と**未認証でアクセス可能なAPI**の両方をテスト
- **正常系**と**異常系**の両方をカバー
- **境界値テスト**による入力値検証
- **モック**を活用した外部サービス（Gemini API）のテスト
