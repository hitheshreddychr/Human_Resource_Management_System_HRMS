
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("hrms_access_token")
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hrms_user"));
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    // The backend expects JSON: { email, password }.
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const accessToken = response.data.access_token;

    const userResponse = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const loggedInUser = userResponse.data;

    localStorage.setItem("hrms_access_token", accessToken);
    localStorage.setItem(
      "hrms_user",
      JSON.stringify(loggedInUser)
    );

    setToken(accessToken);
    setUser(loggedInUser);

    return loggedInUser;
  }

  function logout() {
    localStorage.removeItem("hrms_access_token");
    localStorage.removeItem("hrms_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
