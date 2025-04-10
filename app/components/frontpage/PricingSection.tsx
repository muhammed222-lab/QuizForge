import { CheckIcon } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individual teachers getting started",
    features: [
      "3 active classes",
      "50 student accounts",
      "Basic question generation",
      "Essential exam security",
    ],
    cta: "Get Started",
  },
  {
    name: "Professional",
    price: "$9",
    period: "/month",
    description: "For educators who need more resources",
    features: [
      "Unlimited classes",
      "300 student accounts",
      "Advanced AI questions",
      "Enhanced security",
      "Basic analytics",
    ],
    cta: "Upgrade Now",
  },
  {
    name: "Institution",
    price: "$499",
    period: "/year",
    description: "Complete solution for schools and universities",
    features: [
      "Unlimited everything",
      "Custom domain",
      "Priority support",
      "Advanced analytics",
      "LMS integration",
      "SSO authentication",
    ],
    cta: "Contact Sales",
    featured: true,
  },
];

export default function PricingSection() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl border p-6 shadow-sm transform transition-all duration-300 hover:scale-105 ${
                plan.featured
                  ? "border-primary ring-2 ring-primary"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-end mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  plan.featured
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
