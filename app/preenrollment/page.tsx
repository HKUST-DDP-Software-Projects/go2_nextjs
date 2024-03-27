"use client";

import Accordion from "@/components/accordion";
import Chip from "@/components/chip";
import {
  COURSE_CATALOG,
  CourseDetail,
  checkExclusionGroup,
  checkPrerequisiteGroup,
} from "@/helpers/course";
import { useAppSelector } from "@/redux/hooks";
import { useState } from "react";

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

  // const [coursesSelected, setCoursesSelected] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(
    null,
  );
  const [shoppingCart, setShoppingCart] = useState<CourseDetail[]>([]);
  const [creditCnt, setCreditCnt] = useState<number>(0);

  const isSelectedCourseInCart =
    shoppingCart.find((c) => c.code === selectedCourse?.code) !== undefined;

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
      return (
        <Chip
          label={course}
          color="red"
          className={"line-through"}
          onClick={() => {
            setSelectedCourse(courseDetail);
          }}
        />
      );
    }

    const fulfilledPreRequisites = checkPrerequisiteGroup(
      courseDetail,
      courseHistory,
    );

    if (fulfilledPreRequisites) {
      return (
        <Chip
          label={course}
          color="green"
          onClick={() => {
            setSelectedCourse(courseDetail);
          }}
        />
      );
    }

    return (
      <Chip
        label={course}
        color="red"
        onClick={() => {
          setSelectedCourse(courseDetail);
        }}
      />
    );
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4 h-full overflow-y-auto">
        <div className="mb-4">
          <h4 className="text-lg font-semibold">Legend</h4>
          <div className="flex flex-wrap">
            <Chip label="Taken" color="gray" className="line-through" />
            <Chip label="Excluded" color="red" className="line-through" />
            <Chip label="Available to pre-enrol" color="green" />
            <Chip label="Unfulfilled prerequisites" color="red" />
            <Chip label="Unknown" />
          </div>
        </div>
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
      <div className="w-1/4 border-l border-gray-300 bg-white">
        <Accordion
          items={[
            {
              key: "course-detail",
              title: "Course Detail",
              content: selectedCourse ? (
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold">
                    {selectedCourse.code} ({selectedCourse.units} credits)
                  </h4>
                  <p>{selectedCourse.title}</p>
                  <div>
                    <h4 className="text-lg font-semibold pt-2">
                      Prerequisites
                    </h4>
                    {selectedCourse.prerequisites &&
                    selectedCourse.prerequisites.length > 0 ? (
                      selectedCourse.prerequisites.map((prerequisite) => (
                        <div key={prerequisite.description}>
                          <h5>{prerequisite.description}</h5>
                          {prerequisite.needManualCheck ? (
                            <Chip label="Manual check required" />
                          ) : checkPrerequisiteGroup(
                              selectedCourse,
                              courseHistory,
                            ) ? (
                            <Chip label="Fulfilled" color="green" />
                          ) : (
                            <Chip label="Unfulfilled" color="red" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No prerequisites</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold pt-2">Exclusions</h4>
                    {selectedCourse.exclusions &&
                    selectedCourse.exclusions.length > 0 ? (
                      selectedCourse.exclusions.map((exclusion) => (
                        <div key={exclusion.description}>
                          <h5>{exclusion.description}</h5>
                          {exclusion.needManualCheck ? (
                            <Chip label="Manual check required" />
                          ) : checkExclusionGroup(
                              selectedCourse,
                              courseHistory,
                            ) ? (
                            <Chip label="Excluded" color="red" />
                          ) : (
                            <Chip label="Not excluded" color="green" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No exclusions</p>
                    )}
                  </div>
                  <div className="flex justify-between pt-4">
                    <button
                      className={`px-4 py-2 bg-gray-200 border border-gray-200 ${
                        isSelectedCourseInCart ||
                        checkExclusionGroup(selectedCourse, courseHistory)
                          ? "opacity-50 cursor-not-allowed"
                          : "text-black"
                      }`}
                      onClick={() => {
                        if (selectedCourse) {
                          setShoppingCart((shoppingCart) => [
                            ...shoppingCart,
                            selectedCourse,
                          ]);

                          setCreditCnt(
                            (creditCnt) => creditCnt + selectedCourse.units,
                          );
                        }
                      }}
                      disabled={
                        isSelectedCourseInCart ||
                        checkExclusionGroup(selectedCourse, courseHistory)
                      }
                    >
                      Add to Cart
                    </button>
                    <button
                      className={`px-4 py-2 bg-gray-200 border border-gray-200 ${
                        !isSelectedCourseInCart
                          ? "opacity-50 cursor-not-allowed"
                          : "text-black"
                      }`}
                      onClick={() => {
                        if (selectedCourse) {
                          setShoppingCart((shoppingCart) =>
                            shoppingCart.filter(
                              (course) => course.code !== selectedCourse.code,
                            ),
                          );

                          setCreditCnt(
                            (creditCnt) => creditCnt - selectedCourse.units,
                          );
                        }
                      }}
                      disabled={!isSelectedCourseInCart}
                    >
                      Remove from Cart
                    </button>
                  </div>
                </div>
              ) : (
                <p>Select a course to view details</p>
              ),
            },
            {
              key: "shopping-cart",
              title: "Shopping Cart",
              content: (
                <div>
                  <p className={creditCnt > 18 ? "text-red-500" : ""}>
                    Total Credits: {creditCnt} / 18
                  </p>
                  <div className="flex flex-wrap">
                    {shoppingCart.map((course) => {
                      return (
                        <Chip
                          key={course.code}
                          label={course.code}
                          onClick={() => {
                            setSelectedCourse(course);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ),
            },
          ]}
          defaultActive={true}
        />
      </div>
    </div>
  );
}
