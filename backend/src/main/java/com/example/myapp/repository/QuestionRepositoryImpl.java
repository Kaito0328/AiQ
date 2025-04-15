package com.example.myapp.repository;
import com.example.myapp.model.Question;
import com.example.myapp.model.AnswerHistory;
import com.example.myapp.dto.Quiz.FilterCondition;
import com.example.myapp.dto.Quiz.FilterType;
import com.example.myapp.dto.Quiz.SortCondition;
import com.example.myapp.dto.Quiz.SortDirection;
import com.example.myapp.model.QQuestion;
import com.example.myapp.model.QAnswerHistory;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import com.querydsl.jpa.impl.JPAQueryFactory;


@RequiredArgsConstructor
public class QuestionRepositoryImpl implements QuestionRepositoryCustom {

    private final JPAQueryFactory queryFactory;

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

        // サブクエリ: 各問題に対する解答履歴の集計
        JPQLQuery<Tuple> subquery = queryFactory
            .select(
                ah.question.id,
                ah.count().as("total"),
                ah.sum(ah.isCorrect.castToNum(Integer.class)).as("correct"),
                ah.count().subtract(ah.sum(ah.isCorrect.castToNum(Integer.class))).as("wrong")
            )
            .from(ah)
            .where(ah.user.id.eq(userId))
            .groupBy(ah.question.id);

        // メインクエリ
        List<Tuple> stats = subquery.fetch();
        Map<Long, Tuple> statMap = stats.stream()
            .collect(Collectors.toMap(t -> t.get(0, Long.class), Function.identity()));

        // 対象問題
        List<Question> baseQuestions = queryFactory
            .selectFrom(q)
            .where(q.collection.id.in(collectionIds))
            .fetch();

        // フィルタ
        List<Question> filtered = baseQuestions.stream().filter(question -> {
            Tuple stat = statMap.get(question.getId());

            for (FilterCondition filter : filters) {
                if (filter.type() == FilterCondition.NOT_ANSWERED) {
                    if (stat != null) return false;
                } else if (filter.type() == FilterCondition.WRONG_AT_LEAST_N) {
                    if (stat == null) return false;
                    Long wrong = stat.get("wrong", Long.class);
                    if (wrong == null || wrong < filter.value()) return false;
                }
            }
            return true;
        }).toList();

        // ソート
        Comparator<Question> comparator = Comparator.comparing(Question::getId); // default

        for (SortCondition sort : Lists.reverse(sorts)) { // 最後のものが優先されるため reverse
            Comparator<Question> cmp = switch (sort.key()) {
                case "id" -> Comparator.comparing(Question::getId);
                case "wrong" -> Comparator.comparing(qi -> {
                    Tuple stat = statMap.get(qi.getId());
                    return stat != null ? stat.get("wrong", Long.class) : 0;
                });
                case "accuracy" -> Comparator.comparing(qi -> {
                    Tuple stat = statMap.get(qi.getId());
                    if (stat == null) return 0.0;
                    Long total = stat.get("total", Long.class);
                    Long correct = stat.get("correct", Long.class);
                    return total != 0 ? (double) correct / total : 0.0;
                });
                case "random" -> Comparator.comparing(qi -> Math.random());
                default -> Comparator.comparing(Question::getId);
            };

            if (sort.direction() == SortDirection.DESC) {
                cmp = cmp.reversed();
            }

            comparator = comparator.thenComparing(cmp);
        }

        List<Question> sorted = filtered.stream().sorted(comparator).limit(limit).toList();

        return sorted;
    }
}

