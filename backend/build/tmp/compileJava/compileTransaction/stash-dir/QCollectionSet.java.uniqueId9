package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCollectionSet is a Querydsl query type for CollectionSet
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCollectionSet extends EntityPathBase<CollectionSet> {

    private static final long serialVersionUID = 1616091029L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCollectionSet collectionSet = new QCollectionSet("collectionSet");

    public final QBaseTimeEntity _super = new QBaseTimeEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final StringPath descriptionText = createString("descriptionText");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final BooleanPath open = createBoolean("open");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final QUser user;

    public QCollectionSet(String variable) {
        this(CollectionSet.class, forVariable(variable), INITS);
    }

    public QCollectionSet(Path<? extends CollectionSet> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCollectionSet(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCollectionSet(PathMetadata metadata, PathInits inits) {
        this(CollectionSet.class, metadata, inits);
    }

    public QCollectionSet(Class<? extends CollectionSet> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new QUser(forProperty("user"), inits.get("user")) : null;
    }

}

