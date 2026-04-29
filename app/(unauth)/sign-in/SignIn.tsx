"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
        },
        onError: (ctx) => {
          setLoading(false);
          alert(ctx.error.message);
        },
      },
    );
  };

  return (
    <Card className="w-full border-0 shadow-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl transition-all duration-500 overflow-hidden relative ring-1 ring-neutral-200/50 dark:ring-neutral-800/50 group">
      {/* Top Gradient Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <CardHeader className="space-y-4 pb-8 pt-10 px-8 text-center relative z-10">
        <div className="mx-auto bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-2 shadow-inner ring-1 ring-white/50 dark:ring-white/10">
          <Sparkles className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base px-2">
            Sign in to access your workspace
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8 relative z-10">
        <Button
          type="button"
          className="w-full h-14 text-base font-medium bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white dark:border-neutral-700/80 rounded-xl"
          disabled={loading}
          onClick={handleGoogleSignIn}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          {loading ? (
            <Loader2 size={20} className="animate-spin text-neutral-500" />
          ) : (
            <div className="flex items-center justify-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                />
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                />
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                />
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                />
              </svg>
              <span className="font-semibold tracking-wide">Continue with Google</span>
            </div>
          )}
        </Button>
      </CardContent>

    </Card>
  );
}

