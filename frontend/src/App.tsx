import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { LoginUserProvider, OfficialUserProvider, ViewingUserProvider } from './provider/UserProvider';
import AppRoutes from './routes/AppRoutes'; // AppRoutesをインポート

const App: React.FC = () => {
  return (
    <LoginUserProvider>
      <OfficialUserProvider>
        <ViewingUserProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ViewingUserProvider>
      </OfficialUserProvider>
    </LoginUserProvider>
  );
};

export default App;