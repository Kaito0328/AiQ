package com.example.myapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import com.example.myapp.model.Collection;
import com.example.myapp.model.Question;
import com.example.myapp.model.User;
import com.example.myapp.repository.QuestionRepository;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.util.PermissionCheck;
import java.util.Optional;
import com.example.myapp.dto.Item.BatchResponse.BatchDeleteResponse;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.BatchResponse.FailedCreateItem;
import com.example.myapp.dto.Item.BatchResponse.FailedItem;
import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.dto.Item.Request.UpdateRequest;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import com.example.myapp.exception.ErrorDetail;


@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Autowired
    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Question getViewQuestion(Long id, User user) {
        Question question = getQuestionById(id);

        PermissionCheck.checkViewPermission(user, question);
        return question;
    }

    public Question getManageQuestion(Long id, User user) {
        Question question = getQuestionById(id);

        PermissionCheck.checkManagePermission(user, question);
        return question;
    }

    public List<Question> getViewQuestions(List<Long> ids, User user) {
        List<Question> questions = questionRepository.findAllByIdIn(ids);
        questions = PermissionCheck.filterQuestionsByViewPermission(user, questions);

        return questions;
    }

    public List<Question> getQuestionsByCollection(Collection collection, User user) {
        List<Question> questions = questionRepository.findByCollectionId(collection.getId());

        return questions;
    }

    public Question createQuestion(QuestionInput questionInput, Collection collection,
            User user) {
        Question question = new Question(questionInput, collection);

        checkValidation(question);
        question = questionRepository.save(question);

        return question;
    }

    public Question updateQuestion(Long id, QuestionInput questionInput, User user) {
        Question question = getManageQuestion(id, user);

        question = applyUpdates(question, questionInput);

        checkValidation(question);
        question = questionRepository.save(question);
        return question;
    }

    public BatchUpsertResponse<Question> batchUpsertQuestion(Collection collection,
            List<UpdateRequest<QuestionInput>> updateRequests,
            List<CreateRequest<QuestionInput>> createRequests, User loginUser) {
        List<Question> upsertQuestions = new ArrayList<>();
        List<FailedCreateItem> failedCreates = new ArrayList<>();
        List<FailedItem> failedUpdates = new ArrayList<>();

        if (createRequests != null) {
            for (CreateRequest<QuestionInput> createRequest : createRequests) {
                Question question = new Question(createRequest.input(), collection);

                List<ErrorDetail> errorCodes = getValidationErrors(question);
                if (!errorCodes.isEmpty()) {
                    failedCreates.add(new FailedCreateItem(createRequest.index(), errorCodes));
                    continue;
                }

                upsertQuestions.add(question);
            }
        }

        if (updateRequests != null) {
            for (UpdateRequest<QuestionInput> updateRequest : updateRequests) {
                Long id = updateRequest.id();

                Optional<Question> optQuestion = questionRepository.findById(id);
                if (!optQuestion.isPresent()) {
                    failedUpdates.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION));
                    continue;
                }

                Question question = optQuestion.get();
                if (!question.getCollection().equals(collection)) {
                    failedUpdates.add(new FailedItem(id, ErrorCode.INVALID_PARENT));
                    continue;
                }

                question = applyUpdates(question, updateRequest.input());
                List<ErrorDetail> errorCodes = getValidationErrors(question);
                if (!errorCodes.isEmpty()) {
                    failedUpdates.add(new FailedItem(id, errorCodes));
                    continue;
                }

                upsertQuestions.add(question);
            }
        }

        upsertQuestions = questionRepository.saveAll(upsertQuestions);

        return new BatchUpsertResponse<Question>(upsertQuestions, failedCreates,
                failedUpdates);
    }

    public Question deleteQuestion(Long id, User user) {
        Question question = getManageQuestion(id, user);
        questionRepository.delete(question);

        return question;
    }

    public BatchDeleteResponse<Question> deleteQuestions(Collection collection, List<Long> ids, User user) {
        List<Question> deleteCollectionSets = new ArrayList<>();
        List<FailedItem> failedItems = new ArrayList<>();

        if (ids != null) {
            for (Long id : ids) {
                Optional<Question> optQuestion = questionRepository.findById(id);
                if (!optQuestion.isPresent()) {
                    failedItems.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION));
                    continue;
                }

                Question question = optQuestion.get();
                if (!question.getCollection().equals(collection)) {
                    failedItems.add(new FailedItem(id, ErrorCode.INVALID_PARENT));
                    continue;
                }

                deleteCollectionSets.add(question);
            }
        }

        questionRepository.deleteAll(deleteCollectionSets);

        return new BatchDeleteResponse<Question>(deleteCollectionSets, failedItems);
    }


    //以下private関数


    private Optional<Question> findQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    private Question getQuestionById(Long id) {
        return findQuestionById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_QUESTION));
    }
    
    private Question applyUpdates(Question question, QuestionInput questionInput) {
        if (questionInput.questionText() != null) {
            question.setQuestionText(questionInput.questionText());
        }

        if (questionInput.correctAnswer() != null) {
            question.setCorrectAnswer(questionInput.correctAnswer());
        }

        if (questionInput.descriptionText() != null) {
            question.setDescriptionText(questionInput.descriptionText());
        }

        return question;
    }

    private List<ErrorDetail> getValidationErrors(Question question) {
        List<ErrorCode> errorCodes = new ArrayList<>();

        if (question.getQuestionText() == null || question.getQuestionText() == "")
            errorCodes.add(ErrorCode.QUESTION_TEXT_EMPTY);
        if (question.getCorrectAnswer() == null || question.getCorrectAnswer() == "")
            errorCodes.add(ErrorCode.CORRECT_ANSWER_EMPTY);

        return ListTransformUtil.toErrorDetails(errorCodes);
    }

    private void checkValidation(Question question) {
        if (question.getQuestionText() == null || question.getQuestionText() == "")
            throw new CustomException(ErrorCode.QUESTION_TEXT_EMPTY);
        if (question.getCorrectAnswer() == null || question.getCorrectAnswer() == "")
            throw new CustomException(ErrorCode.CORRECT_ANSWER_EMPTY);
    }
}
