import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const posts = [
  {
    id: 1,
    title: "How AI is Transforming Education",
    excerpt: "Exploring the impact of AI on modern teaching methods.",
    date: "May 15, 2023",
  },
  {
    id: 2,
    title: "Best Practices for Online Exams",
    excerpt: "Tips to create effective and secure online assessments.",
    date: "April 28, 2023",
  },
  {
    id: 3,
    title: "Engaging Students with Interactive Quizzes",
    excerpt: "Creative ways to make learning more interactive.",
    date: "March 10, 2023",
  },
];

export default function BlogPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground">
          Insights and tips for educators
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`}>
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <p className="text-sm text-muted-foreground">{post.date}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
