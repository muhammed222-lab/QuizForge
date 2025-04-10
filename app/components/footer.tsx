import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/quizforge.png"
                alt="QuizForge Logo"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered exam generation for modern educators.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/examples" className="hover:text-foreground">
                  Examples
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/docs" className="hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} QuizForge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
