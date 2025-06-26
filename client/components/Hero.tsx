"use client"
import React from 'react';
import { Button } from "@/components/ui/button";

import { BE_URL } from '@/config';
console.log("be url : "+BE_URL);
const Hero = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black text-white">
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-10">
          
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Master Your Next Interview with{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <div className="flex items-center justify-center space-x-4 text-xl md:text-3xl font-semibold">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Practice
            </span>
            <span className="text-purple-400">→</span>
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Simulate
            </span>
            <span className="text-pink-400">→</span>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Dominate
            </span>
          </div>

          <p className="text-xl md:text-5xl font-bold leading-normal bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Crush the real thing when it counts!
          </p>

          <p className="text-md md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            FOA is your personal AI interview coach. Practice real-world interview questions and get detailed feedback on your strengths and weaknesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 ">
           <Button 
            size="lg"
            onClick={() => {
                window.location.href = `${BE_URL}/auth/google`;
            }}
            className="cursor-pointer "
            >
            Start Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="cursor-pointer"
              onClick={() => window.open('https://youtu.be/wAD6VZNPW40', '_blank')}
            >
               View Demo
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-purple-900/20 to-transparent" />
    </section>
  );
};

export default Hero;
