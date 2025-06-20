'use client'
import { useContext, useEffect, useState, createContext } from "react";
import axios from 'axios';
import { BE_URL } from "@/config";

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
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:{children : React.ReactNode}) => {
    const [userData, setUserData] = useState<User|null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("Auth mounted");
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("No token in localStorage");
            setIsLoading(false);
            return;
        }

        try {
            console.log("Fetching user details with token...");
            const response = await axios.get(`${BE_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.data) {
                console.log("User data received:", response.data);
                setUserData(response.data);
            } else {
                console.log("No user data in response, removing token");
                localStorage.removeItem("token");
                setUserData(null);
            }
        } catch (err) {
            console.log("Error fetching user details:", err);
            localStorage.removeItem("token");
            setUserData(null);
        } finally {
            console.log("Setting isLoading to false");
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUserData(null);
        window.location.href = "/";
    };

    return(
        <AuthContext.Provider value={{userData, setUserData, logout, isLoading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};