'use client'
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
const DashBoard = ()=>{
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    if(token && typeof window !== 'undefined'){
        localStorage.setItem("token",token);
    }
    else {
        router.push('/');
    }
    const {userData} = useAuth();

    console.log(userData);
    return(
                <div className="p-8">
                <div className="text-2xl font-bold">
                    Hey {userData?.name || 'champion'}! Ready to <span className="font-extrabold text-white">crush</span> it?
                </div>
                </div>
    )
}

export default DashBoard;

