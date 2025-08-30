import { createContext, useContext } from "react";

export interface UserContextType {
  email: string;
}

export const UserContext = createContext<UserContextType>({ email: "" });

export const useUser = () => useContext(UserContext);