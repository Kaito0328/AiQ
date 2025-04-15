import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './components/Layout/Layout';
import QuizPage from './components/quiz/Quiz';
import QuizOption from './pages/user/[userId]/quiz-option';
import './index.css';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
// import UserProfile from './components/User/UserProfile';
import CollectionPage from './pages/user/[userId]/collection-sets/[collectionSetId]/collections';
import CollectionSetPage from './pages/user/[userId]/collection-sets';
// import UserCollections from "./components/User/UserCollection/UserCollections";
import QuestionPage from './pages/user/[userId]/collections/[collectionId]/questions';
import UserList from './components/User/UserList';
// import UserCollectionSets from './components/User/UserCollectionSet/UserCollectionSets';
import { LoginUserProvider, OfficialUserProvider, ViewingUserProvider } from './provider/UserProvider';

const App: React.FC = () => {
  return (
    <LoginUserProvider>
      <OfficialUserProvider>
        <ViewingUserProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/quiz-option/:userId" element={<QuizOption />} />
                <Route path="/questions" element={<QuizPage />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/' element={<Home />} />
                <Route path="/user/:userId/collection-set/:collectionSetId/collections" element={<CollectionPage />} />
                <Route path="/user/:userId/collection/:collectionId/questions" element={<QuestionPage />} />
                <Route path="/user-list" element={<UserList />} />
                <Route path="/user/:userId/collection-sets" element={<CollectionSetPage />} />
              </Route>
            </Routes>
          </Router>
        </ViewingUserProvider>
      </OfficialUserProvider>
    </LoginUserProvider>
  );
};


export default App;
