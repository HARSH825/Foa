'use client'
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const DashBoard = ()=>{

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(()=>{
        if(token){
            localStorage.setItem("token",token);
        }
    },[token]);

    return(
        <div>
            DashBoard
            <div> {token ? (<p>Logged In successfully </p>) : (<p>Authenticating</p>)}</div>
        </div>
    )
}

export default DashBoard;