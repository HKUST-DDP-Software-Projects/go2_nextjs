"use client";

import Accordion from "@/components/accordion";
import Chip from "@/components/chip";
import {
  COURSE_CATALOG,
  checkExclusionGroup,
  checkPrerequisiteGroup,
} from "@/helpers/course";
import { useAppSelector } from "@/redux/hooks";

export default function PreEnrollment() {
  // TODO: Validate if all the requirements are required, not electives
  const degrees = useAppSelector(
    (state) => state.plannerReducer.selectedDegrees,
  );

  const requirementGroups = degrees.flatMap((degree) =>
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
  );

  const courseHistory = useAppSelector((state) =>
    state.courseReducer.courseHistory.map((course) => course.code),
  );

  const CourseChip = ({ course }: { course: string }) => {
    const taken = courseHistory.includes(course);

    if (taken) {
      return (
        <Chip
          label={course}
          color="gray"
          className={taken ? "line-through" : ""}
        />
      );
    }

    const courseDetail = COURSE_CATALOG.find((c) => c.code === course);
    if (!courseDetail) {
      return <Chip label={course} />;
    }

    const excluded = checkExclusionGroup(courseDetail, courseHistory);
    if (excluded) {
      return <Chip label={course} color="red" className={"line-through"} />;
    }

    const fulfilledPreRequisites = checkPrerequisiteGroup(
      courseDetail,
      courseHistory,
    );

    if (fulfilledPreRequisites) {
      return <Chip label={course} color="green" />;
    }

    return <Chip label={course} color="red" />;
  };

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
                      {courses.map((course) => {
                        return <CourseChip key={course} course={course} />;
                      })}
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
