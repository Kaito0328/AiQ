# --- 基本ツールをインストールするベース ---
FROM rust:1-bookworm AS chef
RUN cargo install cargo-chef
WORKDIR /app/backend

# --- キャッシュ用の準備ステージ ---
FROM chef AS planner
COPY backend/ .
RUN cargo chef prepare --recipe-path recipe.json

# --- 本番ビルド用ステージ ---
FROM chef AS builder
COPY --from=planner /app/backend/recipe.json recipe.json
# ここで依存ライブラリだけをビルドし、キャッシュ層を作ります
RUN cargo chef cook --release --recipe-path recipe.json

COPY backend/ .
# sqlxのコンパイル時DB接続を回避するためオフラインモードを有効化
ENV SQLX_OFFLINE=true
RUN cargo build --release

# --- 本番環境用ステージ ---
# 実行に必要な最小限の環境だけを用意してイメージを軽量化します
FROM debian:bookworm-slim AS production
WORKDIR /app
# 必要な共有ライブラリをインストール
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*
# ビルドしたバイナリだけをコピー
COPY --from=builder /app/backend/target/release/backend /app/backend
# シードデータもコピー
COPY --from=builder /app/backend/seeds /app/seeds
# シードデータのパスを明示的に指定（デフォルト設定）
ENV SEED_PATH=/app/seeds
# アプリ設定ファイルを同梱（Koyeb等でbuild contextをリポジトリルートにした前提）
COPY app_config.json /app/app_config.json
ENV APP_CONFIG_PATH=/app/app_config.json
EXPOSE 8080
CMD ["./backend"]

# --- ローカル開発用ステージ ---
FROM rust:1-bookworm AS development
WORKDIR /workspace/backend
# ホットリロード用のcargo-watchと、マイグレーション用のsqlx-cliをインストール
RUN cargo install cargo-watch
RUN cargo install sqlx-cli --no-default-features --features native-tls,postgres
EXPOSE 8080
# 起動コマンドはdocker-compose.ymlで上書きされます
CMD ["tail", "-f", "/dev/null"]