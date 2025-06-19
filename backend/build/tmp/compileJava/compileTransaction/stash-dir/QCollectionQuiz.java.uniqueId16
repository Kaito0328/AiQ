package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCollectionQuiz is a Querydsl query type for CollectionQuiz
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCollectionQuiz extends EntityPathBase<CollectionQuiz> {

    private static final long serialVersionUID = -1440830078L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCollectionQuiz collectionQuiz = new QCollectionQuiz("collectionQuiz");

    public final QBaseCreatedTimeEntity _super = new QBaseCreatedTimeEntity(this);

    public final QCollection collection;

    public final BooleanPath complete = createBoolean("complete");

    public final NumberPath<Integer> correctNumber = createNumber("correctNumber", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Integer> score = createNumber("score", Integer.class);

    public final NumberPath<Integer> total = createNumber("total", Integer.class);

    public final NumberPath<Long> totalTimeMillis = createNumber("totalTimeMillis", Long.class);

    public final QUser user;

    public QCollectionQuiz(String variable) {
        this(CollectionQuiz.class, forVariable(variable), INITS);
    }

    public QCollectionQuiz(Path<? extends CollectionQuiz> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCollectionQuiz(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCollectionQuiz(PathMetadata metadata, PathInits inits) {
        this(CollectionQuiz.class, metadata, inits);
    }

    public QCollectionQuiz(Class<? extends CollectionQuiz> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.collection = inits.isInitialized("collection") ? new QCollection(forProperty("collection"), inits.get("collection")) : null;
        this.user = inits.isInitialized("user") ? new QUser(forProperty("user"), inits.get("user")) : null;
    }

}

