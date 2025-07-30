import { createContext } from 'react';
import { User } from '../types/user';

export const LoginUserContext = createContext<{
  loginUser: User | null;
  setLoginUser: (user: User | null) => void;
}>({
  loginUser: null,
  setLoginUser: () => {},
});
