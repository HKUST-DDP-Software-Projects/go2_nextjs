"use client";

import Accordion from "@/components/accordion";
import Chip from "@/components/chip";
import { CONFIG } from "@/helpers/config";
import {
  COURSE_CATALOG,
  CourseDetail,
  CourseStatus,
  CourseValidationResult,
  checkExclusionGroup,
  checkExclusionSet,
  checkPrerequisiteGroup,
  checkPrerequisiteSet,
  gradeToNumber,
  isCourseGradeRelevant,
} from "@/helpers/course";
import { Degree } from "@/redux/features/plannerSlice";
import { useAppSelector } from "@/redux/hooks";
import { useMemo, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const parseDegrees = (degrees: Degree[]) => {
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

  return Object.fromEntries(
    requirementGroups.map((requirementGroup) => [
      requirementGroup.name,
      Object.fromEntries(
        requirementGroup.requirements.map((requirement) => [
          requirement.name,
          [
            ...new Set(
              Object.values(requirement.lists)
                .filter((list): list is string[] => list !== undefined)
                .flat(),
            ),
          ],
        ]),
      ),
    ]),
  ) as Record<string, Record<string, string[]>>;
};

export default function PreEnrollment() {
  // TODO: Validate if all the requirements are required, not electives
  // const degrees = useAppSelector(
  //   (state) => state.plannerReducer.selectedDegrees,
  // );

  // const preenrollableCourses = parseDegrees(degrees);
  // console.log(preenrollableCourses);

  const courseHistory = useAppSelector((state) =>
    state.courseReducer.courseHistory.map((course) => course.code),
  );

  const personalDetails = useAppSelector(
    (state) => state.personalDetailsReducer,
  );

  const preenrollableCourses = {
    ...CONFIG.engineeringMajors?.[personalDetails.admissionYear]?.[
      personalDetails.engineeringMajor
    ],
    ...CONFIG.businessMajors?.[personalDetails.admissionYear]?.[
      personalDetails.businessMajor
    ],
  };

  const cga = useAppSelector((state) => {
    const courseHistory = state.courseReducer.courseHistory;
    const relevantCourses = courseHistory.filter(
      (course) =>
        course.status === CourseStatus.TAKEN &&
        isCourseGradeRelevant(course.grade),
    );

    const creditCnt = relevantCourses.reduce(
      (acc, course) => acc + course.units,
      0,
    );
    const gradeSum = relevantCourses.reduce(
      (acc, course) => acc + gradeToNumber(course.grade) * course.units,
      0,
    );

    if (creditCnt === 0) {
      return 0;
    }

    return gradeSum / creditCnt;
  });

  const maxCredits = cga < 3 ? 20 : cga >= 3 && cga <= 3.29 ? 21 : 24;
  // const [coursesSelected, setCoursesSelected] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(
    null,
  );
  const [shoppingCart, setShoppingCart] = useState<CourseDetail[]>([]);
  const [creditCnt, setCreditCnt] = useState<number>(0);

  const isSelectedCourseInCart =
    shoppingCart.find((c) => c.code === selectedCourse?.code) !== undefined;

  const CourseChip = ({ course }: { course: string }) => {
    const inShoppingCart =
      shoppingCart.find((c) => c.code === course) !== undefined;
    const taken = courseHistory.includes(course);

    if (taken) {
      return (
        <Chip
          label={course}
          color="gray"
          className={taken ? "line-through" : ""}
          border={inShoppingCart}
        />
      );
    }

    const courseDetail = COURSE_CATALOG.find((c) => c.code === course);
    if (!courseDetail) {
      return <Chip label={course} />;
    }

    const exclusionResult = checkExclusionGroup(courseDetail, courseHistory);
    const prerequisiteResult = checkPrerequisiteGroup(
      courseDetail,
      courseHistory,
    );

    if (exclusionResult === CourseValidationResult.UNSATISFIED) {
      return (
        <Chip
          label={course}
          color="red"
          className={"line-through"}
          onClick={() => {
            setSelectedCourse(courseDetail);
          }}
          border={inShoppingCart}
        />
      );
    }

    if (prerequisiteResult === CourseValidationResult.UNSATISFIED) {
      return (
        <Chip
          label={course}
          color="red"
          onClick={() => {
            setSelectedCourse(courseDetail);
          }}
          border={inShoppingCart}
        />
      );
    }

    if (
      exclusionResult === CourseValidationResult.NEED_MANUAL_CHECK ||
      prerequisiteResult === CourseValidationResult.NEED_MANUAL_CHECK
    ) {
      return (
        <Chip
          label={course}
          color="yellow"
          onClick={() => {
            setSelectedCourse(courseDetail);
          }}
          border={inShoppingCart}
        />
      );
    }

    return (
      <Chip
        label={course}
        color="green"
        onClick={() => {
          setSelectedCourse(courseDetail);
        }}
        border={inShoppingCart}
      />
    );
  };

  const submitForm = async () => {
    try {
      let remarks = "";

      // const program = degrees[0].name;
      // const admissionYear = "2023";
      // const studentName = "John Doe";
      // const studentId = "12345678";
      const program =
        personalDetails.engineeringMajor + personalDetails.businessMajor;
      const admissionYear = personalDetails.admissionYear;
      const studentName = personalDetails.name;
      const studentId = personalDetails.studentId;

      const courses = shoppingCart.map((course) => {
        // Check if course requires manual check, add asterisk and append remarks if yes
        const prerequisiteResult = checkPrerequisiteGroup(
          course,
          courseHistory,
        );
        const exclusionResult = checkExclusionGroup(course, courseHistory);

        if (
          prerequisiteResult === CourseValidationResult.SATISFIED &&
          exclusionResult === CourseValidationResult.SATISFIED
        ) {
          return course.code;
        }

        if (prerequisiteResult === CourseValidationResult.NEED_MANUAL_CHECK) {
          course.prerequisites
            .filter(
              (prerequisite) =>
                checkPrerequisiteSet(prerequisite, courseHistory) ===
                CourseValidationResult.NEED_MANUAL_CHECK,
            )
            .forEach((prerequisite) => {
              remarks += `Prerequisite for ${course.code}: ${prerequisite.description} needs manual check.\n`;
            });
        }

        if (exclusionResult === CourseValidationResult.NEED_MANUAL_CHECK) {
          course.exclusions
            .filter(
              (exclusion) =>
                checkExclusionSet(exclusion, courseHistory) ===
                CourseValidationResult.NEED_MANUAL_CHECK,
            )
            .forEach((exclusion) => {
              remarks += `Exclusion for ${course.code}: ${exclusion.description} needs manual check.\n`;
            });
        }

        return course.code + "*";
      });

      const result = await fetch(`${CONFIG.googleFormUrl}/formResponse`, {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        referrer: `${CONFIG.googleFormUrl}/viewform?fbzx=-934056360836122432`,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `entry.696151386=${studentName}&entry.122551777=${studentId}&entry.572298050=${program}&entry.1571921008=${admissionYear}&entry.1850458106=${courses[0] || ""}&entry.1789812207=${courses[1] || ""}&entry.766029104=${courses[2] || ""}&entry.664656825=${courses[3] || ""}&entry.1292771712=${courses[4] || ""}&entry.979448149=${courses[5] || ""}&entry.1458523618=${courses[6] || ""}&fvv=1&partialResponse=%5Bnull%2Cnull%2C%22-934056360836122432%22%5D&pageHistory=0&fbzx=-934056360836122432&submissionTimestamp=1713846650179&entry.899084275=${remarks}`,
        method: "POST",
        mode: "no-cors",
        credentials: "include",
      });
      alert(
        `Submitted ${shoppingCart.map((course) => course.code).join(", ")}`,
      );
      console.log(result);
    } catch (error) {
      console.error(error);
      alert(`Failed to submit form: ${error}`);
    }
  };

  const CourseDetail = useMemo(() => {
    if (!selectedCourse) {
      return <p>Select a course to view details</p>;
    }

    const prerequisiteResult = checkPrerequisiteGroup(
      selectedCourse,
      courseHistory,
    );
    const exclusionResult = checkExclusionGroup(selectedCourse, courseHistory);
    const canAddToCart =
      prerequisiteResult !== CourseValidationResult.UNSATISFIED &&
      exclusionResult !== CourseValidationResult.UNSATISFIED;

    return (
      <div className="flex-grow">
        <h4 className="text-lg font-semibold">
          {selectedCourse.code} ({selectedCourse.units} credits)
        </h4>
        <p>{selectedCourse.title}</p>
        <div>
          <h4 className="text-lg font-semibold pt-2">Prerequisites</h4>
          {selectedCourse.prerequisites &&
          selectedCourse.prerequisites.length > 0 ? (
            selectedCourse.prerequisites.map((prerequisite) => (
              <div key={prerequisite.description}>
                <h5>{prerequisite.description}</h5>
                {prerequisite.needManualCheck ? (
                  <Chip label="Manual check required" color="yellow" />
                ) : checkPrerequisiteSet(prerequisite, courseHistory) ===
                  CourseValidationResult.SATISFIED ? (
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
          {selectedCourse.exclusions && selectedCourse.exclusions.length > 0 ? (
            selectedCourse.exclusions.map((exclusion) => (
              <div key={exclusion.description}>
                <h5>{exclusion.description}</h5>
                {exclusion.needManualCheck ? (
                  <Chip label="Manual check required" />
                ) : checkExclusionSet(exclusion, courseHistory) ===
                  CourseValidationResult.UNSATISFIED ? (
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
              isSelectedCourseInCart || !canAddToCart
                ? "opacity-50 cursor-not-allowed"
                : "text-black"
            }`}
            onClick={() => {
              if (selectedCourse) {
                setShoppingCart((shoppingCart) => [
                  ...shoppingCart,
                  selectedCourse,
                ]);

                setCreditCnt((creditCnt) => creditCnt + selectedCourse.units);
              }
            }}
            disabled={isSelectedCourseInCart || !canAddToCart}
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

                setCreditCnt((creditCnt) => creditCnt - selectedCourse.units);
              }
            }}
            disabled={!isSelectedCourseInCart}
          >
            Remove from Cart
          </button>
          <button
            className={`px-4 py-2 bg-gray-200 border border-gray-200 ${
              !isSelectedCourseInCart
                ? "opacity-50 cursor-not-allowed"
                : "text-black"
            }`}
            disabled={!isSelectedCourseInCart}
            onClick={() => {
              if (selectedCourse) {
                setShoppingCart((shoppingCart) =>
                  shoppingCart.filter(
                    (course) => course.code !== selectedCourse.code,
                  ),
                );

                setShoppingCart((shoppingCart) => [
                  selectedCourse,
                  ...shoppingCart,
                ]);
              }
            }}
          >
            Move to Front
          </button>
        </div>
      </div>
    );
  }, [selectedCourse, isSelectedCourseInCart, courseHistory]);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4 h-full flex flex-col">
        <div className="mb-4">
          <h4 className="text-lg font-semibold">Legend</h4>
          <div className="flex flex-wrap">
            <Chip label="Taken" color="gray" className="line-through" />
            <Chip label="Excluded" color="red" className="line-through" />
            <Chip label="Available to pre-enrol" color="green" />
            <Chip label="Unfulfilled prerequisites" color="red" />
            <Chip label="Manual check required" color="yellow" />
            <Chip label="Unknown" />
          </div>
        </div>
        <div className="overflow-y-auto">
          <Accordion
            items={Object.entries(preenrollableCourses).map(
              ([requirementGroupName, requirements]) => ({
                key: requirementGroupName,
                title: requirementGroupName,
                content: (
                  <div>
                    {Object.entries(requirements).map(
                      ([requirementName, courses]) => {
                        return (
                          <div key={requirementName} className="mb-4">
                            <h4 className="text-lg font-semibold">
                              {requirementName}
                            </h4>
                            <div className="flex flex-wrap">
                              {courses.map((course) => {
                                return (
                                  <CourseChip key={course} course={course} />
                                );
                              })}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                ),
              }),
            )}
            defaultActive={true}
          />
        </div>
      </div>
      <div className="w-1/4 border-l border-gray-300 bg-white overflow-y-auto">
        <Accordion
          items={[
            {
              key: "credit-overload",
              title: "Credit Overload",
              content: (
                <div>
                  <p className={creditCnt > 18 ? "text-red-500" : ""}>
                    CGA: {cga.toFixed(3)}
                  </p>
                  <table className="border-collapse w-full">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2">
                          CGA
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                          Max credits
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          {"< 3"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          20 {cga < 3 ? "✅" : ""}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          3 - 3.29
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          21 {cga >= 3 && cga <= 3.29 ? "✅" : ""}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          {"> 3.3"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          24 {cga >= 3.3 ? "✅" : ""}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              key: "course-detail",
              title: "Course Detail",
              content: CourseDetail,
            },
            {
              key: "shopping-cart",
              title: "Shopping Cart",
              content: (
                <div>
                  <p className={creditCnt > maxCredits ? "text-red-500" : ""}>
                    Total Credits: {creditCnt} / {maxCredits}
                  </p>
                  <div className="flex flex-wrap">
                    {shoppingCart.map((course) => {
                      return (
                        <CourseChip key={course.code} course={course.code} />
                      );
                    })}
                  </div>

                  {/* Submit button */}
                  <button
                    className={`px-4 py-2 bg-gray-200 border border-gray-200 ${
                      creditCnt > maxCredits
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={submitForm}
                    disabled={creditCnt > maxCredits}
                  >
                    Submit
                  </button>
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
