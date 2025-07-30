package com.example.myapp.config;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private static final CopyOnWriteArraySet<WebSocketSession> sessions =
            new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) {
        sessions.add(session);
    }

    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session,
            @NonNull TextMessage message) throws IOException {
        // 受信メッセージを全クライアントに送信（ブロードキャスト）
        for (WebSocketSession s : sessions) {
            s.sendMessage(new TextMessage("Echo: " + message.getPayload()));
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session,
            @NonNull CloseStatus status) {
        sessions.remove(session);
    }

    // 任意のタイミングでクライアントにメッセージを送る
    public void sendMessageToClients(String message) {
        for (WebSocketSession session : sessions) {
            try {
                session.sendMessage(new TextMessage(message));
                System.out.println("Sent message to client: " + message); // ログ出力
            } catch (IOException e) {
                System.err.println("Error sending message to client: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
