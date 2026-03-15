# AiQ プロジェクト開発ルール

AiQプロジェクトにおける、フロントエンド、バックエンド、および開発プロセスの重要ルールを以下に定めます。

## 1. コミュニケーションと報告
- **言語**: 全てのアーティファクト（`implementation_plan.md`, `task.md`, `walkthrough.md`）およびユーザーへの報告は、必ず**日本語**で行うこと。
- **透明性**: 開発の進捗は `task.md` で管理し、大きな変更の前には `implementation_plan.md` での合意形成を行うこと。

## 2. フロントエンド実装ルール
このプロジェクトでは、FSD (Feature-Sliced Design) と独自のデザインシステムを採用しています。

### 2.1 BaseComponent の使用徹底
- **禁止事項**: 素の HTML タグ（`div`, `span`, `input`, `button` など）を直接使用することは禁止する。
- **必須事項**: 必ず `src/design` 以下の **`BaseComponent`**（`primitives` および `baseComponents`）を使用すること。
    - **レイアウト primitives**:
        - `View`: 基本的なボックス要素（`div` の代替）
        - `Flex`: Flexboxレイアウト
        - `Stack`: 等間隔の積み重ねレイアウト（デフォルト `column`）
        - `Grid`: Gridレイアウト
        - `Container`: コンテンツ幅を制限するコンテナ
    - **UI baseComponents**:
        - `Text`: 文字表示（`p`, `h1`-`h6`, `span` の代替）
        - `Button`, `IconButton`: ボタン要素
        - `Input`, `TextArea`, `Select`: 入力要素
        - `Card`, `Badge`, `Divider` など: 装飾・構造要素
- **原則**: コンポーネントは可能な限り細かく分割し、単一責任の原則に従って保守性を高めること。

## 3. 開発環境とコマンド実行
- **コマンド実行**: `run_command` 等でコマンド（特に `cargo test` や長時間実行されるプロセス）を実行する際は、プロセスのフリーズを防ぐため、必ず **`bash -c "コマンド"`** の形式で実行すること。
- **バックエンド**: Rustを使用し、`src/handlers`, `src/services`, `src/repositories` などのレイヤーに分かれている。SQLクエリは `.sql` ファイルに外出しされている（`src/queries`）。

## 4. ディレクトリ構成 (src)
- `design/`: トークン、プリミティブ、ベースコンポーネント
- `entities/`: ビジネスドメインごとのデータ構造
- `features/`: ユーザー機能ごとのスライス（UI, API, Modelを含む）
- `shared/`: アプリ全体で共有されるユーティリティ、フック、API定義
