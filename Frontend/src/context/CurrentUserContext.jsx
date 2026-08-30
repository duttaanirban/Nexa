import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";

const CURRENT_USER_ID = "USR-001";

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const response = await api.getUserById(CURRENT_USER_ID);
      const userData = response.data?.data ?? response.data;

      setUser(userData);
    } catch (error) {
      console.error("Current user API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <CurrentUserContext.Provider
      value={{
        user,
        loading,
        updateCurrentUser,
        reloadUser: loadUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error(
      "useCurrentUser must be used inside CurrentUserProvider"
    );
  }

  return context;
}