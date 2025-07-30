FROM node:18

# コンテナ内の作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルを先にコピー
COPY package*.json ./

# 依存関係をインストール
# これによりソースコードが変わっても毎回npm installが走るのを防ぐ
RUN npm install

# ソースコードをコピー
COPY . .

# ポートを開放
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
