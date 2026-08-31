import { useCallback, useEffect, useState } from "react";
import { api } from "../api/api";
import { CurrentUserContext } from "./currentUserContext";

const CURRENT_USER_ID = "USR-001";

export function CurrentUserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const response = await api.getUserById(CURRENT_USER_ID);
      const userData = response.data?.data ?? response.data;

      setUser(userData);
    } catch (error) {
      console.error("Current user API error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUser();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadUser]);

  const updateCurrentUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

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