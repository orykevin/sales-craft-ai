"use client";

import { redirect } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  console.log(isAuthenticated, isLoading, "test");
  useEffect(() => {
    if (isAuthenticated) {
      redirect("/sales-pages");
    } else {
      redirect("/sign-in");
    }
  }, [isAuthenticated, isLoading]);
  return null;
}

