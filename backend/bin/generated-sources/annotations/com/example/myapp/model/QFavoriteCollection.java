package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QFavoriteCollection is a Querydsl query type for FavoriteCollection
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QFavoriteCollection extends EntityPathBase<FavoriteCollection> {

    private static final long serialVersionUID = 503748937L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QFavoriteCollection favoriteCollection = new QFavoriteCollection("favoriteCollection");

    public final QBaseCreatedTimeEntity _super = new QBaseCreatedTimeEntity(this);

    public final QCollection collection;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QUser user;

    public QFavoriteCollection(String variable) {
        this(FavoriteCollection.class, forVariable(variable), INITS);
    }

    public QFavoriteCollection(Path<? extends FavoriteCollection> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QFavoriteCollection(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QFavoriteCollection(PathMetadata metadata, PathInits inits) {
        this(FavoriteCollection.class, metadata, inits);
    }

    public QFavoriteCollection(Class<? extends FavoriteCollection> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.collection = inits.isInitialized("collection") ? new QCollection(forProperty("collection"), inits.get("collection")) : null;
        this.user = inits.isInitialized("user") ? new QUser(forProperty("user"), inits.get("user")) : null;
    }

}

