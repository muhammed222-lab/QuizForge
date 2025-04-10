import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FileText,
  Shield,
  BrainCircuit,
  Clock,
  Users,
  BarChart,
} from "lucide-react";

const features = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Material Conversion",
    description:
      "Upload PDFs, DOCX, PPTs and let AI generate questions automatically",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Exams",
    description:
      "Anti-cheating measures including tab monitoring and access keys",
  },
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "AI Question Generation",
    description:
      "Automatically creates diverse question types from your content",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Time-Saving",
    description: "Reduce exam creation time from hours to minutes",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Student Management",
    description: "Bulk import students and track individual performance",
  },
  {
    icon: <BarChart className="h-6 w-6" />,
    title: "Detailed Analytics",
    description: "Understand class performance with comprehensive reports",
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powerful Features for Educators
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Everything you need to create, manage, and analyze assessments
          </p>
        </div>
        <div className="mt-12 grid justify-items-center grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 w-full max-w-sm"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
