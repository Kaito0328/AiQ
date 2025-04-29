package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCasualQuiz is a Querydsl query type for CasualQuiz
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCasualQuiz extends EntityPathBase<CasualQuiz> {

    private static final long serialVersionUID = -38955185L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCasualQuiz casualQuiz = new QCasualQuiz("casualQuiz");

    public final QBaseTimeEntity _super = new QBaseTimeEntity(this);

    public final ListPath<String, StringPath> collectionNames = this.<String, StringPath>createList("collectionNames", String.class, StringPath.class, PathInits.DIRECT2);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final ListPath<com.example.myapp.model.filter.FilterType, EnumPath<com.example.myapp.model.filter.FilterType>> filterTypes = this.<com.example.myapp.model.filter.FilterType, EnumPath<com.example.myapp.model.filter.FilterType>>createList("filterTypes", com.example.myapp.model.filter.FilterType.class, EnumPath.class, PathInits.DIRECT2);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final ListPath<Question, QQuestion> questions = this.<Question, QQuestion>createList("questions", Question.class, QQuestion.class, PathInits.DIRECT2);

    public final ListPath<com.example.myapp.model.sort.SortKey, EnumPath<com.example.myapp.model.sort.SortKey>> sortKeys = this.<com.example.myapp.model.sort.SortKey, EnumPath<com.example.myapp.model.sort.SortKey>>createList("sortKeys", com.example.myapp.model.sort.SortKey.class, EnumPath.class, PathInits.DIRECT2);

    public final NumberPath<Integer> totalQuestions = createNumber("totalQuestions", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final QUser user;

    public QCasualQuiz(String variable) {
        this(CasualQuiz.class, forVariable(variable), INITS);
    }

    public QCasualQuiz(Path<? extends CasualQuiz> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCasualQuiz(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCasualQuiz(PathMetadata metadata, PathInits inits) {
        this(CasualQuiz.class, metadata, inits);
    }

    public QCasualQuiz(Class<? extends CasualQuiz> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new QUser(forProperty("user"), inits.get("user")) : null;
    }

}

