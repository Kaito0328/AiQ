package com.example.myapp.repository;

import java.util.ArrayList;
import java.util.List;
import com.example.myapp.model.QAnswerHistory;
import com.example.myapp.model.QQuestion;
import com.example.myapp.model.Question;
import com.example.myapp.model.filter.FilterCondition;
import com.example.myapp.model.sort.SortCondition;
import com.example.myapp.model.sort.SortDirection;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class QuestionRepositoryImpl implements QuestionRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private List<OrderSpecifier<?>> createOrderSpecifiers(
        List<SortCondition> sorts,
        QQuestion q,
        NumberExpression<Long> wrongExpr,
        NumberExpression<Integer> correctExpr,
        NumberExpression<Long> totalExpr
    ) {
        List<OrderSpecifier<?>> orderSpecifiers = new ArrayList<>();

        for (SortCondition s : sorts) {
            switch (s.key()) {
                case ID -> orderSpecifiers.add(
                    s.direction() == SortDirection.ASC ? q.id.asc() : q.id.desc()
                );
                case WRONG -> {
                    if (wrongExpr != null) {
                        orderSpecifiers.add(
                            s.direction() == SortDirection.ASC ? wrongExpr.asc() : wrongExpr.desc()
                        );
                    }
                }
                case ACCURACY -> {
                    if (correctExpr != null && totalExpr != null) {
                        var accuracy = correctExpr.castToNum(Double.class)
                            .divide(totalExpr.castToNum(Double.class));
                        orderSpecifiers.add(
                            s.direction() == SortDirection.ASC ? accuracy.asc() : accuracy.desc()
                        );
                    }
                }
                case RANDOM -> orderSpecifiers.add(
                    Expressions.numberTemplate(Double.class, "function('random')").asc()
                );
            }
        }

        if (orderSpecifiers.isEmpty()) {
            orderSpecifiers.add(q.id.asc()); // fallback
        }

        return orderSpecifiers;
    }

    private BooleanBuilder buildFilterCondition(
        List<FilterCondition> filters,
        NumberExpression<Long> wrongExpr,
        NumberExpression<Long> totalExpr
    ) {
        BooleanBuilder where = new BooleanBuilder();

        for (FilterCondition f : filters) {
            switch (f.type()) {
                case WRONG_COUNT -> where.and(wrongExpr.goe((Integer) f.value()));
                case NOT_SOLVED -> where.and(totalExpr.eq(0L));
            }
        }

        return where;
    }

    @Override
    public List<Question> findQuestionsForQuiz(
        List<Long> collectionIds,
        List<FilterCondition> filters,
        List<SortCondition> sorts,
        int limit
    ) {
        QQuestion q = QQuestion.question;

        JPQLQuery<Question> query = queryFactory
            .select(q)
            .from(q)
            .where(q.collection.id.in(collectionIds));

        List<OrderSpecifier<?>> orderSpecifiers = createOrderSpecifiers(sorts, q, null, null, null);

        return query
            .orderBy(orderSpecifiers.toArray(new OrderSpecifier[0]))
            .limit(limit)
            .fetch();
    }


    @Override
    public List<Question> findQuestionsForQuiz(
        Long userId,
        List<Long> collectionIds,
        List<FilterCondition> filters,
        List<SortCondition> sorts,
        int limit
    ) {
        QQuestion q = QQuestion.question;
        QAnswerHistory ah = QAnswerHistory.answerHistory;

        NumberExpression<Integer> correctExpr = ah.isCorrect.castToNum(Integer.class).sum();
        NumberExpression<Long> totalExpr = ah.count();
        NumberExpression<Long> wrongExpr = totalExpr.subtract(correctExpr);

        JPQLQuery<Tuple> query = queryFactory
            .select(q, totalExpr.as("total"), correctExpr.as("correct"), wrongExpr.as("wrong"))
            .from(q)
            .leftJoin(ah).on(ah.question.id.eq(q.id).and(ah.user.id.eq(userId)))
            .where(q.collection.id.in(collectionIds))
            .groupBy(q.id);

        BooleanBuilder filterWhere = buildFilterCondition(filters, wrongExpr, totalExpr);
        if (filterWhere.hasValue()) {
            query.having(filterWhere);
        }

        List<OrderSpecifier<?>> orderSpecifiers = createOrderSpecifiers(sorts, q, wrongExpr, correctExpr, totalExpr);

        return query
            .orderBy(orderSpecifiers.toArray(new OrderSpecifier[0]))
            .limit(limit)
            .fetch()
            .stream()
            .map(t -> t.get(q))
            .toList();
    }

}
