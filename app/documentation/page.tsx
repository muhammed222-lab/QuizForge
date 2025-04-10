// app/documentation/page.tsx or similar
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";

const faqs = [
  {
    question: "How do I create my first exam?",
    answer:
      "Navigate to the Exams section and click 'New Exam'. Fill in the details and upload your materials.",
  },
  {
    question: "What file types can I upload?",
    answer:
      "We support PDFs, Word documents (DOCX), PowerPoint (PPTX), and images (JPG, PNG).",
  },
  {
    question: "How does the AI question generation work?",
    answer:
      "Our AI analyzes your uploaded materials and identifies key concepts to create relevant questions.",
  },
  {
    question: "Can students take exams on mobile devices?",
    answer: "Yes, our platform is fully responsive and works on all devices.",
  },
  {
    question: "How secure are the exams?",
    answer:
      "We use multiple anti-cheating measures including browser lockdown and activity monitoring.",
  },
];

export default function DocumentationPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="container py-12 space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Documentation & Help</h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions and learn how to use QuizForge
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>
                <span className="text-left">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        {/* Select Example */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Select an Option</h2>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calendar Example with Popover */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Pick a Date</h2>
          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar selectedDate={date || new Date()} onChange={setDate} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
