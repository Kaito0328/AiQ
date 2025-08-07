# AiQ Frontend

## アプリケーション概要

このアプリケーションは、学習者が自分だけのクイズ問題集を作成・管理・学習できるWebアプリケーションのフロントエンドです。React + TypeScript + Viteで構築されたモダンなSPAアプリケーションです。

### 主な機能

** 問題・コレクション管理UI**
- 直感的な問題作成・編集・削除インターフェース
- コレクション・コレクションセットの階層表示

** AI問題生成インターフェース**
- シンプルなテキスト入力フォーム
- PDFファイルのドラッグ&ドロップアップロード
- CSVファイルのバッチインポート機能
- WebSocketによる生成進捗の通知

** インタラクティブクイズ**
- レスポンシブなクイズ実行画面
- 直感的な設定画面（フィルタ・ソート・対象選択）

** ソーシャル機能UI**
- ユーザープロフィール画面
- フォロー・フォロワー管理
- 公開コレクションのお気に入り

##  使用技術・環境

### フロントエンドフレームワーク・ライブラリ
- **React 19** - UIライブラリ
- **TypeScript** - 型安全なJavaScript
- **Vite** - 高速ビルドツール
- **React Router DOM** - クライアントサイドルーティング

### UI・スタイリング
- **Tailwind CSS** - ユーティリティファーストCSSフレームワーク
- **Framer Motion** - アニメーションライブラリ
- **Lucide React** - アイコンライブラリ
- **React Icons** - 追加アイコンライブラリ
- **Font Awesome** - アイコンライブラリ

### ユーザーインターフェース
- **@dnd-kit** - ドラッグ&ドロップ機能
- **clsx** - 条件付きクラス名管理

### 開発ツール
- **ESLint** - コード品質チェック
- **Prettier** - コードフォーマッター
- **PostCSS** - CSS後処理
- **TypeScript ESLint** - TypeScript用リンター

##  アーキテクチャ設計

### プロジェクト構造
```
src/
├── api/               # API通信層
├── assets/            # 静的アセット
├── components/        # 再利用可能コンポーネント
│   ├── auth/          # 認証関連コンポーネント
│   ├── baseComponents/# 基底UIコンポーネント
│   ├── common/        # 共通コンポーネント
│   ├── containerComponents/ # コンテナコンポーネント
│   ├── home/          # ホーム画面コンポーネント
│   ├── Layout/        # レイアウトコンポーネント
│   ├── LearningItem/  # 学習アイテムコンポーネント
│   ├── quiz/          # クイズ関連コンポーネント
│   ├── quiz-option/   # クイズオプションコンポーネント
│   └── User/          # ユーザー関連コンポーネント
├── contexts/          # React Context
├── hooks/             # カスタムフック
├── pages/             # ページコンポーネント
├── provider/          # Context Provider
├── routes/            # ルーティング設定
├── style/             # スタイル定義
├── styleMap/          # スタイルマッピング
└── types/             # TypeScript型定義
```

### 設計原則

#### 1. コンポーネント設計
- **Atomic Design**パターンの採用
- **再利用可能**なベースコンポーネント
- **責任の分離**（Container/Presentational）

#### 2. 状態管理
```typescript
// Context + Custom Hooks パターン
useLoginUser()     // ログインユーザー状態
useOfficialUser()  // 公式ユーザー状態  
useUser()         // ユーザー情報状態
```

#### 3. 型安全性
```typescript
// 厳密な型定義
types/user.ts           // ユーザー型
types/collection.ts     // コレクション型
types/quiz.ts          // クイズ型
types/question.ts      // 問題型
```

#### 4. スタイル管理
```typescript
// 統一されたデザインシステム
style/colorStyle.ts    // カラーパレット
style/size.ts         // サイズ定義
style/shadow.ts       // シャドウ定義
styleMap/            // スタイルマッピング
```
詳細は次のセクションで説明します. 

#### 5. API通信
```typescript
// 機能別API分割
api/AuthAPI.ts        // 認証API
api/CollectionAPI.ts  // コレクションAPI
api/QuizAPI.ts       // クイズAPI
api/GenerationAPI.ts // AI生成API
```

#### 6. レスポンシブデザイン
- **Tailwind CSS**の画面サイズ対応
- **フレキシブルレイアウト**

## デザイン設計思想
一貫性、再利用性、保守性を重視したデザインシステムを構築し、統一されたUI/UX体験を提供しています。

color, size, round, fontWeight, shadow に関して, Keyと対応したMapを用意して, 各コンポーネントでKeyを指定することでスタイルを適用する設計にしました。これによって、スタイルに制約を持たせて統一感のあるデザインにしています。

### カラーシステム
`style/colorStyle.ts`で体系的なカラー管理を実装：

```typescript
export enum CoreColorKey {
  Base = 'base',
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
  Success = 'success',
}

export enum ColorPropertyKey {
  Bg = 'bg',
  Label = 'label',
  Border = 'border',
  Ring = 'ring',
}
```

### サイズシステム
`style/size.ts`で統一されたサイジング：

```typescript
export enum SizeKey {
  SM = 'sm',
  MD = 'md', 
  LG = 'lg',
  XL = 'xl',
}

export enum SizeProperty {
  Text = 'text',
  Padding = 'padding',
  Margin = 'margin',
  Gap = 'gap',
}
```

### コンポーネントライブラリ
`components/baseComponents/`で再利用可能な基底コンポーネントを構築：

- **BaseLabel** - 統一されたラベル表示
- **BaseCheckboxInput** - カスタマイズ可能なチェックボックス
- **BaseRangeInput** - スライダー型入力
- **BlockTextInput** / **InLineTextInput** - テキスト入力

実際のコンポーネント例：
```typescript
export type LabelStyle = {
  color?: Partial<ColorStyle>;
  size?: Partial<SizeStyle>;
  roundKey?: RoundKey;
  fontWeightKey?: FontWeightKey;
  shadow?: Partial<ShadowStyle>;
};
```

### スタイルマッピング
`styleMap/`ディレクトリでコンポーネント別のスタイル定義：
- `colorMap.ts` - コンポーネント別カラーマッピング
- `sizeMap.ts` - サイズ別スタイル設定
- `iconSizeMap.ts` - アイコンサイズ管理

### 統一されたデザイントークン
`style/style.ts`で型安全なスタイル管理：

```typescript
export type ComponentStyle = {
  color: ColorStyle;
  size: SizeStyle;
  rounded: RoundKey;
  fontWeight: FontWeightKey;
  shadow: ShadowStyle;
}
```


##  開発・ビルド

### 開発サーバー起動
```bash
npm run dev
```
- 開発サーバーが `http://localhost:3000` で起動
- ホットリロード対応

### ビルド
```bash
npm run build
```
- TypeScriptコンパイル + Viteビルド
- 最適化された本番用ファイル生成

### コード品質チェック
```bash
npm run lint
```
- ESLintによるコード検証
- TypeScript型チェック

### プレビュー
```bash
npm run preview
```
- ビルド結果のローカルプレビュー

##  Docker対応

### 開発環境
```bash
docker-compose up frontend
```
- ホットリロード対応のコンテナ
- ボリュームマウントによる即座の反映

### 特徴
- **ホットリロード** - ファイル変更の即座反映
- **ポートフォワーディング** - 3000番ポートでアクセス
- **依存関係分離** - node_modulesの適切な管理

##  環境設定

### 必要な環境変数
`.env`ファイルで以下を設定：
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 開発推奨環境
- **Node.js**: 18以上
- **npm**: 9以上

##  テスト

### 現在の状況
- **テストファイル**: 現在未実装（今後追加予定）
- **コード品質**: ESLintによるコード検証
- **型チェック**: TypeScriptによる型安全性

### 実行可能なチェック
```bash
# コード品質チェック
npm run lint

# ビルドチェック
npm run build
```

この設計により、ユーザーフレンドリーで保守性の高いフロントエンドアプリケーションを実現しています。
