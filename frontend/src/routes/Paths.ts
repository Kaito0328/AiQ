const Paths = {
  TOP: '/',
  HOME: '/home',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  QUIZ_OPTION: '/user/:userId/quiz-option',
  QUIZ: '/quiz/',
  QUIZ_SCORE: '/quiz/score',
  QUIZ_START: '/quiz/start',
  RESUMABLE_QUIZZES_LIST: '/quiz/resume',
  COLLECTION_PAGE: '/user/:userId/collection-set/:collectionSetId/collections',
  QUESTION_PAGE: '/user/:userId/collection/:collectionId/questions',
  FAVORITE_COLLECTION_PAGE: '/user/:userId/favorite/collections',
  USER_LIST: '/user/list',
  USER_PROFILE: '/user/profile',
  COLLECTION_SET_PAGE: '/user/:userId/collection-sets',
};

export default Paths;
