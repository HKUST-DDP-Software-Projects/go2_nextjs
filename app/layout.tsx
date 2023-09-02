"use client";

import { Providers } from "@/redux/provider";
import { Inter } from "next/font/google";
import { useState } from "react";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex w-screen h-screen bg-gray-100">
            <div
              className={`${
                isOpen ? "block" : "hidden"
              } bg-white w-64 px-4 py-8 border-r border-gray-200 flex-shrink-0`}
            >
              <ul className="space-y-4">
                <li>
                  <Link
                    href="course"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Course
                  </Link>
                </li>
                <li>
                  <Link
                    href="programme"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Programme
                  </Link>
                </li>
                <li>
                  <Link
                    href="gr23"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Gr23
                  </Link>
                </li>
                <li>
                  <Link
                    href="planner"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Planner
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 border-r border-gray-300"
                onClick={toggleSidebar}
              >
                Toggle Sidebar
              </button>
              <div className="p-4 w-full">{children}</div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
