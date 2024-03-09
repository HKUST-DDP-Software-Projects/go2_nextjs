import courses from "@/helpers/all_courses_w_prereq.json";
// import { CourseEnrollment } from "@/redux/features/courseSlice";

export interface Course {
    code: string;
    title: string;
    credits: string;
    prerequisites: prerequisites[];
    exclusions: exclusions[];
    corequisites: corequisites[];
}


export interface prerequisites {
    description: string;
    rules: rules[];
    needManualCheck?: boolean;
}


export interface exclusions {
    description: string;
    rules: rules[];
    needManualCheck?: boolean;
}

export interface corequisites {
    description: string;
    rules: rules[];
    needManualCheck?: boolean;
}

export interface rules {
    courses: string[];
    minCourseCnt: number;
    needManualCheck?: boolean;
}

export const courseCatalog = courses as Course[];

function overlap(v1: string[], v2: string[]): string[] {
    const overlapCourses: string[] = [];
  
    new Set(v1).forEach((v1Course) => {
      if (v2.includes(v1Course)) overlapCourses.push(v1Course);
    });
  
    return overlapCourses;
  }
function checkPrerequisite(
    rule: rules,
    selectedCourses: string[],
    ): boolean {
    // const courseList: string[] = [];
    // courseList.push(...rule.courses)

    const vs = overlap(rule.courses, selectedCourses);
    const courseCount = vs.length;
    if (rule.minCourseCnt && courseCount < rule.minCourseCnt) return false;
    return true;
}

function checkPrerequisiteSet(
    pSet: prerequisites,
    selectedCourses: string[],
    ): boolean {
    return pSet.rules.every((rule) => checkPrerequisite(rule, selectedCourses));
    }

export function checkPrerequisiteGroup(
    course: Course,
    selectedCourses: string[],
    ): boolean {
    if (!course.prerequisites) return true;
    return course.prerequisites.some((pSet) => checkPrerequisiteSet(pSet, selectedCourses));
    }