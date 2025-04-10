/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FcGoogle } from "react-icons/fc"; // Import Google icon from react-icons
import { FaGithub } from "react-icons/fa"; // Import GitHub icon from react-icons
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function AuthSocialButtons() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setLoading(provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/confirm`,
        },
      });

      if (error) throw error;

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={() => handleOAuthLogin("google")}
        disabled={!!loading}
      >
        {loading === "google" ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          <>
            <FcGoogle className="h-4 w-4 mr-2" />
            Continue with Google
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={() => handleOAuthLogin("github")}
        disabled={!!loading}
      >
        {loading === "github" ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          <>
            <FaGithub className="h-4 w-4 mr-2" />
            Continue with GitHub
          </>
        )}
      </Button>
    </div>
  );
}
