import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// const API_URL = "http://localhost:5000/api/auth";
const API_URL = "https://kenta-serverless-app-xq4t.azurewebsites.net/api";


const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUser(JSON.parse(user));
      setUserLoggedIn(true);
    }
    setLoading(false);
  }, []);

  
  const doCreateUserWithEmailAndPassword = async (name, email, password) => {
    try {
      const { data } = await api.post("/Register", { name, email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      setUserLoggedIn(true);

      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };


  const doSignInWithEmailAndPassword = async (email, password) => {
    try {
      const { data } = await api.post("/Login", { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      setUserLoggedIn(true);

      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

 
  const doSignOut = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setUserLoggedIn(false);
  };

  const value = {
    currentUser,
    userLoggedIn,
    loading,
    doCreateUserWithEmailAndPassword,
    doSignInWithEmailAndPassword,
    doSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
