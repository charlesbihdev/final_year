"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/courses");
  }, []);

  return <div>loading....</div>;
};

export default page;
