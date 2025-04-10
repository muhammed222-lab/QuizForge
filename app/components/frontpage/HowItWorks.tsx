import { ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Upload Materials",
    description: "Add your PDFs, PowerPoints, or Word documents",
  },
  {
    title: "AI Generates Questions",
    description: "Our system automatically creates relevant questions",
  },
  {
    title: "Customize Your Exam",
    description: "Edit questions, set time limits, and configure security",
  },
  {
    title: "Share with Students",
    description: "Distribute secure access links to your class",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
            How QuizForge Works
          </h2>
          <p className="mt-4 max-w-[700px] mx-auto text-gray-500 md:text-xl dark:text-gray-400">
            Transform your teaching materials into assessments in 4 simple steps
          </p>
        </div>
        <div className="relative mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center relative"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-xl font-bold mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-[-40px] transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
