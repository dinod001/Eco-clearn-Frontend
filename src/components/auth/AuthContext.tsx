import React, { useState, createContext, useContext, ReactNode } from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  avatar?: string;
}

const backend_url = "http://localhost:5000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (username && password) {
      try {
        const response = await axios.post(`${backend_url}/api/personnel/login`, {
          userName: username,
          password: password,
        });
        const data = response.data;
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          setIsAuthenticated(true);
          // Set user info if available
          if (data.user) {
            setUser(data.user);
          } else {
            setUser({
              id: 0,
              name: username,
              username: username,
              role: data.role || "user",
            });
          }
          return true;
        } else {
          setIsAuthenticated(false);
          setUser(null);
          return false;
        }
      } catch (error: any) {
        setIsAuthenticated(false);
        setUser(null);
        if (error.response && error.response.status === 401) {
          // Optionally show a message to the user
          return false;
        }
        return false;
      }
    }
    setIsAuthenticated(false);
    setUser(null);
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common["Authorization"];
  };

  // On mount, check for token and set axios header if present
  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // Optionally fetch user info here if needed
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
