import Link from "next/link";

interface AuthToggleProps {
  prompt: string;
  linkText: string;
  href: string;
}

export default function AuthToggle({
  prompt,
  linkText,
  href,
}: AuthToggleProps) {
  return (
    <div className="text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link href={href} className="font-medium text-primary hover:underline">
        {linkText}
      </Link>
    </div>
  );
}
