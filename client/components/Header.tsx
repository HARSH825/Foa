'use client'
import { useAuth } from "../app/context/AuthContext";
import { Button } from "./ui/button";
import { ModeToggle } from "./Toggle";
import Image from "next/image";

const Header = () => {
  const { userData, logout } = useAuth();

  return (
    <div className="flex justify-between border-b-2 p-5 items-center text-lg font-bold ">
      <div className="flex items-center space-x-3 ">
        <Image src='vercel.svg' alt="foa-logo" width={32} height={32} />
        <div>FOA</div>
      </div>
      <div className="flex space-x-3 items-center">
        {userData ? (
          <>
            <div className="text-sm md:text-base">Welcome, {userData.name || userData.email}</div>
            <Button variant="outline" onClick={logout}>Signout</Button>
          </>
        ) : (
          <Button onClick={() => window.location.href = 'http://localhost:4000/auth/google'}>
            Signin
          </Button>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};

export default Header;
