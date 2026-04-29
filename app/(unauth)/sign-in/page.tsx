"use client";

import SignIn from "@/app/(unauth)/sign-in/SignIn";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </div>
  );
}
