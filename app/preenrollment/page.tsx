"use client";

import Accordion from "@/components/accordion";
import Chip from "@/components/chip";
import { useAppSelector } from "@/redux/hooks";

export default function PreEnrollment() {
  // TODO: Validate if all the requirements are required, not electives
  const requirementGroups = useAppSelector((state) =>
    state.plannerReducer.selectedDegrees.flatMap((degree) =>
      degree.requirements
        .filter((requirement) =>
          ["major", "school"].includes(requirement.rules.type),
        )
        .flatMap((requirement) =>
          requirement.requirementGroups.filter(
            (requirement) =>
              !requirement.name.includes("Elective") &&
              !requirement.name.includes("Common Core"),
          ),
        ),
    ),
  );

  return (
    <div>
      <Accordion
        items={requirementGroups.map((requirementGroup) => ({
          key: requirementGroup.name,
          title: requirementGroup.name,
          content: (
            <div>
              {requirementGroup.requirements.map((requirement) => {
                const courses = [
                  ...new Set(
                    Object.values(requirement.lists)
                      .filter((list): list is string[] => list !== undefined)
                      .flat(),
                  ),
                ];
                return (
                  <div key={requirement.name} className="mb-4">
                    <h4 className="text-lg font-semibold">
                      {requirement.name}
                    </h4>
                    <div className="flex flex-wrap">
                      {courses.map((course) => (
                        <Chip key={course} label={course} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        }))}
        defaultActive={true}
      />
    </div>
  );
}
