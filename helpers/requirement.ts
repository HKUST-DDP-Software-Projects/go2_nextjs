import rawProgramRequirements from "@/helpers/program_requirements.json";
import { CourseEnrollment } from "@/redux/features/courseSlice";

export type CourseEnrollmentListMap = Map<string, CourseEnrollment[]>;
export type CourseListMap = Map<string, string[]>;
export type CourseListObject = Record<string, string[] | undefined>;

export interface RequirementRule {
  lists: string[];
  minCreditCnt?: number;
  maxCreditCnt?: number;
  minCourseCnt?: number;
  maxCourseCnt?: number;
}

export interface RequirementRuleSet {
  description: string;
  rules: RequirementRule[];
}

export interface RequirementValidation {
  courses: string[];
  minCreditCnt?: number;
  maxCreditCnt?: number;
  minCourseCnt?: number;
  maxCourseCnt?: number;
}

export interface Requirement {
  name: string;
  lists: CourseListObject;
  rulesets: RequirementRuleSet[]; // Disjunctive normal form / Sum of products / OR of ANDs
  validations: RequirementValidation[];
}

export interface RequirementGroup {
  name: string;
  requirements: Requirement[];
}

export interface ProgrammeRequirementRules {
  type: string; // 'cc' | 'major' | 'school'
  mcga: boolean;
  ccMaxDoubleCount?: number;
  minSingleCount?: number;
}

export interface ProgrammeRequirement {
  name: string;
  requirementGroups: RequirementGroup[];
  rules: ProgrammeRequirementRules;
  reusableCourses: string[];
}

export interface GR23 {
  programme: string;
  requirementListName: string;
  courseToAdd: string;
}

export const programRequirements: ProgrammeRequirement[] = [
  ...rawProgramRequirements,
].map((requirement) => {
  return {
    ...requirement,
    requirementGroups: [...requirement.requirementGroups].map(
      (requirementGroup) => {
        return {
          ...requirementGroup,
          requirements: [...requirementGroup.requirements].map(
            (requirement) => {
              return {
                ...requirement,
                lists: requirement.lists,
              };
            },
          ),
        };
      },
    ),
  };
});
