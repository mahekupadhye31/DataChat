"use client";
import { useRef } from "react";
import Navbar from './components/Navbar';
import InputFile from './components/InputFile';
import Chat from './components/Chat';

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <div className="h-16">
      <Navbar />
      </div>

   {/* main area: must have overflow-hidden so children handle their own scrolling */}
     <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
    {/* LEFT: charts */}
    <div className="p-4 h-full min-h-0 overflow-y-auto">
     <InputFile />
    </div>

    {/* RIGHT: chat */}
    <div
    //  ref={chatRef} // ✅ correct way to attach ref
     className="bg-[#0f172a] p-4 h-full min-h-0 flex flex-col"  >
    <Chat />
    </div>
   </div>
    </div>
  );
}
