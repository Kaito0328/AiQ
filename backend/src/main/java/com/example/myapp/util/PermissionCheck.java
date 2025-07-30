package com.example.myapp.util;


import java.util.List;
import java.util.stream.Collectors;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.Question;
import com.example.myapp.model.User;

public final class PermissionCheck {

    public static boolean isOwner(User viewer, User owner) {
        if (viewer == null)
            return false;
        if (viewer.equals(owner))
            return true;
        if (viewer.isOfficial())
            return true;
        return false;
    }

    public static void checkViewPermission(User loginUser, User user) {
        return;
    }

    public static void checkViewPermission(User user, CollectionSet collectionSet) {
        if (collectionSet.isOpen() || isOwner(user, collectionSet.getUser()))
            return;
        throw new CustomException(ErrorCode.NOT_HAVE_VIEW_PERMISSION);
    }

    public static void checkViewPermission(User user, Collection collection) {
        if (collection.isOpen() || isOwner(user, collection.getCollectionSet().getUser()))
            return;
        throw new CustomException(ErrorCode.NOT_HAVE_MANAGE_PERMISSION);
    }

    public static void checkViewPermission(User user, Question question) {
        checkViewPermission(user, question.getCollection());
    }

    public static void checkManagePermission(User loginUser, User user) {
        if (isOwner(loginUser, user))
            return;
        throw new CustomException(ErrorCode.NOT_HAVE_MANAGE_PERMISSION);
    }

    public static void checkManagePermission(User user, CollectionSet collectionSet) {
        if (isOwner(user, collectionSet.getUser()))
            return;
        throw new CustomException(ErrorCode.NOT_HAVE_MANAGE_PERMISSION);
    }

    public static void checkManagePermission(User user, Collection collection) {
        checkManagePermission(user, collection.getCollectionSet());
    }

    public static void checkManagePermission(User user, Question question) {
        checkManagePermission(user, question.getCollection());
    }

    public static boolean hasViewPermission(User user, CollectionSet collectionSet) {
        return collectionSet.isOpen() || isOwner(user, collectionSet.getUser());
    }

    public static boolean hasViewPermission(User user, Collection collection) {
        return collection.isOpen() || isOwner(user, collection.getCollectionSet().getUser());
    }

    public static boolean hasViewPermission(User user, Question question) {
        return hasViewPermission(user, question.getCollection());
    }

    public static boolean hasManagePermission(User user, CollectionSet collectionSet) {
        return isOwner(user, collectionSet.getUser());
    }

    public static boolean hasManagePermission(User user, Collection collection) {
        return hasManagePermission(user, collection.getCollectionSet());
    }

    public static boolean hasManagePermission(User user, Question question) {
        return hasManagePermission(user, question.getCollection());
    }

    public static List<CollectionSet> filterCollectionSetsByViewPermission(User user,
            List<CollectionSet> collectionSets) {
        return collectionSets.stream().filter(collectionSet -> {
            return hasViewPermission(user, collectionSet);
        }).collect(Collectors.toList());
    }

    public static List<Collection> filterCollectionsByViewPermission(User user,
            List<Collection> collections) {
        return collections.stream().filter(collection -> {
            return hasViewPermission(user, collection);
        }).collect(Collectors.toList());
    }

    public static List<Question> filterQuestionsByViewPermission(User user,
            List<Question> questions) {
        return questions.stream().filter(question -> {
            return hasViewPermission(user, question);
        }).collect(Collectors.toList());
    }

    public static List<CollectionSet> filterCollectionSetsByManagePermission(User user,
            List<CollectionSet> collectionSets) {
        return collectionSets.stream().filter(collectionSet -> {
            return hasManagePermission(user, collectionSet);
        }).collect(Collectors.toList());
    }

    public static List<Collection> filterCollectionsByManagePermission(User user,
            List<Collection> collections) {
        return collections.stream().filter(collection -> {
            return hasManagePermission(user, collection);
        }).collect(Collectors.toList());
    }

    public static List<Question> filterQuestionsByManagePermission(User user,
            List<Question> questions) {
        return questions.stream().filter(question -> {
            return hasManagePermission(user, question);
        }).collect(Collectors.toList());
    }

}
