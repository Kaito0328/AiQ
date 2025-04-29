package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCollection is a Querydsl query type for Collection
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCollection extends EntityPathBase<Collection> {

    private static final long serialVersionUID = 1821353357L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCollection collection = new QCollection("collection");

    public final QBaseTimeEntity _super = new QBaseTimeEntity(this);

    public final QCollectionSet collectionSet;

    public final QCollectionStats collectionStats;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final StringPath descriptionText = createString("descriptionText");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final BooleanPath open = createBoolean("open");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QCollection(String variable) {
        this(Collection.class, forVariable(variable), INITS);
    }

    public QCollection(Path<? extends Collection> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCollection(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCollection(PathMetadata metadata, PathInits inits) {
        this(Collection.class, metadata, inits);
    }

    public QCollection(Class<? extends Collection> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.collectionSet = inits.isInitialized("collectionSet") ? new QCollectionSet(forProperty("collectionSet"), inits.get("collectionSet")) : null;
        this.collectionStats = inits.isInitialized("collectionStats") ? new QCollectionStats(forProperty("collectionStats"), inits.get("collectionStats")) : null;
    }

}

