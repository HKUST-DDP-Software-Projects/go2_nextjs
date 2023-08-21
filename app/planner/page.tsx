"use client";

import { useAppSelector } from "@/redux/hooks";
// import { programRequirements } from "@/helpers/requirement";
import Accordion from "@/components/accordion";
import Tabs from "@/components/tab";
import { Requirement, RequirementRule } from "@/helpers/requirement";
import { useState } from "react";

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

interface ListProps {
  name: string;
  courses: string[];
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

function List({ name, courses }: ListProps) {
  return (
    <div className="border-r border-gray-200 mr-4 p-4 rounded-sm w-72 h-full flex-shrink-0 flex flex-col">
      <div className="flex-shrink-0">
        <h3 className="text-lg font-medium">{name}</h3>
      </div>
      <div className="pl-4 flex flex-wrap overflow-y-scroll">
        {courses.map((course) => (
          <Chip key={course} label={course} />
        ))}
      </div>
    </div>
  );
}

interface RequirementProps {
  requirement: Requirement;
}

function RequirementComponent({ requirement }: RequirementProps) {
  const [validatedRules, setValidatedRules] = useState<string[]>([]);

  const handleRuleChange = (ruleId: string) => {
    if (validatedRules.includes(ruleId)) {
      setValidatedRules(validatedRules.filter((id) => id !== ruleId));
    } else {
      setValidatedRules([...validatedRules, ruleId]);
    }
  };

  return (
    <div className="pl-4 h-48 flex flex-col md:flex-row">
      <div className="md:w-3/4 flex overflow-x-auto">
        {Array.from(requirement.lists.entries()).map(([name, courses]) => (
          <List key={name} name={name} courses={courses} />
        ))}
      </div>
      <div className="md:w-1/4 border-l border-gray-200 p-4">
        <Accordion
          items={requirement.rulesets.map((ruleset) => ({
            title: ruleset.description,
            content: (
              <div className="pl-4">
                {ruleset.rules.map((rule) => (
                  <div key={rule.lists.join("")} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out flex-shrink-0"
                      checked={validatedRules.includes(rule.lists.join(""))}
                      onChange={() => handleRuleChange(rule.lists.join(""))}
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
          defaultActive={true}
        />
      </div>
    </div>
  );
}

export default function Planner() {
  const programmes = useAppSelector(
    (state) => state.plannerReducer.selectedProgrammes,
  );

  return (
    <main className="w-full h-full mx-auto p-4">
      <Tabs
        tabs={programmes.map((degree) => ({
          label: degree.name,
          content: (
            <Accordion
              defaultActive={true}
              items={degree.requirements.map((programme) => ({
                title: programme.name,
                content: (
                  <Accordion
                    defaultActive={true}
                    items={programme.requirementGroups
                      .flatMap((group) => group.requirements)
                      .map((requirement) => ({
                        title: requirement.name,
                        content: (
                          <RequirementComponent requirement={requirement} />
                        ),
                      }))}
                  />
                ),
              }))}
            />
          ),
        }))}
      ></Tabs>
    </main>
  );
}
