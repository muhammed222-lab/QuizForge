import AuthForm from "@/components/auth/AuthForm";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthSocialButtons from "@/components/auth/AuthSocialButtons";

export const metadata = {
  title: "Sign Up | QuizForge",
  description: "Create your QuizForge account",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">
            Start generating exams in seconds
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

        <AuthForm type="signup" />

        <AuthToggle
          prompt="Already have an account?"
          linkText="Sign in"
          href="/auth/login"
        />
      </div>
    </div>
  );
}
