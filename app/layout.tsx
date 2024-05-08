"use client";

import { Providers } from "@/redux/provider";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [isOpen, setIsOpen] = useState(true);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex w-screen h-screen bg-gray-100">
            <div
              className={`${
                // eslint-disable-next-line no-constant-condition
                true ? "block" : "hidden"
              } bg-white w-64 px-4 py-8 border-r border-gray-200 flex-shrink-0`}
            >
              <ul className="space-y-4">
                <li>
                  <Link
                    href="personal"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Personal Details
                  </Link>
                </li>
                <li>
                  <Link
                    href="course"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Course Import
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="gr23"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Gr23
                  </Link>
                </li> */}
                {/* <li>
                  <Link
                    href="planner"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Planner
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="preenrollment"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Pre-enrollment
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
              <div className="w-full h-full">{children}</div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
