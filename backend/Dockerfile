# --- ステージ1: アプリケーションをビルドする共通ステージ ---
# このステージは本番イメージを作成するためにだけ使われます
FROM gradle:8.8-jdk21 AS builder

WORKDIR /app

COPY build.gradle settings.gradle ./
COPY gradlew ./
COPY gradle ./gradle/

RUN ./gradlew dependencies --no-daemon

COPY src ./src

RUN ./gradlew bootJar --no-daemon

# ここでビルドされたjarファイルの中身をリストアップし、
# postgresqlのドライバが含まれているか確認します。
RUN echo "--- Checking JAR file contents for PostgreSQL driver ---" && \
    unzip -l build/libs/*.jar | grep 'postgresql' || echo "--- PostgreSQL driver NOT FOUND in JAR ---"


# --- ステージ2: ローカル開発環境用のステージ ---
# ローカル開発ではこのステージが使われます
FROM eclipse-temurin:21-jdk AS development

WORKDIR /app

RUN apt-get update && apt-get install -y curl unzip

# Gradleを手動でインストール（元のDockerfileから流用）
# Spring Boot DevToolsのホットリロードなどに必要
RUN curl -sLo gradle.zip https://services.gradle.org/distributions/gradle-8.4-bin.zip \
    && unzip gradle.zip \
    && mv gradle-8.4 /opt/gradle \
    && rm gradle.zip
ENV PATH="/opt/gradle/bin:${PATH}"

# ポートを開けておく
EXPOSE 8080

# コンテナを起動したときに、何もしないで待機状態にする
# ソースコードはローカルからマウントし、コマンドはdocker-composeで上書きするため
CMD ["tail", "-f", "/dev/null"]


# --- ステージ3: 本番環境用のステージ ---
# Renderでのデプロイではこのステージが使われます
# Dockerfileの最後のステージがデフォルトでビルドされます
FROM eclipse-temurin:21-jre AS production

WORKDIR /app

# builderステージから、ビルド済みのjarファイルだけをコピー
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

# アプリケーションを実行
CMD ["java", "-jar", "app.jar"]