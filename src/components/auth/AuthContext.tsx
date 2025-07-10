import React, { useState, createContext, useContext, ReactNode } from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasAccess: (requiredRole: string) => boolean;
}

interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
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
        console.log('Login response:', data); // Debug log
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          setIsAuthenticated(true);
          
          console.log('Login successful, setting user data...'); // Debug log
          // Set user info from the API response
          if (data._id || data.email || data.role) {
            console.log('User data from login response:', data); // Debug log
            setUser({
              id: data._id || 0,
              name: data.name || data.fullName || username,
              username: data.username || data.userName || username,
              email: data.email,
              role: data.role || "Staff", // Use the role from API response
              avatar: data.avatar || data.profilePicture
            });
          } else if (data.user) {
            console.log('User data from login response:', data.user); // Debug log
            setUser({
              id: data.user._id || data.user.id || 0,
              name: data.user.fullName || data.user.name || data.user.userName || username,
              username: data.user.userName || data.user.username || username,
              email: data.user.email,
              role: data.user.role || data.role || "Staff", // Use the role from API response
              avatar: data.user.avatar || data.user.profilePicture
            });
          } else {
            console.log('No detailed user data, using login response directly:', username); // Debug log
            // Set basic user info with the entered username
            setUser({
              id: 0,
              name: username,
              username: username,
              role: "Staff" // Default role if not specified
            });
            // Try to fetch user profile for additional details
            await fetchUserProfile(username);
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

  const hasAccess = (requiredRole: string): boolean => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'Admin') return true;
    
    // Staff has access to specific pages only (Employee Management and Service Management are restricted)
    if (user.role === 'Staff') {
      const allowedPages = ['dashboard', 'pickup-requests', 'service-requests', 'users', 'inquiries', 'notifications', 'staff'];
      const restrictedPages = ['services', 'employees']; // Services and Employee Management are Admin-only
      
      // Check if it's a restricted page
      if (restrictedPages.includes(requiredRole.toLowerCase())) {
        return false;
      }
      
      return allowedPages.includes(requiredRole.toLowerCase());
    }
    
    return false;
  };

  // Function to fetch user profile
  const fetchUserProfile = async (fallbackUsername?: string): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(`${backend_url}/api/personnel/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('User profile response:', response.data); // Debug log
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        console.log('Setting user data:', userData); // Debug log
        setUser({
          id: userData._id || userData.id || 0,
          name: userData.fullName || userData.name || userData.userName || fallbackUsername || 'User',
          username: userData.userName || userData.username || fallbackUsername || userData.email?.split('@')[0] || 'user',
          email: userData.email,
          role: userData.role || 'Staff',
          avatar: userData.avatar || userData.profilePicture
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If profile fetch fails, use fallback user data
      setUser({
        id: 0,
        name: fallbackUsername || 'User',
        username: fallbackUsername || 'user',
        role: 'Staff'
      });
    }
  };

  // On mount, check for token and set axios header if present
  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // Fetch user profile information
      fetchUserProfile();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        hasAccess,
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
