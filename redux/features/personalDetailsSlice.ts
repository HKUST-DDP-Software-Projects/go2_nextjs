import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PersonalDetailsState = {
  name: string;
  studentId: string;
  admissionYear: string;
  engineeringMajor: string;
  businessMajor: string;
};

const initialState = {
  name: "",
  studentId: "",
  admissionYear: "",
  engineeringMajor: "",
  businessMajor: "",
} as PersonalDetailsState;

export const personalDetails = createSlice({
  name: "personalDetails",
  initialState,
  reducers: {
    setPersonalDetails: (
      state,
      action: PayloadAction<PersonalDetailsState>,
    ) => {
      state.name = action.payload.name;
      state.studentId = action.payload.studentId;
      state.admissionYear = action.payload.admissionYear;
      state.engineeringMajor = action.payload.engineeringMajor;
      state.businessMajor = action.payload.businessMajor;
    },
  },
});

export const { setPersonalDetails } = personalDetails.actions;
export default personalDetails.reducer;
