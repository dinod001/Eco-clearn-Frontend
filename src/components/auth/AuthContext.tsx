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
        // Clear any existing authentication state first
        console.log('Clearing existing authentication state...');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.clear(); // Clear all localStorage items
        delete axios.defaults.headers.common["Authorization"];
        
        const response = await axios.post(`${backend_url}/api/personnel/login`, {
          userName: username,
          password: password,
        });
        const data = response.data;
        console.log('Login response:', data); // Debug log
        
        if (data.token) {
          // Store the new token
          localStorage.setItem("authToken", data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          
          console.log('Login successful, setting user data...'); // Debug log
          
          // Store user information from login response
          let newUser: User | null = null;
          
          if (data._id || data.email || data.role) {
            console.log('User data from login response:', data); // Debug log
            newUser = {
              id: data._id || 0,
              name: data.name || data.fullName || username,
              username: data.username || data.userName || username,
              email: data.email,
              role: data.role || "Staff", // Use the role from API response
              avatar: data.avatar || data.profilePicture
            };
          } else if (data.user) {
            console.log('User data from login response:', data.user); // Debug log
            newUser = {
              id: data.user._id || data.user.id || 0,
              name: data.user.fullName || data.user.name || data.user.userName || username,
              username: data.user.userName || data.user.username || username,
              email: data.user.email,
              role: data.user.role || data.role || "Staff", // Use the role from API response
              avatar: data.user.avatar || data.user.profilePicture
            };
          }
          
          if (newUser) {
            setUser(newUser);
            // Store user data in localStorage to prevent session loss
            localStorage.setItem("userData", JSON.stringify(newUser));
            console.log('Set user to:', newUser); // Debug log
          } else {
            console.log('No detailed user data, fetching user profile...'); // Debug log
            // Try to fetch user profile for additional details
            await fetchUserProfile(username);
          }
          
          setIsAuthenticated(true);
          return true;
        } else {
          setIsAuthenticated(false);
          setUser(null);
          return false;
        }
      } catch (error: any) {
        console.error('Login error:', error); // Debug log
        setIsAuthenticated(false);
        setUser(null);
        localStorage.clear(); // Clear all data on login error
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
    console.log('Logging out user...'); // Debug log
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear all authentication and user data
    localStorage.clear(); // Clear all localStorage items
    delete axios.defaults.headers.common["Authorization"];
    
    // Force a page reload to ensure complete state reset and prevent session bleed
    window.location.href = '/login'; // Redirect to login page instead of just reload
  };

  const hasAccess = (requiredRole: string): boolean => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'Admin') return true;
    
    // Staff has access to specific pages only (Employee Management and Service Management are restricted)
    if (user.role === 'Staff') {
      const allowedPages = ['dashboard', 'pickup-requests', 'service-requests', 'users', 'inquiries', 'notifications', 'employees'];
      const restrictedPages = ['services', 'staff']; // Services and Staff Management are Admin-only
      
      // Check if it's a restricted page
      if (restrictedPages.includes(requiredRole.toLowerCase())) {
        return false;
      }
      
      return allowedPages.includes(requiredRole.toLowerCase());
    }
    
    return false;
  };

  // Function to fetch user profile
  const fetchUserProfile = async (fallbackUsername?: string, retryCount = 0): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log('No token found, clearing authentication state');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const response = await axios.get(`${backend_url}/api/personnel/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('User profile response:', response.data); // Debug log
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        console.log('Setting user data from profile:', userData); // Debug log
        const newUser = {
          id: userData._id || userData.id || 0,
          name: userData.fullName || userData.name || userData.userName || fallbackUsername || 'User',
          username: userData.userName || userData.username || fallbackUsername || userData.email?.split('@')[0] || 'user',
          email: userData.email,
          role: userData.role || 'Staff',
          avatar: userData.avatar || userData.profilePicture
        };
        setUser(newUser);
        // Store user data in localStorage
        localStorage.setItem("userData", JSON.stringify(newUser));
      }
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      
      // Only clear authentication if it's a 401 (unauthorized) error
      // This prevents logout due to network issues or server problems
      if (error.response && error.response.status === 401) {
        console.log('Token is invalid (401), clearing authentication state');
        setIsAuthenticated(false);
        setUser(null);
        localStorage.clear();
        delete axios.defaults.headers.common["Authorization"];
      } else if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED' || !error.response)) {
        // Retry network errors up to 2 times
        console.log(`Network error, retrying... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          fetchUserProfile(fallbackUsername, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        console.log('Profile fetch failed due to network/server issues, keeping user logged in');
        // Keep user logged in for network errors, server errors, etc.
        // The stored user data will continue to be used
      }
    }
  };

  // On mount, check for token and validate session
  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUserData = localStorage.getItem("userData");
    
    console.log('AuthContext useEffect - Token exists:', !!token, 'User data exists:', !!storedUserData);
    
    if (token && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('Restoring session for user:', userData);
        
        // Set axios header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // Restore user state from localStorage (this ensures immediate authentication)
        setUser(userData);
        setIsAuthenticated(true);
        
        // Validate the session in background (but don't log out on failure unless it's a 401)
        fetchUserProfile().catch((error) => {
          console.warn('Session validation failed, but keeping user logged in unless token is invalid:', error);
          // The fetchUserProfile function now handles this appropriately
          // Only 401 errors will cause logout, other errors will keep user logged in
        });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
      }
    } else if (token) {
      console.log('Token found but no user data, trying to fetch profile...');
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Try to fetch user profile with just the token
      fetchUserProfile().then(() => {
        // Check if user was successfully set by fetchUserProfile
        const updatedUserData = localStorage.getItem("userData");
        if (updatedUserData) {
          setIsAuthenticated(true);
        }
      }).catch((error) => {
        console.log('Profile fetch failed and no stored user data');
        // fetchUserProfile already handles clearing session for 401 errors
        // For other errors, we'll clear since we have no fallback user data
        if (!error.response || error.response.status !== 401) {
          console.log('Clearing session due to network/server issues with no fallback data');
          localStorage.clear();
          setIsAuthenticated(false);
          setUser(null);
        }
      });
    } else {
      console.log('No valid session found');
      setIsAuthenticated(false);
      setUser(null);
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
