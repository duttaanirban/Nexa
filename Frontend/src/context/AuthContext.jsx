import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../api/api";

const AuthContext = createContext(null);

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
      } catch (error) {
        // 401 simply means the user isn't logged in.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadAuthenticatedUser();
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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}