import {
  CourseDetail,
  CourseEnrollment,
  CourseStatus,
  COURSE_CATALOG,
} from "@/helpers/course";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";

export type CourseState = {
  courseHistory: CourseEnrollment[];
  courseHistoryString: string[];
  courseCatalog: Record<string, CourseDetail>;
};

export const selectCourseCodes = createSelector(
  (state: CourseState) => state.courseHistory, // Provide the correct type for the 'courseEnrollments' parameter
  (courseEnrollments) => courseEnrollments.map((course) => course.code),
);

const initialState = {
  courseHistory: [],
  courseHistoryString: [],
  courseCatalog: Object.fromEntries(
    COURSE_CATALOG.map((course) => [course.code, course]),
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
            prerequisites: [],
            exclusions: [],
            corequisites: [],
          };
        }
      });
    },
    addCourseEnrollment: (state, action: PayloadAction<CourseEnrollment>) => {
      state.courseHistory.push(action.payload);
      state.courseHistoryString.push(action.payload.code);
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
      state.courseHistoryString[index] = newCourseEnrollment.code;
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
      state.courseHistoryString.splice(index, 1);
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

          state.courseHistoryString = state.courseHistory.map(
            (course) => course.code,
          );
          return;
        }
      } catch (e: any) {
        console.log("not raw json", e);
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
          courses.push({
            ...d.groups,
            units: parseFloat(d.groups.units),
          } as CourseEnrollment);
        }
      });

      state.courseHistory = courses;
      state.courseHistoryString = courses.map((course) => course.code);
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
