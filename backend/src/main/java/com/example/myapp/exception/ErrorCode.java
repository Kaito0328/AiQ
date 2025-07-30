package com.example.myapp.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
	INVALID_PASSWORD("INVALID_PASSWORD", "Password is not valid.",
			HttpStatus.BAD_REQUEST), DUPLICATE_COLLECTION("DUPLICATE_COLLECTION",
					"Collection already exists.", HttpStatus.CONFLICT), NOT_FOUND_COLLECTION_SET(
							"NOT_FOUND_COLLECTIONSET", "CollectionSet not found.",
							HttpStatus.NOT_FOUND), NOT_FOUND_COLLECTION("NOT_FOUND_COLLECTION",
									"Collection not found.",
									HttpStatus.NOT_FOUND), NOT_FOUND_QUESTION("NOT_FOUND_QUESTION",
											"Question not found.",
											HttpStatus.NOT_FOUND), NOT_FOUND_USER("NOT_FOUND_USER",
													"User not found.",
													HttpStatus.NOT_FOUND), DUPLICATE_COLLECTION_SET(
															"DUPLICATE_COLLECTIONSET",
															"CollectionSet already exists.",
															HttpStatus.CONFLICT), DUPLICATE_USER(
																	"DUPLICATE_USER",
																	"User already exists.",
																	HttpStatus.CONFLICT), INVALID_PARENT(
																			"INVALID_PARENT",
																			"the item does not belong to specified parent. ",
																			HttpStatus.BAD_REQUEST), NOT_HAVE_VIEW_PERMISSION(
																					"NOT_HAVE_VIEW_PERMISSION",
																					"You don't have view permission.",
																					HttpStatus.FORBIDDEN), NOT_HAVE_MANAGE_PERMISSION(
																							"NOT_HAVE_MANAGE_PERMISSION",
																							"You don't have manage permission.",
																							HttpStatus.FORBIDDEN), NOT_COLLECTIONSET_OWNER(
																									"NOT_COLLECTIONSET_OWNER",
																									"You are not the collection-set's owner.",
																									HttpStatus.FORBIDDEN), NOT_COLLECTION_OWNER(
																											"NOT_COLLECTION_OWNER",
																											"You are not the collection's owner.",
																											HttpStatus.FORBIDDEN), NOT_PUBLIC_COLLECTION(
																													"NOT_PUBLIC_COLLECTION",
																													"Collection is not public.",
																													HttpStatus.FORBIDDEN), NOT_PUBLIC_COLLECTIONSET(
																															"NOT_PUBLIC_COLLECTIONSET",
																															"CollectionSet is not public.",
																															HttpStatus.FORBIDDEN), QUESTION_TEXT_EMPTY(
																																	"QUESTION_TEXT_EMPTY",
																																	"question text is empty. ",
																																	HttpStatus.BAD_REQUEST), CORRECT_ANSWER_EMPTY(
																																			"CORRECT_ANSWER_EMPTY",
																																			"correct answer is empty. ",
																																			HttpStatus.BAD_REQUEST), COLLECTION_NAME_EMPTY(
																																					"COLLECTION_NAME_EMPTY",
																																					"collection name is empty. ",
																																					HttpStatus.BAD_REQUEST), COLLECTION_SET_NAME_EMPTY(
																																							"COLLECTIONSET_NAME_EMPTY",
																																							"collection set name is empty. ",
																																							HttpStatus.BAD_REQUEST), LOGIN_REQUIRED(
																																									"LOGIN_REQUIRED",
																																									"This operation requires login.",
																																									HttpStatus.UNAUTHORIZED), UNKNOWN_ERROR(
																																											"UNKNOWN_ERROR",
																																											"An unexpected error occurred.",
																																											HttpStatus.INTERNAL_SERVER_ERROR), NOT_FOUND_CASUAL_QUIZ(
																																												"NOt_FOUND_CASUAL_QUIZ",
																																												"CasualQuiz not found.",
																																												HttpStatus.NOT_FOUND), NOT_CASUAL_QUIZ_OWNER(
																																														"NOT_CASUAL_QUIZ_OWNER",
																																														"You are not the casual quiz's owner.",
																																														HttpStatus.FORBIDDEN);

	private final String code;
	private final String message;
	private final HttpStatus httpStatus;

	ErrorCode(String code, String message, HttpStatus httpStatus) {
		this.code = code;
		this.message = message;
		this.httpStatus = httpStatus;
	}

	public String getCode() {
		return code;
	}

	public String getMessage() {
		return message;
	}

	public HttpStatus getHttpStatus() {
		return httpStatus;
	}
}
