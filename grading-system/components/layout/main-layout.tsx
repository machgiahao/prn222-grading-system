"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const getToken = async () => {
    const accessToken = await localStorage.getItem("accessToken");
    return accessToken;
  }

  useEffect(() => {
    getToken().then((accessToken) => {
      if (!accessToken) {
        router.push("/");
      }
    });
  }, [router]);
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
