export type CourseDetail = {
  code: string;
  title: string;
  units: number;
};

export enum CourseStatus {
  TAKEN = "Taken",
  TRANSFERRED = "Transferred",
  IN_PROGRESS = "In Progress",
  PLANNED = "Planned",
}

export type CourseGrade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D"
  | "F"
  | "AU"
  | "DI"
  | "PA"
  | "I"
  | "P"
  | "PP"
  | "T"
  | "W"
  | "";

export type CourseEnrollment = {
  term: string;
  grade: CourseGrade;
  status: CourseStatus;
} & CourseDetail;

export function gradeToNumber(grade: string): number {
  switch (grade) {
    case "A+":
      return 4.3;
    case "A":
      return 4;
    case "A-":
      return 3.7;
    case "B+":
      return 3.3;
    case "B":
      return 3;
    case "B-":
      return 2.7;
    case "C+":
      return 2.3;
    case "C":
      return 2;
    case "C-":
      return 1.7;
    case "D":
      return 1;
    default:
      return 0;
  }
}
// Return true if the grade is relevant to the GPA calculation

export function isCourseGradeRelevant(grade: CourseGrade): boolean {
  return !["AU", "DI", "PA", "I", "P", "PP", "T", "W", ""].includes(grade);
}
// Return true if the course is relevant to requirement matching
// TODO: Check if there is any other grade that makes the course irrelevant

export function isCourseRelevant(course: CourseEnrollment): boolean {
  return (
    (course.status === CourseStatus.TAKEN && !["AU"].includes(course.grade)) ||
    course.status === CourseStatus.TRANSFERRED
  );
}
