import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="w-full overflow-hidden py-12 md:py-24 bg-primary/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Transform Your Assessments?
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Join thousands of educators saving time with QuizForge
          </p>
          <div className="space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started Free
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
