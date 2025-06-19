package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCollectionStats is a Querydsl query type for CollectionStats
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCollectionStats extends EntityPathBase<CollectionStats> {

    private static final long serialVersionUID = -1714249966L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCollectionStats collectionStats = new QCollectionStats("collectionStats");

    public final QCollection collection;

    public final NumberPath<Long> favoriteCount = createNumber("favoriteCount", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public QCollectionStats(String variable) {
        this(CollectionStats.class, forVariable(variable), INITS);
    }

    public QCollectionStats(Path<? extends CollectionStats> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCollectionStats(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCollectionStats(PathMetadata metadata, PathInits inits) {
        this(CollectionStats.class, metadata, inits);
    }

    public QCollectionStats(Class<? extends CollectionStats> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.collection = inits.isInitialized("collection") ? new QCollection(forProperty("collection"), inits.get("collection")) : null;
    }

}

