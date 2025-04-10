import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              From PDF to Exam in Minutes
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              QuizForge transforms your learning materials into secure,
              customizable exams with AI-powered question generation.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="w-full max-w-4xl mt-8">
            <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-xl border bg-gray-100 dark:bg-gray-800">
              <Image
                src="/demo-screenshot.png"
                alt="QuizForge interface"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
