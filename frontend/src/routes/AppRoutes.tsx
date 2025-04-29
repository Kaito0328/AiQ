// src/routes/AppRoutes.tsx

import React from 'react';
import { Routes, Route } from "react-router-dom";
import Layout from '../components/Layout/Layout';
import QuizPage from '../components/quiz/Quiz';
import QuizOption from '../pages/user/[userId]/quiz-option';
import ScorePage from '../components/quiz/score/ScorePage';
import QuizStartPage from '../components/quiz/QuizStartPage';
import Login from '../pages/login';
import Register from '../pages/register';
import Home from '../pages/home';
import CollectionPage from '../pages/user/[userId]/collection-sets/[collectionSetId]/collections';
import QuestionPage from '../pages/user/[userId]/collections/[collectionId]/questions';
import UserList from '../components/User/UserList';
import ResumableQuizzesList from '../components/quiz/ResumableQuizzesList';
import CollectionSetPage from '../pages/user/[userId]/collection-sets';
import Paths from './Paths'; // Pathsをインポート

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={Paths.QUIZ_OPTION} element={<QuizOption />} />
        <Route path={Paths.QUIZ} element={<QuizPage />} />
        <Route path={Paths.QUIZ_SCORE} element={<ScorePage />} />
        <Route path={Paths.QUIZ_START} element={<QuizStartPage />} />
        <Route path={Paths.LOGIN} element={<Login />} />
        <Route path={Paths.REGISTER} element={<Register />} />
        <Route path={Paths.HOME} element={<Home />} />
        <Route path={Paths.COLLECTION_PAGE} element={<CollectionPage />} />
        <Route path={Paths.QUESTION_PAGE} element={<QuestionPage />} />
        <Route path={Paths.USER_LIST} element={<UserList />} />
        <Route path={Paths.COLLECTION_SET_PAGE} element={<CollectionSetPage />} />
        <Route path={Paths.RESUMABLE_QUIZZES_LIST} element={<ResumableQuizzesList />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
