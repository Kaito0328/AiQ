package com.example.myapp.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUserStats is a Querydsl query type for UserStats
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserStats extends EntityPathBase<UserStats> {

    private static final long serialVersionUID = 1136099013L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUserStats userStats = new QUserStats("userStats");

    public final NumberPath<Long> followerCount = createNumber("followerCount", Long.class);

    public final NumberPath<Long> followingCount = createNumber("followingCount", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QUser user;

    public QUserStats(String variable) {
        this(UserStats.class, forVariable(variable), INITS);
    }

    public QUserStats(Path<? extends UserStats> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUserStats(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUserStats(PathMetadata metadata, PathInits inits) {
        this(UserStats.class, metadata, inits);
    }

    public QUserStats(Class<? extends UserStats> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new QUser(forProperty("user"), inits.get("user")) : null;
    }

}

