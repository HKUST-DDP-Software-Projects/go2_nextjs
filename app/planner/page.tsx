"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import { programRequirements } from "@/helpers/requirement";
import Accordion from "@/components/accordion";
import Tabs from "@/components/tab";
import {
  checkRequirementRule,
  checkRequirementRuleSet,
} from "@/helpers/matcher";
import { Requirement, RequirementRule } from "@/helpers/requirement";
import { match } from "@/redux/features/plannerSlice";
import { useState } from "react";
import CourseSelectionModal from "../course/selection_modal";
import { PencilIcon } from "@heroicons/react/outline";

interface ChipProps {
  label: string;
}

function Chip({ label }: ChipProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mr-2 mb-2">
      {label}
    </span>
  );
}

type OpenCourseSelectionModal = (
  degreeIdx: number,
  programmeIdx: number,
  requirementName: string,
  courseListName: string,
) => void;

interface RequirementListProps {
  name: string;
  selectedCourses: string[];
  courseList: string[];
  openCourseSelectionModal: OpenCourseSelectionModal;
}

function ControlledCheckbox({ checked }: { checked: boolean }) {
  return (
    <input
      type="checkbox"
      className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out flex-shrink-0"
      checked={checked}
      readOnly
    />
  );
}

function getRuleString(rule: RequirementRule): string {
  const ruleStrings = [];
  if (rule.minCreditCnt) {
    ruleStrings.push(`${rule.minCreditCnt} or more credit(s)`);
  }
  if (rule.maxCreditCnt) {
    ruleStrings.push(`${rule.maxCreditCnt} or fewer credit(s)`);
  }
  if (rule.minCourseCnt) {
    ruleStrings.push(`${rule.minCourseCnt} or more course(s)`);
  }
  if (rule.maxCourseCnt) {
    ruleStrings.push(`${rule.maxCourseCnt} or fewer course(s)`);
  }

  let ruleString = `Took ${ruleStrings.join(", ")}`;
  if (rule.lists) {
    ruleString += ` from ${rule.lists.map((list) => `"${list}"`).join(", ")}`;
  }
  return ruleString;
}

function RequirementList({
  name,
  selectedCourses,
  courseList,
  openCourseSelectionModal,
}: RequirementListProps) {
  return (
    <div className="border-r border-gray-200 mr-4 p-4 rounded-sm w-72 h-full flex-shrink-0 flex flex-col bg-white relative">
      <div className="flex-shrink-0">
        <h3 className="text-lg font-medium">{name}</h3>
      </div>
      <div className="pl-4 flex flex-wrap overflow-y-scroll">
        {selectedCourses.map((course) => (
          <Chip key={course} label={course} />
        ))}
      </div>
      <button
        className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => openCourseSelectionModal(courseList, selectedCourses)}
      >
        <PencilIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

interface RequirementProps {
  requirement: Requirement;
  planner: { [key: string]: string[] };
  openCourseSelectionModal: (
    courseList: string[],
    selectedCourses: string[],
  ) => void;
}

function RequirementComponent({
  requirement,
  planner,
  openCourseSelectionModal,
}: RequirementProps) {
  const selectedCourses = planner?.[requirement.name] || [];
  // find the first valid ruleset
  const validRulesetIdx = requirement.rulesets.findIndex((ruleset) =>
    checkRequirementRuleSet(requirement, ruleset, selectedCourses),
  );

  // contain all indices other than the first valid ruleset
  const defaultActiveIndex = requirement.rulesets
    .map((_, index) => index)
    .filter((index) => index !== validRulesetIdx);

  return (
    <div className="pl-4 flex flex-col md:flex-row">
      <div className="md:w-3/4 w-full h-48 flex-grow flex overflow-x-auto">
        {Object.entries(requirement.lists).map(([name, courseList]) => (
          <RequirementList
            key={name}
            name={name}
            selectedCourses={[
              ...new Set(
                courseList!.filter((course) =>
                  selectedCourses.includes(course),
                ),
              ),
            ]}
            courseList={courseList!}
            openCourseSelectionModal={openCourseSelectionModal}
          />
        ))}
      </div>
      <div className="md:w-1/4 w-full h-48 md:border-l border-gray-200 p-4">
        <Accordion
          items={[...requirement.rulesets]
            .sort(
              (a, b) =>
                Number(
                  checkRequirementRuleSet(requirement, b, selectedCourses),
                ) -
                Number(
                  checkRequirementRuleSet(requirement, a, selectedCourses),
                ),
            )
            .map((ruleset) => ({
              key: ruleset.description,
              title: (
                <div className="flex items-center">
                  <ControlledCheckbox
                    checked={checkRequirementRuleSet(
                      requirement,
                      ruleset,
                      selectedCourses,
                    )}
                  />
                  <h3 className="text-lg font-medium ml-2">
                    {ruleset.description}
                  </h3>
                </div>
              ),
              content: (
                <div className="pl-4">
                  {ruleset.rules.map((rule) => (
                    <div
                      key={rule.lists.join("")}
                      className="flex items-center"
                    >
                      <ControlledCheckbox
                        checked={checkRequirementRule(
                          requirement,
                          rule,
                          selectedCourses,
                        )}
                      />
                      <label
                        htmlFor="checkbox"
                        className="ml-2 block text-sm leading-5 text-gray-900"
                      >
                        {getRuleString(rule)}
                      </label>
                    </div>
                  ))}
                </div>
              ),
            }))}
          defaultActive={false}
          defaultActiveIndex={defaultActiveIndex}
        />
      </div>
    </div>
  );
}

export default function Planner() {
  const dispatch = useAppDispatch();
  const courseEnrollments = useAppSelector(
    (state) => state.courseReducer.courseHistory,
  );
  const programmes = useAppSelector(
    (state) => state.plannerReducer.selectedDegrees,
  );
  const planner = useAppSelector((state) => state.plannerReducer.planner);

  const [isCourseSelectionModalOpen, setIsCourseSelectionModalOpen] =
    useState(false);
  const [courseList, setCourseList] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  return (
    <main className="w-full h-full mx-auto p-4">
      <Tabs
        tabs={programmes.map((degree, degreeIdx) => ({
          label: degree.name,
          content: (
            <div className="flex flex-col">
              <div className="flex flex-wrap">
                <button
                  className="bg-gray-200 rounded-sm px-4 py-2 mr-2 mb-2"
                  onClick={() =>
                    dispatch(match([courseEnrollments, degreeIdx]))
                  }
                >
                  Match
                </button>
              </div>
              <Accordion
                defaultActive={true}
                items={degree.requirements.map((programme, programmeIdx) => ({
                  key: programme.name,
                  title: programme.name,
                  content: (
                    <Accordion
                      defaultActive={true}
                      items={programme.requirementGroups
                        .flatMap((group) => group.requirements)
                        .map((requirement) => ({
                          key: requirement.name,
                          title: requirement.name,
                          content: (
                            <RequirementComponent
                              requirement={requirement}
                              planner={planner[degreeIdx][programmeIdx]}
                              openCourseSelectionModal={(
                                courseList,
                                selectedCourses,
                              ) => {
                                setIsCourseSelectionModalOpen(true);
                                setCourseList(courseList);
                                setSelectedCourses(selectedCourses);
                              }}
                            />
                          ),
                        }))}
                    />
                  ),
                }))}
              />
            </div>
          ),
        }))}
      ></Tabs>
      <CourseSelectionModal
        isOpen={isCourseSelectionModalOpen}
        onClose={() => setIsCourseSelectionModalOpen(false)}
        selectedCourses={selectedCourses}
        courseList={courseList}
      />
    </main>
  );
}
