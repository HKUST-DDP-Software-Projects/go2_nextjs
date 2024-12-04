"use client";

import { Providers } from "@/redux/provider";
import { Inter } from "next/font/google";
// import Link from "next/link";
import "./globals.css";
import React, { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>DDP Course Pre-Enrollment Portal</title>
      </head>
      <body className={`${inter.className} bg-gray-100`}>
        <Providers>
          {/* modal */}
          <div
            className={`z-10 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
              isOpen ? "visible" : "hidden"
            }`}
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="flex flex-col h-screen w-screen">
            <nav className="z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-start rtl:justify-end">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      aria-controls="logo-sidebar"
                      type="button"
                      className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    >
                      <span className="sr-only">Open sidebar</span>
                      <svg
                        className="w-6 h-6"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                      </svg>
                    </button>
                    <div className="flex ms-2 md:me-24">
                      <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                        DDP Course Pre-Enrollment Portal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
              {/*<aside*/}
              {/*  id="logo-sidebar"*/}
              {/*  className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700 ${*/}
              {/*    isOpen ? "translate-x-0" : ""*/}
              {/*  }`}*/}
              {/*  aria-label="Sidebar"*/}
              {/*>*/}
              {/*</aside>*/}

              <div className="flex flex-1 overflow-y-auto">
                <div className="flex-shrink-0 sm:w-16"></div>
                <div className="w-full h-full">{children}</div>
                <div className="flex-shrink-1 sm:w-16"></div>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
