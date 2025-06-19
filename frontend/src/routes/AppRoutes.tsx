// src/routes/AppRoutes.tsx

import React from 'react';
import { Routes, Route } from "react-router-dom";
import Layout from '../components/Layout/Layout';
import QuizPage from '../pages/quiz/index';
import QuizOption from '../pages/user/[userId]/quiz-option';
import ScorePage from '../pages/quiz/score';
import QuizStartPage from '../pages/quiz/start';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import Home from '../pages/home';
import TopPage from '../pages';
import CollectionPage from '../pages/user/[userId]/collection-sets/[collectionSetId]/collections';
import QuestionPage from '../pages/user/[userId]/collections/[collectionId]/questions';
import UserListPage from '../pages/user/list';
import UserProfile from '../pages/user/profile';
import ResumableQuizzesList from '../pages/quiz/resume';
import CollectionSetPage from '../pages/user/[userId]/collection-sets';
import Paths from './Paths';
import FavoriteCollectionPage from '../pages/user/[userId]/favorite/collections';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={Paths.TOP} element={<TopPage />} />
      <Route path={Paths.LOGIN} element={<Login />} />
      <Route path={Paths.REGISTER} element={<Register />} />
      <Route element={<Layout />}>
        <Route path={Paths.HOME} element={<Home />} />

        <Route path={Paths.QUIZ_OPTION} element={<QuizOption />} />
        <Route path={Paths.QUIZ} element={<QuizPage />} />
        <Route path={Paths.QUIZ_SCORE} element={<ScorePage />} />
        <Route path={Paths.QUIZ_START} element={<QuizStartPage />} />
        <Route path={Paths.RESUMABLE_QUIZZES_LIST} element={<ResumableQuizzesList />} />

        <Route path={Paths.COLLECTION_SET_PAGE} element={<CollectionSetPage />} />
        <Route path={Paths.COLLECTION_PAGE} element={<CollectionPage />} />
        <Route path={Paths.FAVORITE_COLLECTION_PAGE} element={<FavoriteCollectionPage />} />
        <Route path={Paths.QUESTION_PAGE} element={<QuestionPage />} />

        <Route path={Paths.USER_LIST} element={<UserListPage />} />
        <Route path={Paths.USER_PROFILE} element={<UserProfile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
