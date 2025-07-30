import { createContext } from 'react';
import { User } from '../types/user';

export const OfficialUserContext = createContext<{
  officialUser: User | null;
  setOfficialUser: (user: User | null) => void;
}>({
  officialUser: null,
  setOfficialUser: () => {},
});
