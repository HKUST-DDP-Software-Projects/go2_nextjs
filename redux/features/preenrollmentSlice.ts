import { CourseDetail } from "@/helpers/course";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PreenrollmentSlice = {
  shoppingCart: CourseDetail[];
};

const initialState = {
  shoppingCart: [],
} as PreenrollmentSlice;

export const preenrollmentSlice = createSlice({
  name: "preenrollment",
  initialState,
  reducers: {
    addCourse: (state, action: PayloadAction<CourseDetail>) => {
      state.shoppingCart.push(action.payload);
    },
    removeCourse: (state, action: PayloadAction<CourseDetail>) => {
      state.shoppingCart = state.shoppingCart.filter(
        (course) => course.code !== action.payload.code,
      );
    },
    moveCourseToFront: (state, action: PayloadAction<CourseDetail>) => {
      state.shoppingCart = state.shoppingCart.filter(
        (course) => course.code !== action.payload.code,
      );
      state.shoppingCart.unshift(action.payload);
    },
  },
});

export const { addCourse, removeCourse, moveCourseToFront } =
  preenrollmentSlice.actions;
export default preenrollmentSlice.reducer;
