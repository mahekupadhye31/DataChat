"use client";
import React from "react";

export default function Navbar() {
  return (
    <nav className="relative bg-gray-800/50">
      <div className="flex justify-between h-16 items-center px-10">
        <div className="flex items-center">
          <img
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            alt="Logo"
            className="h-8 w-8"
          />
          <span className="ml-2 text-white font-extrabold text-xl">DataChat</span>
        </div>
      </div>
    </nav>
  );
}
