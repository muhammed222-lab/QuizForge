"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "High School Biology Teacher",
    content:
      "QuizForge has cut my exam creation time in half. The AI-generated questions are surprisingly accurate and save me hours of work.",
    avatar: "/avatars/sarah.jpg",
  },
  {
    name: "Michael Chen",
    role: "University Professor",
    content:
      "The anti-cheating features give me peace of mind during online exams. My students can't switch tabs or look up answers.",
    avatar: "/avatars/michael.jpg",
  },
  {
    name: "Emma Rodriguez",
    role: "Corporate Trainer",
    content:
      "Being able to upload PowerPoints and get immediate questions is a game-changer for our employee training programs.",
    avatar: "/avatars/emma.jpg",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
            Trusted by Educators
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Join thousands of teachers who save time with QuizForge
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="relative rounded-xl border p-6 shadow-sm bg-white dark:bg-gray-700 transition-shadow hover:shadow-lg"
            >
              <div className="flex flex-col items-center">
                <Avatar className="w-12 h-12 mb-4">
                  <AvatarImage
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <blockquote className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-200 italic">
                  &quot;{testimonial.content}&quot;
                </blockquote>
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
