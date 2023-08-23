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
  selectedProgrammes: Degree[];
  planner: {
    [key: string]: string[];
  }[];
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
  planner: [{}, {}],
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
      state.selectedProgrammes = degreeSelections.map((degreeSelection) => {
        const originalRequirements = programRequirements.filter(
          (programRequirements) => {
            return degreeSelection.programmes.includes(
              programRequirements.name,
            );
          },
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
      const requirements = state.selectedProgrammes[index].requirements;

      const fullResult = assignCoursesToCourseLists(
        requirements,
        courseEnrollments,
      );

      if (!fullResult) {
        alert(
          "No suitable full matching. Partial matching, if available, is displayed.",
        );
        state.planner = assignCoursesToCourseListsPartial(
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
        state.planner = fullResult.map.map((courseListMap) =>
          Object.fromEntries(
            [...courseListMap.entries()].map(([key, value]) => [
              key.split(" ")[1],
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
