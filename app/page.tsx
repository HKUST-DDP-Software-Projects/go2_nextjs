"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  // redirect to personal details page
  const router = useRouter();
  router.push("/personal");
}
