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
    // console.log("vs", vs);
    const courseCount = vs.length;
    // console.log("courseCount", courseCount, rule.minCourseCnt)
    if (rule.minCourseCnt && courseCount >= rule.minCourseCnt) return true;
    return false;
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
    const result = course.prerequisites.some((pSet) => checkPrerequisiteSet(pSet, selectedCourses));
    
    // console.log("result", result, course.code);
    return result;
    }


function checkCorequisite(
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

function returnCorequisiteSet(
    pSet: corequisites,
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
    course: Course | undefined,
    selectedCourses: string[],
    ): string[] {
        if(!course) return [];
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

function checkExclusionSet(
    pSet: exclusions,
    selectedCourses: string[],
    ): boolean {
    return pSet.rules.every((rule) => checkExclusion(rule, selectedCourses));
    }

export function checkExclusionGroup(
    course: Course,
    selectedCourses: string[],
    ): boolean {
    if (!course.exclusions) return false;
    return course.exclusions.some((pSet) => checkExclusionSet(pSet, selectedCourses));
    }