import { useState } from "react";
import { LoginUserContext } from "../contexts/LoginUserContext";
import { User } from "../types/user";
import { UserContext } from "../contexts/UserContext";
import { OfficialUserContext } from "../contexts/OfficialUserContext";


export const LoginUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ loginUser, setLoginUser] = useState<User | null>(null);
  
    return (
      <LoginUserContext.Provider value={{ loginUser, setLoginUser }}>
        {children}
      </LoginUserContext.Provider>
    );
};
  
export const ViewingUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [viewingUser, setViewingUser] = useState<User | null>(null);
  
    return (
      <UserContext.Provider value={{ user: viewingUser, setUser: setViewingUser }}>
        {children}
      </UserContext.Provider>
    );
  };

  export const OfficialUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [officialUser, setOfficialUser] = useState<User | null>(null);
  
    return (
      <OfficialUserContext.Provider value={{ officialUser, setOfficialUser }}>
        {children}
      </OfficialUserContext.Provider>
    );
  };