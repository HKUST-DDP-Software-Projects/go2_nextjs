import rawCourses from "@/helpers/all_courses_w_prereq.json";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

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

export type CourseState = {
  courseHistory: CourseEnrollment[];
  courseCatalog: Record<string, CourseDetail>;
};

export const selectCourseCodes = createSelector(
  (state: CourseState) => state.courseHistory, // Provide the correct type for the 'courseEnrollments' parameter
  (courseEnrollments) => courseEnrollments.map((course) => course.code)
);

const initialState = {
  courseHistory: [],
  courseCatalog: Object.fromEntries(
    rawCourses.map((course) => [
      course.code,
      {
        code: course.code,
        title: course.title,
        units: parseInt(course.credits),
      },
    ]),
  ),
} as CourseState;

export const course = createSlice({
  name: "course",
  initialState,
  reducers: {
    reset: () => initialState,
    mergeCourseCatalog: (state, action: PayloadAction<CourseEnrollment[]>) => {
      // add missing course to courseCatalog
      action.payload.forEach((course) => {
        if (!(course.code in state.courseCatalog)) {
          state.courseCatalog[course.code] = {
            code: course.code,
            title: course.title,
            units: course.units,
          };
        }
      });
    },
    addCourseEnrollment: (state, action: PayloadAction<CourseEnrollment>) => {
      state.courseHistory.push(action.payload);
      // window.localStorage.setItem(
      //   "courseHistory",
      //   JSON.stringify(state.courseHistory),
      // );
    },
    editCourseEnrollment: (
      state,
      action: PayloadAction<[CourseEnrollment, CourseEnrollment]>,
    ) => {
      const [oldCourseEnrollment, newCourseEnrollment] = action.payload;
      const index = state.courseHistory.findIndex(
        (courseEnrollment) =>
          courseEnrollment.code === oldCourseEnrollment.code &&
          courseEnrollment.term === oldCourseEnrollment.term,
      );
      state.courseHistory[index] = newCourseEnrollment;
      // window.localStorage.setItem(
      //   "courseHistory",
      //   JSON.stringify(state.courseHistory),
      // );
    },
    removeCourseEnrollment: (
      state,
      action: PayloadAction<CourseEnrollment>,
    ) => {
      const index = state.courseHistory.findIndex(
        (courseEnrollment) =>
          courseEnrollment.code === action.payload.code &&
          courseEnrollment.term === action.payload.term,
      );
      state.courseHistory.splice(index, 1);
      // window.localStorage.setItem(
      //   "courseHistory",
      //   JSON.stringify(state.courseHistory),
      // );
    },
    handleImport: (state, action: PayloadAction<string>) => {
      const rawData = action.payload;
      try {
        const courses = JSON.parse(rawData);
        // check if courses is a string array
        if (courses.length > 0 && typeof courses[0] === "string") {
          state.courseHistory = courses.map((course: string) => {
            const courseDetail = state.courseCatalog[course];
            if (!courseDetail) return;
            return {
              code: course,
              title: courseDetail?.title || "",
              term: "",
              grade: "P",
              units: courseDetail?.units || 0,
              status: CourseStatus.PLANNED,
            } as CourseEnrollment;
          });
          return;
        }
      } catch (e) {
        console.log("not raw json");
      }

      const data = rawData.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
      console.log("Parsing course history", data);

      const regex =
        // eslint-disable-next-line no-control-regex
        /Course	Description	Term	Grade	Units	Status\n((([^\t\n]*\t){5}[^\t\n]*\n)*)/g;
      const courseTable = regex.exec(data);
      if (courseTable == null) {
        window.alert("Unable to locate the course history table");
        return;
      }

      // .trim() remove ending \n
      const courseLines = courseTable[1].trim().split("\n");
      const courses: CourseEnrollment[] = [];
      courseLines.forEach((courseLine) => {
        const regex =
          /(?<code>[^\t\n]*)\t(?<title>[^\t\n]*)\t(?<term>[^\t\n]*)\t(?<grade>[^\t\n]*)\t(?<units>[^\t\n]*)\t(?<status>[^\t\n]*)/g;
        const d = regex.exec(courseLine);
        if (d?.groups) {
          courses.push(d.groups as unknown as CourseEnrollment);
        }
      });

      state.courseHistory = courses;
      // window.localStorage.setItem(
      //   "courseHistory",
      //   JSON.stringify(state.courseHistory),
      // );
    },
  },
});

export const {
  reset,
  addCourseEnrollment,
  editCourseEnrollment,
  removeCourseEnrollment,
  handleImport,
} = course.actions;
export default course.reducer;
