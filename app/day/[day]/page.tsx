import CourseApp from "../../CourseApp";

export function generateStaticParams() {
  return Array.from({ length: 14 }, (_, index) => ({
    day: String(index + 1),
  }));
}

export default function DayPage() {
  return <CourseApp />;
}
