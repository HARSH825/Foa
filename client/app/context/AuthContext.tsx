'use client'
import { useContext, useEffect, useState, createContext } from "react";

import axios from 'axios';

//stps : create context , give name , fetch detsils, set context , export context .

interface User {
  id: string
  name: string,
  email: string,
  picture: string,
  interviews: string[]
}

interface AuthContextType {
    userData: User | null;
    setUserData: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider =  ({children}:{children : React.ReactNode})=>{
    const [userData,setUserData] = useState<User|null>(null);

    useEffect(()=>{
      console.log("Auth mounted");
        fetchUserDetails();
    },[]);
    
    
  const fetchUserDetails = async () => {
    let token = localStorage.getItem("token");
    if (!token){console.log("No token in localsotrage"); return;}
    try {
      const response = await axios.get("http://localhost:4000/auth/profile", {
        headers: {
          'Authorization':`Bearer ${token}`
        },
      });

      if (response.data) {
        setUserData(response.data);
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.log("Error fetching user details:", err);
      localStorage.removeItem("token");
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    window.location.href = "/";
  };

  return(
    <AuthContext.Provider value = {{userData,setUserData,logout}}>
      {children}
    </AuthContext.Provider>
  )
  
}
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};