import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./components/providers";
import "./globals.css";
import SupabaseProvider from "./components/supabase-provider";
import { createClient } from "@supabase/supabase-js";
import Header from "./components/header";
import Footer from "./components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "QuizForge - AI-Powered Exam Generator",
    template: "%s | QuizForge",
  },
  description:
    "Transform learning materials into exams in seconds with AI-powered question generation and secure proctoring.",
  keywords: [
    "exam generator",
    "quiz maker",
    "AI questions",
    "online assessments",
    "education technology",
  ],
  authors: [{ name: "Muhammed Olayemi", url: "https://yourwebsite.com" }],
  creator: "Muhammed Olayemi",
  publisher: "Your Company",
  metadataBase: new URL("https://quizforge.yourdomain.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "QuizForge - AI-Powered Exam Generator",
    description: "Transform learning materials into exams in seconds",
    url: "https://quizforge.yourdomain.com",
    siteName: "QuizForge",
    images: [
      {
        url: "/quizforge.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuizForge - AI-Powered Exam Generator",
    description: "Transform learning materials into exams in seconds",
    images: ["/quizforge.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <SupabaseProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
