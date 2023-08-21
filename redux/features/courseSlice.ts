import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CourseDetail = {
  title: string;
  units: number;
  description: string;
};

export enum CourseStatus {
  TAKEN = "Taken",
  TRANSFERRED = "Transferred",
  IN_PROGRESS = "In Progress",
  PLANNED = "Planned",
}

export type CourseEnrollment = {
  code: string;
  term: string;
  grade: string;
  status: string;
} & CourseDetail;

export type CourseState = {
  courseHistory: CourseEnrollment[];
  courseCatalog: {
    [code: string]: CourseDetail;
  };
};

const initialState = {
  courseHistory: [],
  courseCatalog: {},
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
            title: course.title,
            units: course.units,
            description: course.description,
          };
        }
      });
    },
  },
});

export const { reset } = course.actions;
export default course.reducer;
