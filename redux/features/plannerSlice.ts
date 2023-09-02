import {
  assignCoursesToCourseLists,
  assignCoursesToCourseListsPartial,
  populateCourseListObject,
} from "@/helpers/matcher";
import {
  GR23,
  ProgrammeRequirement,
  programRequirements,
} from "@/helpers/requirement";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CourseEnrollment } from "./courseSlice";

type Degree = {
  name: string;
  requirements: ProgrammeRequirement[];
};

type DegreeSelection = {
  name: string;
  programmes: string[];
};

type PlannerState = {
  selectedDegrees: Degree[];
  planner: Record<string, string[]>[][];
  gr23s: GR23[];
};

const initialState = {
  selectedDegrees: [],
  gr23s: [],
  planner: [],
} as PlannerState;

export const planner = createSlice({
  name: "planner",
  initialState,
  reducers: {
    reset: () => initialState,
    setSelectedProgrammes: (
      state,
      action: PayloadAction<[CourseEnrollment[], DegreeSelection[]]>,
    ) => {
      const [courseEnrollments, degreeSelections] = action.payload;
      state.planner = degreeSelections.map(() => []);
      state.selectedDegrees = degreeSelections.map((degreeSelection) => {
        const originalRequirements = degreeSelection.programmes.map(
          (programmeName) =>
            programRequirements.find(
              (programme) => programme.name === programmeName,
            )!,
        );

        const requirements = JSON.parse(
          JSON.stringify(originalRequirements),
        ) as ProgrammeRequirement[];

        requirements.forEach((programme) => {
          programme.requirementGroups
            .flatMap((rg) => rg.requirements)
            .forEach((r) => {
              r.lists = populateCourseListObject(
                programme,
                r.lists,
                courseEnrollments,
                state.gr23s,
              );
            });
        });

        return {
          name: degreeSelection.name,
          requirements,
        };
      });
    },
    match: (state, action: PayloadAction<[CourseEnrollment[], number]>) => {
      const [courseEnrollments, index] = action.payload;
      const requirements = state.selectedDegrees[index].requirements;

      const fullResult = assignCoursesToCourseLists(
        requirements,
        courseEnrollments,
      );

      if (!fullResult) {
        alert(
          "No suitable full matching. Partial matching, if available, is displayed.",
        );
        state.planner[index] = assignCoursesToCourseListsPartial(
          requirements,
          courseEnrollments,
        ).map((courseListMap) =>
          Object.fromEntries(
            [...courseListMap.entries()].map(([key, value]) => [
              key.split(": ")[1],
              value,
            ]),
          ),
        );
      } else {
        state.planner[index] = fullResult.map.map((courseListMap) =>
          Object.fromEntries(
            [...courseListMap.entries()].map(([key, value]) => [
              key.split(": ")[1],
              value,
            ]),
          ),
        );
      }
    },
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

export const { reset, match, setSelectedProgrammes } = planner.actions;
export default planner.reducer;
