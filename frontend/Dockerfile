# --- 共通ベース ---
FROM node:18-alpine AS base
WORKDIR /app

# --- 依存関係インストール ---
FROM base AS deps
COPY package*.json ./
RUN npm ci

# --- 本番ビルド用ステージ ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- 本番環境用ステージ ---
FROM base AS production
ENV NODE_ENV=production
# Next.jsのStandalone出力（軽量化設定）を利用することを前提とします
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]

# --- ローカル開発用ステージ ---
FROM base AS development
# コマンドはdocker-compose.ymlで上書きされます
CMD ["tail", "-f", "/dev/null"]