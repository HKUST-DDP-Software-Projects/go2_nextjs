import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PersonalDetailsState = {
  name: string;
  studentId: string;
  email: string;
  admissionYear: string;
  engineeringMajor: string;
  businessMajor: string;
};

const initialState = {
  name: "",
  studentId: "",
  email: "",
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
      state.email = action.payload.email;
      state.admissionYear = action.payload.admissionYear;
      state.engineeringMajor = action.payload.engineeringMajor;
      state.businessMajor = action.payload.businessMajor;
    },
  },
});

export const { setPersonalDetails } = personalDetails.actions;
export default personalDetails.reducer;
