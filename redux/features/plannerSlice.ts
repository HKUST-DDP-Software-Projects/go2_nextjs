import {
  CourseListMap,
  GR23,
  ProgrammeRequirement,
  programRequirements,
} from "@/helpers/requirement";
import { createSlice } from "@reduxjs/toolkit";

type Degree = {
  name: string;
  requirements: ProgrammeRequirement[];
};

type PlannerState = {
  selectedProgrammes: Degree[];
  planner: CourseListMap[];
  gr23s: GR23[];
};

const initialState = {
  selectedProgrammes: [
    {
      name: "BEng in Computer Science [1920]",
      requirements: programRequirements.filter((programRequirements) => {
        return [
          "Common Core [before 2022] (CC)",
          "BEng in Computer Science [1920] (COMP)",
        ].includes(programRequirements.name);
      }),
    },
    {
      name: "BBA in General Business Management [1920]",
      requirements: programRequirements.filter((programRequirements) => {
        return [
          "Common Core [before 2022] (CC)",
          "BBA in General Business Management [1920] (GBM)",
        ].includes(programRequirements.name);
      }),
    },
  ],
  gr23s: [],
  planner: [new Map(), new Map()],
} as PlannerState;

export const planner = createSlice({
  name: "planner",
  initialState,
  reducers: {
    reset: () => initialState,
    // addProgramme: (
    //   state,
    //   action: PayloadAction<[number, ProgrammeRequirement]>,
    // ) => {
    //   const [index, programme] = action.payload;
    //   state.selectedProgrammes[index].push(programme);
    // },
    // removeProgramme: (state, action: PayloadAction<string>) => {
    //   state.selectedProgrammes = state.selectedProgrammes.filter(
    //     (program) => program.name !== action.payload,
    //   );
    // },
  },
});

export const { reset } = planner.actions;
export default planner.reducer;
