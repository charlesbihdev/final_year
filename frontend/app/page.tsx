"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AttendancePage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  }, []);

  return <div></div>;
}
