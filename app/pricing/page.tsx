import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For individual educators getting started",
    features: [
      "5 exams per month",
      "Basic question types",
      "Up to 30 students",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$15",
    description: "For teachers with multiple classes",
    features: [
      "Unlimited exams",
      "All question types",
      "Up to 200 students",
      "Priority support",
      "AI question generation",
    ],
    cta: "Upgrade Now",
    featured: true,
  },
  {
    name: "Institution",
    price: "Custom",
    description: "For schools and universities",
    features: [
      "Unlimited everything",
      "Custom branding",
      "SSO integration",
      "Dedicated account manager",
      "Advanced analytics",
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col",
              plan.featured && "border-2 border-primary shadow-xl"
            )}
          >
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-4xl font-bold">{plan.price}</div>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="w-full"
                variant={plan.featured ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
