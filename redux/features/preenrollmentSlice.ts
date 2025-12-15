import { CourseDetail } from "@/helpers/course";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PreenrollmentSlice = {
  shoppingCart: CourseDetail[];
  shoppingCartCredits: number;
  qualtricsUnmetPrereqs: { code: string; reason: string }[];
  suggestedAutoAddedCodes: string[];
  suggestedUnmetPrereqs: { code: string; reason: string }[];
  suggestedExcluded: { code: string; reason: string }[];
  suggestedRemoved: { code: string; reason?: string }[];
};

const initialState = {
  shoppingCart: [],
  shoppingCartCredits: 0,
  qualtricsUnmetPrereqs: [],
  suggestedAutoAddedCodes: [],
  suggestedUnmetPrereqs: [],
  suggestedExcluded: [],
  suggestedRemoved: [],
} as PreenrollmentSlice;

export const preenrollmentSlice = createSlice({
  name: "preenrollment",
  initialState,
  reducers: {
    addCourse: (state, action: PayloadAction<CourseDetail>) => {
      state.shoppingCart.push(action.payload);
      state.shoppingCartCredits = state.shoppingCart.reduce(
        (acc, c) => acc + (c.units || 0),
        0,
      );
    },
    removeCourse: (state, action: PayloadAction<CourseDetail>) => {
      const removedCode = action.payload.code;
      // defensive: persisted state may be missing new arrays
      state.suggestedAutoAddedCodes = state.suggestedAutoAddedCodes || [];
      state.suggestedRemoved = state.suggestedRemoved || [];
      // If this was auto-added from suggested pathway, record removal
      if (state.suggestedAutoAddedCodes.includes(removedCode)) {
        state.suggestedRemoved.push({ code: removedCode, reason: "removed-by-user" });
        state.suggestedAutoAddedCodes = state.suggestedAutoAddedCodes.filter(
          (c) => c !== removedCode,
        );
      }

      state.shoppingCart = state.shoppingCart.filter(
        (course) => course.code !== removedCode,
      );
      state.shoppingCartCredits = state.shoppingCart.reduce(
        (acc, c) => acc + (c.units || 0),
        0,
      );
    },
    moveCourseToFront: (state, action: PayloadAction<CourseDetail>) => {
      state.shoppingCart = state.shoppingCart.filter(
        (course) => course.code !== action.payload.code,
      );
      state.shoppingCart.unshift(action.payload);
      state.shoppingCartCredits = state.shoppingCart.reduce(
        (acc, c) => acc + (c.units || 0),
        0,
      );
    },
    addQualtricsUnmetPrereq: (
      state,
      action: PayloadAction<{ code: string; reason: string }>,
    ) => {
      // defensive: persisted state may be missing new arrays
      state.qualtricsUnmetPrereqs = state.qualtricsUnmetPrereqs || [];
      state.qualtricsUnmetPrereqs.push(action.payload);
    },
    clearQualtricsUnmetPrereqs: (state) => {
      state.qualtricsUnmetPrereqs = [];
    },
    addSuggestedAutoAddedCode: (state, action: PayloadAction<string>) => {
      // defensive: persisted state may be missing new arrays
      state.suggestedAutoAddedCodes = state.suggestedAutoAddedCodes || [];
      if (!state.suggestedAutoAddedCodes.includes(action.payload)) {
        state.suggestedAutoAddedCodes.push(action.payload);
      }
    },
    addSuggestedUnmetPrereq: (
      state,
      action: PayloadAction<{ code: string; reason: string }>,
    ) => {
      // defensive: persisted state may be missing new arrays
      state.suggestedUnmetPrereqs = state.suggestedUnmetPrereqs || [];
      state.qualtricsUnmetPrereqs = state.qualtricsUnmetPrereqs || [];
      state.suggestedUnmetPrereqs.push(action.payload);
      state.qualtricsUnmetPrereqs.push(action.payload);
    },
    addSuggestedExcluded: (
      state,
      action: PayloadAction<{ code: string; reason: string }>,
    ) => {
      // defensive: persisted state may be missing new arrays
      state.suggestedExcluded = state.suggestedExcluded || [];
      state.qualtricsUnmetPrereqs = state.qualtricsUnmetPrereqs || [];
      state.suggestedExcluded.push(action.payload);
      state.qualtricsUnmetPrereqs.push(action.payload);
    },
    addSuggestedRemoved: (
      state,
      action: PayloadAction<{ code: string; reason?: string }>,
    ) => {
      // defensive: persisted state may be missing new arrays
      state.suggestedRemoved = state.suggestedRemoved || [];
      state.suggestedRemoved.push(action.payload);
    },
  },
});

export const {
  addCourse,
  removeCourse,
  moveCourseToFront,
  addQualtricsUnmetPrereq,
  clearQualtricsUnmetPrereqs,
  addSuggestedAutoAddedCode,
  addSuggestedUnmetPrereq,
  addSuggestedExcluded,
  addSuggestedRemoved,
} = preenrollmentSlice.actions;
export default preenrollmentSlice.reducer;
