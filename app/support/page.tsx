import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Phone } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Support Center</h1>
        <p className="text-xl text-muted-foreground">
          We&apos;re here to help you with any questions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full inline-block">
            <Mail className="h-8 w-8 text-primary mx-auto" />
          </div>
          <h3 className="text-xl font-semibold">Email Support</h3>
          <p className="text-muted-foreground">
            Get help via email with our support team
          </p>
          <Button asChild>
            <a href="mailto:support@quizforge.com">Contact Us</a>
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full inline-block">
            <MessageSquare className="h-8 w-8 text-primary mx-auto" />
          </div>
          <h3 className="text-xl font-semibold">Live Chat</h3>
          <p className="text-muted-foreground">
            Chat with our support team in real-time
          </p>
          <Button asChild>
            <a href="#">Start Chat</a>
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full inline-block">
            <Phone className="h-8 w-8 text-primary mx-auto" />
          </div>
          <h3 className="text-xl font-semibold">Phone Support</h3>
          <p className="text-muted-foreground">Call us during business hours</p>
          <Button asChild>
            <a href="tel:+18005551234">+1 (800) 555-1234</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
