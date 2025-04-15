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
import com.example.myapp.dto.Item.Question.QuestionOutput;
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

    public Question findQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_QUESTION));
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

    public QuestionOutput getQuestion(Long id, User user) {
        Question question = findQuestionById(id);

        PermissionCheck.checkManagePermission(user, question);
        return new QuestionOutput(question);
    }

    public List<QuestionOutput> getQuestions(List<Long> ids, User user) {
        List<Question> questions = questionRepository.findAllByIdIn(ids);
        questions = PermissionCheck.filterQuestionsByViewPermission(user, questions);

        return ListTransformUtil.toQuestionOutputs(questions);
    }

    public List<QuestionOutput> getQuestionsByCollection(Collection collection, User user) {
        PermissionCheck.checkViewPermission(user, collection);
        List<Question> questions = questionRepository.findByCollectionId(collection.getId());

        return ListTransformUtil.toQuestionOutputs(questions);
    }

    public QuestionOutput createQuestion(QuestionInput questionInput, Collection collection,
            User user) {
        PermissionCheck.checkManagePermission(user, collection);

        Question question = new Question(questionInput, collection);

        checkValidation(question);
        question = questionRepository.save(question);

        return new QuestionOutput(question);
    }



    public QuestionOutput updateQuestion(Long id, QuestionInput questionInput, User user) {
        Question question = findQuestionById(id);
        PermissionCheck.checkManagePermission(user, question);

        question = applyUpdates(question, questionInput);

        checkValidation(question);
        questionRepository.save(question);
        return new QuestionOutput(question);
    }

    public BatchUpsertResponse<QuestionOutput> batchUpsertQuestion(Collection collection,
            List<UpdateRequest<QuestionInput>> updateRequests,
            List<CreateRequest<QuestionInput>> createRequests, User loginUser) {
        List<Question> upsertCollections = new ArrayList<>();
        List<FailedCreateItem> failedCreates = new ArrayList<>();
        List<FailedItem> failedUpdates = new ArrayList<>();

        PermissionCheck.checkManagePermission(loginUser, collection);

        if (createRequests != null) {
            for (CreateRequest<QuestionInput> createRequest : createRequests) {
                Question question = new Question(createRequest.input(), collection);

                List<ErrorDetail> errorCodes = getValidationErrors(question);
                if (!errorCodes.isEmpty()) {
                    failedCreates.add(new FailedCreateItem(createRequest.index(), errorCodes));
                    continue;
                }

                upsertCollections.add(question);
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

                upsertCollections.add(question);
            }
        }

        upsertCollections = questionRepository.saveAll(upsertCollections);
        List<QuestionOutput> questionOutputs =
                ListTransformUtil.toQuestionOutputs(upsertCollections);

        return new BatchUpsertResponse<QuestionOutput>(questionOutputs, failedCreates,
                failedUpdates);
    }

    public QuestionOutput deleteQuestion(Long id, User user) {
        Question question = findQuestionById(id);
        PermissionCheck.checkManagePermission(user, question);

        questionRepository.delete(question);

        return new QuestionOutput(question);
    }

    public BatchDeleteResponse<QuestionOutput> deleteQuestions(List<Long> ids, User user) {
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

                if (!PermissionCheck.hasManagePermission(user, question)) {
                    failedItems.add(new FailedItem(id, ErrorCode.NOT_HAVE_MANAGE_PERMISSION));
                    continue;
                }
                deleteCollectionSets.add(question);
            }
        }

        questionRepository.deleteAll(deleteCollectionSets);
        List<QuestionOutput> questionOutputs =
                ListTransformUtil.toQuestionOutputs(deleteCollectionSets);

        return new BatchDeleteResponse<QuestionOutput>(questionOutputs, failedItems);
    }

    // public List<QuestionOutput> createQuestions(List<QuestionInput> questionInputs,
    // Collection collection, User user) {
    // PermissionCheck.checkManagePermission(user, collection);

    // List<QuestionOutput> questionOutputs = new ArrayList<>();
    // for (QuestionInput questionInput : questionInputs) {
    // Question question = new Question(questionInput, collection);

    // List<ErrorCode> errorCodes = getValidationErrors(question);
    // if (!errorCodes.isEmpty()) {
    // questionOutputs.add(new QuestionOutput(questionInput, errorCodes));
    // continue;
    // }

    // question = questionRepository.save(question);
    // questionOutputs.add(new QuestionOutput(question, true));
    // }

    // return questionOutputs;
    // }

    // public List<QuestionOutput> updateQuestions(List<QuestionInputWithId> questionInputWithIds,
    // User user) {
    // List<Question> updateQuestions = new ArrayList<>();
    // List<QuestionOutput> questionOutputs = new ArrayList<>();

    // for (QuestionInputWithId questionInputWithId : questionInputWithIds) {
    // Long id = questionInputWithId.getId();
    // QuestionInput questionInput = questionInputWithId.getQuestionInput();

    // Optional<Question> optQuestion = questionRepository.findById(id);
    // if (!optQuestion.isPresent()) {
    // questionOutputs.add(new QuestionOutput(id, ErrorCode.NOT_FOUND_QUESTION));
    // continue;
    // }
    // Question question = optQuestion.get();

    // if (!PermissionCheck.hasManagePermission(user, question)) {
    // questionOutputs.add(new QuestionOutput(id, ErrorCode.NOT_HAVE_MANAGE_PERMISSION));
    // }

    // question = applyUpdates(question, questionInput);

    // List<ErrorCode> errorCodes = getValidationErrors(question);
    // if (!errorCodes.isEmpty()) {
    // questionOutputs.add(new QuestionOutput(questionInput, errorCodes));
    // continue;
    // }

    // questionOutputs.add(new QuestionOutput(question, true));
    // updateQuestions.add(question);
    // }

    // questionRepository.saveAll(updateQuestions);

    // return questionOutputs;
    // }

    // // 全ての質問をDTOで返す
    // public List<QuestionDTO> getAllQuestions() {
    // return questionRepository.findAll().stream()
    // .map(question -> new QuestionDTO(question.getQuestionText(),
    // question.getCorrectAnswer(), question.getDescriptionText()))
    // .collect(Collectors.toList());
    // }

    // // quizId で質問をDTOで返す
    // public QuestionResponse getQuestionById(Long id) {
    // Optional<Question> questionOpt = questionRepository.findById(id);
    // if (questionOpt.isPresent()) {
    // Question question = questionOpt.get();
    // String questionText = question.getQuestionText();
    // String correctionName = question.getCollection().getName();
    // return new QuestionResponse(questionText, correctionName);
    // } else {
    // throw new RuntimeException("Question not found");
    // }
    // }

    // public List<Question> getQuestionsByCollectionId(Long collectionId) {
    // List<Question> questions = questionRepository.findByCollectionId(collectionId);

    // return questions;
    // }

    // public List<Question> parseQuestionDTOs(List<QuestionDTO> questionDTOs, Collection
    // collection) {
    // List<Question> questions = new ArrayList<>();
    // for (QuestionDTO dto : questionDTOs) {
    // Question question = new Question();
    // question.setCollection(collection);
    // question.setQuestionText(dto.getQuestionText());
    // question.setCorrectAnswer(dto.getCorrectAnswer());
    // question.setDescriptionText(dto.getDescriptionText());
    // questions.add(question);
    // }
    // return questions;
    // }

    // public List<Question> parseCreateQuestionRequests(
    // List<CreateQuestionRequest> createQuestionRequests, Collection collection) {
    // List<Question> questions = new ArrayList<>();
    // for (CreateQuestionRequest request : createQuestionRequests) {
    // Question question = new Question();
    // question.setCollection(collection);
    // question.setQuestionText(request.getQuestionText());
    // question.setCorrectAnswer(request.getCorrectAnswer());
    // question.setDescriptionText(request.getDescriptionText());
    // questions.add(question);
    // }
    // return questions;
    // }
}
