import { useCallback, useEffect, useState } from "react";
import { api } from "../api/api";
import { useAuth } from "./AuthContext";
import { CurrentUserContext } from "./currentUserContext";

export function CurrentUserProvider({ children }) {
  const { user: authenticatedUser, loading: authLoading } =
    useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!authenticatedUser?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.getUserById(
        authenticatedUser.id
      );

      const userData =
        response.data?.data ?? response.data;

      setUser(userData);
    } catch (error) {
      console.error(
        "Current user API error:",
        error
      );

      // Fall back to the authenticated user
      setUser(authenticatedUser);
    } finally {
      setLoading(false);
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    void loadUser();
  }, [authLoading, loadUser]);

  const updateCurrentUser = useCallback(
    (updatedUser) => {
      setUser(updatedUser);
    },
    []
  );

  return (
    <CurrentUserContext.Provider
      value={{
        user,
        loading: authLoading || loading,
        updateCurrentUser,
        reloadUser: loadUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}