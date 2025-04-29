package com.example.myapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.example.myapp.model.Question;
import com.example.myapp.model.CasualQuiz;
import com.example.myapp.model.User;
import com.example.myapp.repository.QuestionRepositoryImpl;
import com.example.myapp.repository.CasualQuizRepository;
import com.example.myapp.util.ConditionValidator;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import com.example.myapp.dto.Quiz.CasualQuizOutput;
import com.example.myapp.dto.Quiz.QuizRequest;
import com.example.myapp.dto.Quiz.QuizStartResponse;


@Service
public class QuizService {
    private final CasualQuizRepository casualQuizRepository;
    private final QuestionRepositoryImpl questionRepositoryImpl;

    @Autowired
    public QuizService(CasualQuizRepository quizRepository, 
            QuestionRepositoryImpl questionRepositoryImpl) {
        this.casualQuizRepository = quizRepository;
        this.questionRepositoryImpl = questionRepositoryImpl;
    }
    @Transactional
    public CasualQuiz getCasualQuizById(long id, User user) {
        CasualQuiz quiz = casualQuizRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_CASUAL_QUIZ));

        if (!quiz.getUser().equals(user)) throw new CustomException(ErrorCode.NOT_CASUAL_QUIZ_OWNER);

        return quiz;
    }

    // private boolean isCorrect(Question question, String userAnswer) {
    //     // 正解の選択肢を "/" で分割する
    //     String[] correctAnswers = question.getCorrectAnswer().split("/");

    //     // 各正解選択肢とユーザーの回答を比較する
    //     for (String correctAnswer : correctAnswers) {
    //         if (correctAnswer.trim().equalsIgnoreCase(userAnswer.trim())) {
    //             return true; // 一致したら正解
    //         }
    //     }

    //     // 一致しなければ不正解
    //     return false;
    // }

    // public AnswerResponse checkAnswer(Question question, String userAnswer, User user) {
    //     PermissionCheck.checkViewPermission(user, question);
    //     boolean correct = isCorrect(question, userAnswer);


    //     return new AnswerResponse(correct, question.getCorrectAnswer(),
    //             question.getDescriptionText());
    // }

    private static final int MAX_CASUAL_QUIZZES = 5;

    public CasualQuiz createNewCasualQuiz(User user, List<Question> questions, QuizRequest request, List<String> collectionNames) {
        List<CasualQuiz> existing = casualQuizRepository.findByUserOrderByIdAsc(user);

        // 上限超えていたら一番古いものを削除
        if (existing.size() >= MAX_CASUAL_QUIZZES) {
            CasualQuiz oldest = existing.get(0);
            casualQuizRepository.delete(oldest);
        }

        CasualQuiz quiz = new CasualQuiz();
        quiz.setUser(user);
        quiz.setQuestions(questions);
        quiz.setFilterTypes(ListTransformUtil.toFilterTypes(request.filters()));
        quiz.setSortKeys(ListTransformUtil.toSortKeys(request.sorts()));
        quiz.setCollectionNames(collectionNames);

        return casualQuizRepository.save(quiz);
    }

    public QuizStartResponse startQuiz(QuizRequest quizRequest, User user, List<String> collectionNames) {
        if (user == null) {
            ConditionValidator.validateLoginRequiredConditions(
                quizRequest.filters(),
                quizRequest.sorts(),
                false
            );

            List<Question> questions = questionRepositoryImpl.findQuestionsForQuiz(
                quizRequest.collectionIds(),
                quizRequest.filters(),
                quizRequest.sorts(),
                quizRequest.limit()
            );

            return new QuizStartResponse(null, ListTransformUtil.toQuestionOutputs(questions));
        }

        List<Question> questions = questionRepositoryImpl.findQuestionsForQuiz(
            user.getId(),
            quizRequest.collectionIds(),
            quizRequest.filters(),
            quizRequest.sorts(),
            quizRequest.limit()
        );

        CasualQuiz quiz = createNewCasualQuiz(user, questions, quizRequest, collectionNames);

        return new QuizStartResponse(new CasualQuizOutput(quiz), ListTransformUtil.toQuestionOutputs(questions));
    }

    private CasualQuiz updateQuiz(CasualQuiz quiz, Question question) {
        List<Question> questions = quiz.getQuestions();
    
        // 該当の問題がクイズに含まれていない場合は無効
        if (!questions.contains(question)) {
            return null;
        }
    
        // 問題を削除
        questions.remove(question);
    
        // 残りの問題がない場合は完了とみなす
        if (questions.isEmpty()) {
            casualQuizRepository.delete(quiz);
            return null;
        }
    
        return casualQuizRepository.save(quiz);
    }

    @Transactional
    public CasualQuiz handleUpdate(long id, Question question, User user) {
        CasualQuiz quiz = getCasualQuizById(id, user);
        quiz = updateQuiz(quiz, question);

        return quiz;
    }

    public void handleDelete(long id, User user) {
        CasualQuiz quiz = getCasualQuizById(id, user);
        casualQuizRepository.delete(quiz);
    }
    @Transactional
    public List<CasualQuizOutput> getResumes(User user) {
        List<CasualQuiz> quizzes = casualQuizRepository.findByUserOrderByIdAsc(user);

        return quizzes.stream()
                .map(CasualQuizOutput::new)
                .toList();
    }

    public List<Question> resumeQuiz(Long quizId, User user) {
        CasualQuiz quiz = getCasualQuizById(quizId, user);

        return quiz.getQuestions();
    }



    // public List<QuizResponse> getQuestions(List<Collection> collections, String order, int limit,
    //         User user) {
    //     Pageable pageable = PageRequest.of(0, limit); // ページ番号0、limit件数

    //     collections = PermissionCheck.filterCollectionsByViewPermission(user, collections);
    //     List<Long> collectionIds =
    //             collections.stream().map(Collection::getId).collect(Collectors.toList());

    //     List<Question> questions;

    //     // 並び順に応じてクエリを分ける
    //     switch (order.toLowerCase()) {
    //         case "asc":
    //             questions = questionRepository
    //                     .findByCollectionIdInOrderByIdAscWithLimit(collectionIds, pageable);
    //             break;
    //         case "desc":
    //             questions = questionRepository
    //                     .findByCollectionIdInOrderByIdDescWithLimit(collectionIds, pageable);
    //             break;
    //         case "random":
    //             questions = questionRepository
    //                     .findByCollectionIdInOrderByRandomWithLimit(collectionIds, pageable);
    //             break;
    //         default:
    //             throw new IllegalArgumentException("Invalid order type");
    //     }

    //     return ListTransformUtil.toQuizs(questions);
    // }

    // public String getNextHintChar(Question question, int index, User user) {

    //     PermissionCheck.checkViewPermission(user, question);
    //     String answer = question.getCorrectAnswer();

    //     if (index >= answer.length()) {
    //         return ""; // すべてのヒントを表示し終えたら空文字を返す
    //     }

    //     return String.valueOf(answer.charAt(index));
    // }
}
