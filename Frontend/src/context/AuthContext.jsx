import { useEffect, useState } from "react";
import { api } from "../api/api";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Check whether an existing authentication
   * cookie belongs to a valid user.
   */
  useEffect(() => {
    const loadAuthenticatedUser = async () => {
      try {
        const response = await api.getCurrentUser();

        setUser(response.data || null);
      } catch {
        // 401 simply means the user isn't logged in.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      void loadAuthenticatedUser();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  /*
   * Login
   */
  const login = async (email, password) => {
    const response = await api.login({
      email,
      password,
    });

    setUser(response.data);

    return response.data;
  };

  /*
   * Register
   */
  const register = async (
    name,
    email,
    password,
    confirmPassword
  ) => {
    const response = await api.register({
      name,
      email,
      password,
      confirmPassword,
    });

    setUser(response.data);

    return response.data;
  };

  /*
   * Logout
   */
  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
