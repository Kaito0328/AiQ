package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QAnswerHistory is a Querydsl query type for AnswerHistory
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QAnswerHistory extends EntityPathBase<AnswerHistory> {

    private static final long serialVersionUID = 199203239L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QAnswerHistory answerHistory = new QAnswerHistory("answerHistory");

    public final QBaseCreatedTimeEntity _super = new QBaseCreatedTimeEntity(this);

    public final NumberPath<Long> answerId = createNumber("answerId", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final BooleanPath isCorrect = createBoolean("isCorrect");

    public final QQuestion question;

    public final QCasualQuiz quiz;

    public final QUser user;

    public final StringPath userAnswer = createString("userAnswer");

    public QAnswerHistory(String variable) {
        this(AnswerHistory.class, forVariable(variable), INITS);
    }

    public QAnswerHistory(Path<? extends AnswerHistory> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QAnswerHistory(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QAnswerHistory(PathMetadata metadata, PathInits inits) {
        this(AnswerHistory.class, metadata, inits);
    }

    public QAnswerHistory(Class<? extends AnswerHistory> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.question = inits.isInitialized("question") ? new QQuestion(forProperty("question"), inits.get("question")) : null;
        this.quiz = inits.isInitialized("quiz") ? new QCasualQuiz(forProperty("quiz"), inits.get("quiz")) : null;
        this.user = inits.isInitialized("user") ? new QUser(forProperty("user"), inits.get("user")) : null;
    }

}

