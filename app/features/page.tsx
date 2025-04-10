import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, FileText, Users, Clock, Lock, BrainCircuit } from "lucide-react";

const features = [
  {
    title: "AI-Powered Questions",
    description: "Automatically generate exam questions from your materials.",
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
  },
  {
    title: "Multiple Question Types",
    description: "MCQs, essays, true/false, and more.",
    icon: <FileText className="h-8 w-8 text-primary" />,
  },
  {
    title: "Class Management",
    description: "Organize students and materials by class.",
    icon: <Book className="h-8 w-8 text-primary" />,
  },
  {
    title: "Student Tracking",
    description: "Monitor performance and progress over time.",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: "Timed Exams",
    description: "Set time limits and automatic submission.",
    icon: <Clock className="h-8 w-8 text-primary" />,
  },
  {
    title: "Secure Testing",
    description: "Anti-cheating measures and proctoring options.",
    icon: <Lock className="h-8 w-8 text-primary" />,
  },
];

export default function FeaturesPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Powerful Features</h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to create, manage, and analyze exams
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                {feature.icon}
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
  );
}
