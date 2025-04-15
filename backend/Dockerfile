FROM eclipse-temurin:21-jdk

WORKDIR /workspace
COPY ./ /workspace


# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    zip \
    coreutils \
    findutils

# Gradle のセットアップ
RUN curl -sLo gradle.zip https://services.gradle.org/distributions/gradle-8.4-bin.zip \
    && unzip gradle.zip \
    && mv gradle-8.4 /opt/gradle \
    && rm gradle.zip

ENV GRADLE_HOME=/opt/gradle
ENV PATH="${GRADLE_HOME}/bin:${PATH}"

# Gradle Wrapper 実行権限を付与
RUN chmod +x ./gradlew

# 依存関係をキャッシュ（ビルド時に実行）
RUN ./gradlew dependencies --no-daemon

# # ビルドを実行
# RUN ./gradlew build --no-daemon

# ビルドした jar ファイルを実行
CMD ["java", "-jar", "build/libs/backend-0.0.1-SNAPSHOT.jar"]
EXPOSE 8080