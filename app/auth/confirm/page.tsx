/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    });
  }, [supabase, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm text-center">
        {loading ? (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <h1 className="text-2xl font-bold">Confirming your email</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your account
            </p>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold">Confirmation failed</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/auth/signup">Try again</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Email confirmed</h1>
            <p className="text-muted-foreground">
              Your email has been successfully verified
            </p>
            <Button asChild>
              <Link href="/auth/login">Sign in now</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
