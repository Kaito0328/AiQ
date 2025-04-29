package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QOngoingCollectionQuiz is a Querydsl query type for OngoingCollectionQuiz
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QOngoingCollectionQuiz extends EntityPathBase<OngoingCollectionQuiz> {

    private static final long serialVersionUID = 115627039L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QOngoingCollectionQuiz ongoingCollectionQuiz = new QOngoingCollectionQuiz("ongoingCollectionQuiz");

    public final BooleanPath active = createBoolean("active");

    public final SetPath<Question, QQuestion> answeredQuestions = this.<Question, QQuestion>createSet("answeredQuestions", Question.class, QQuestion.class, PathInits.DIRECT2);

    public final QCollection collection;

    public final NumberPath<Integer> correctCount = createNumber("correctCount", Integer.class);

    public final NumberPath<Long> elapsedTimeMillis = createNumber("elapsedTimeMillis", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final DateTimePath<java.time.LocalDateTime> lastStartedAt = createDateTime("lastStartedAt", java.time.LocalDateTime.class);

    public final QUser user;

    public QOngoingCollectionQuiz(String variable) {
        this(OngoingCollectionQuiz.class, forVariable(variable), INITS);
    }

    public QOngoingCollectionQuiz(Path<? extends OngoingCollectionQuiz> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QOngoingCollectionQuiz(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QOngoingCollectionQuiz(PathMetadata metadata, PathInits inits) {
        this(OngoingCollectionQuiz.class, metadata, inits);
    }

    public QOngoingCollectionQuiz(Class<? extends OngoingCollectionQuiz> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.collection = inits.isInitialized("collection") ? new QCollection(forProperty("collection"), inits.get("collection")) : null;
        this.user = inits.isInitialized("user") ? new QUser(forProperty("user"), inits.get("user")) : null;
    }

}

