import courses from "@/helpers/all_courses_w_prereq.json";

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

export interface CourseDetail {
  code: string;
  title: string;

  // int representation of credits
  units: number;

  prerequisites: CoursePrerequisite[];
  exclusions: CourseExclusion[];
  corequisites: CourseCorequisite[];
}

export interface CoursePrerequisite {
  description: string;
  rules: CourseRequisiteRule[];
  needManualCheck?: boolean;
}

export interface CourseExclusion {
  description: string;
  rules: CourseRequisiteRule[];
  needManualCheck?: boolean;
}

export interface CourseCorequisite {
  description: string;
  rules: CourseRequisiteRule[];
  needManualCheck?: boolean;
}

export interface CourseRequisiteRule {
  courses: string[];
  minCourseCnt: number;
  needManualCheck?: boolean;
}

export const COURSE_CATALOG = courses.map((course) => {
  return {
    ...course,
    units: parseInt(course.credits),
  };
});

function overlap(v1: string[], v2: string[]): string[] {
  const overlapCourses: string[] = [];

  new Set(v1).forEach((v1Course) => {
    if (v2.includes(v1Course)) overlapCourses.push(v1Course);
  });

  return overlapCourses;
}
function checkPrerequisite(
  rule: CourseRequisiteRule,
  selectedCourses: string[],
): boolean {
  // const courseList: string[] = [];
  // courseList.push(...rule.courses)

  const vs = overlap(rule.courses, selectedCourses);
  // console.log("vs", vs);
  const courseCount = vs.length;
  // console.log("courseCount", courseCount, rule.minCourseCnt)
  if (rule.minCourseCnt && courseCount >= rule.minCourseCnt) return true;
  return false;
}

function checkPrerequisiteSet(
  pSet: CoursePrerequisite,
  selectedCourses: string[],
): boolean {
  return pSet.rules.every((rule) => checkPrerequisite(rule, selectedCourses));
}

export function checkPrerequisiteGroup(
  course: CourseDetail,
  selectedCourses: string[],
): boolean {
  if (!course.prerequisites || course.prerequisites.length === 0) return true;
  const result = course.prerequisites.some(
    (pSet) =>
      !pSet.needManualCheck && checkPrerequisiteSet(pSet, selectedCourses),
  );

  // console.log("result", result, course.code);
  return result;
}

function checkCorequisite(
  rule: CourseRequisiteRule,
  selectedCourses: string[],
): boolean {
  // const courseList: string[] = [];
  // courseList.push(...rule.courses)

  const vs = overlap(rule.courses, selectedCourses);
  const courseCount = vs.length;
  if (rule.minCourseCnt && courseCount < rule.minCourseCnt) return false;
  return true;
}

function returnCorequisiteSet(
  pSet: CourseCorequisite,
  selectedCourses: string[],
): string[] {
  const excludedCourses: string[] = [];
  pSet.rules.forEach((rule) => {
    if (!checkCorequisite(rule, selectedCourses)) {
      excludedCourses.push(...rule.courses);
    }
  });
  return excludedCourses;
}

export function returnCorequisiteGroup(
  course: CourseDetail | undefined,
  selectedCourses: string[],
): string[] {
  if (!course) return [];
  if (!course.corequisites) return [];
  const eCourses: string[] = [];
  course.corequisites.forEach((pSet) => {
    if (returnCorequisiteSet(pSet, selectedCourses).length > 0) {
      return returnCorequisiteSet(pSet, selectedCourses);
    }
  });
  return [];
}

function checkExclusion(
  rule: CourseRequisiteRule,
  selectedCourses: string[],
): boolean {
  // const courseList: string[] = [];
  // courseList.push(...rule.courses)

  const vs = overlap(rule.courses, selectedCourses);
  const courseCount = vs.length;
  if (rule.minCourseCnt && courseCount < rule.minCourseCnt) return false;
  return true;
}

function checkExclusionSet(
  pSet: CourseExclusion,
  selectedCourses: string[],
): boolean {
  return pSet.rules.every((rule) => checkExclusion(rule, selectedCourses));
}

export function checkExclusionGroup(
  course: CourseDetail,
  selectedCourses: string[],
): boolean {
  if (!course.exclusions || course.exclusions.length === 0) return false;
  return course.exclusions.some(
    (pSet) => !pSet.needManualCheck && checkExclusionSet(pSet, selectedCourses),
  );
}
