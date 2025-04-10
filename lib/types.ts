export interface Event {
  title: string;
  start: Date;
  end: Date;
  className?: string;
}
export interface Student {
  id: string;
  name: string;
  email: string;
  class_name?: string;
  enrollment_date?: string;
}
export interface Exam {
  id: string;
  title: string;
  class_id: string;
  classes: { name: string };
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_published: boolean;
}
