import AuthForm from "@/components/auth/AuthForm";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthSocialButtons from "@/components/auth/AuthSocialButtons";

export const metadata = {
  title: "Sign In | QuizForge",
  description: "Access your QuizForge account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </div>

        <AuthSocialButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <AuthForm type="login" />

        <AuthToggle
          prompt="New to QuizForge?"
          linkText="Create account"
          href="/auth/signup"
        />
      </div>
    </div>
  );
}
