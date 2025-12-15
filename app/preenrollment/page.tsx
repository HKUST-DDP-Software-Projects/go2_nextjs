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
import { enrollSuggestedPathway } from "@/redux/actions/enrollSuggestedPathway";
import {
  addCourse,
  moveCourseToFront,
  removeCourse,
} from "@/redux/features/preenrollmentSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { set } from "zod";

export default function PreEnrollment() {
  // TODO: Validate if all the requirements are required, not electives
  // const degrees = useAppSelector(
  //   (state) => state.plannerReducer.selectedDegrees,
  // );

  // const preenrollableCourses = parseDegrees(degrees);
  // console.log(preenrollableCourses);

  const router = useRouter();

  const courseHistory = useAppSelector(
    (state) => state.courseReducer.courseHistoryString,
  );

  const personalDetails = useAppSelector(
    (state) => state.personalDetailsReducer,
  );

  const shoppingCart = useAppSelector(
    (state) => state.preenrollmentReducer.shoppingCart || [],
  );

  const qualtricsUnmet = useAppSelector(
    (state) => state.preenrollmentReducer.qualtricsUnmetPrereqs || [],
  );

  const suggestedUnmet = useAppSelector(
    (state) => state.preenrollmentReducer.suggestedUnmetPrereqs || [],
  );
  const suggestedExcluded = useAppSelector(
    (state) => state.preenrollmentReducer.suggestedExcluded || [],
  );
  const suggestedRemoved = useAppSelector(
    (state) => state.preenrollmentReducer.suggestedRemoved || [],
  );

  const shoppingCartCredits = useAppSelector(
    (state) => state.preenrollmentReducer.shoppingCartCredits || 0,
  );

  // const state = useAppSelector((state) => state);
  // console.log(state);

  const dispatch = useAppDispatch();

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
        course.status.includes(CourseStatus.TAKEN) &&
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

  const [creditCnt, setCreditCnt] = useState<number>(shoppingCartCredits);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCreditCnt(shoppingCartCredits);
  }, [shoppingCartCredits]);

  const isSelectedCourseInCart =
    shoppingCart.find((c) => c.code === selectedCourse?.code) !== undefined;

  const CourseChip = ({ course }: { course: string }) => {
    const inShoppingCart =
      shoppingCart.find((c) => c.code === course) !== undefined;
    const taken = courseHistory.includes(course);
    const courseDetail = COURSE_CATALOG.find((c) => c.code === course);
    if (!courseDetail) {
      return <Chip label={course} />;
    }

    if (taken && !(courseDetail.hasOwnProperty('courseOverride'))) {
      return (
        <Chip
          label={course}
          color="gray"
          className={taken ? "line-through" : ""}
          border={inShoppingCart}
        />
      );
    }


    const exclusionResult = checkExclusionGroup(courseDetail, courseHistory);
    const prerequisiteResult = checkPrerequisiteGroup(
      courseDetail,
      courseHistory,
    );

    if (exclusionResult === CourseValidationResult.UNSATISFIED && !(courseDetail.hasOwnProperty('courseOverride'))) {
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

    if (prerequisiteResult === CourseValidationResult.UNSATISFIED && !(courseDetail.hasOwnProperty('courseOverride'))) {
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
  useEffect(() => {
    if (!personalDetails.studentId) {
      router.push("/");
    }
    // if there's no courses in the list, redirect to the course page.
    if (Object.keys(courseHistory).length === 0) {
      router.push("/course");
    }
    // Enroll suggested pathways automatically once per visit if personal details are present
    const admissionYear = personalDetails.admissionYear;
    const engMajor = personalDetails.engineeringMajor;
    const busMajor = personalDetails.businessMajor;
    if (admissionYear) {
      // If the student has both majors set, enroll suggested pathways for both
      if (engMajor) dispatch(enrollSuggestedPathway(admissionYear, engMajor));
      if (busMajor) dispatch(enrollSuggestedPathway(admissionYear, busMajor));
    }
  }, []);
  const prepareSubmission = () => {
    let remarks = "";

    const program =
      personalDetails.engineeringMajor + personalDetails.businessMajor;
    const admissionYear = personalDetails.admissionYear;
    const studentName = personalDetails.name;
    const studentId = personalDetails.studentId;
    const email = personalDetails.email;

    const courses = shoppingCart.map((course) => {
      // Check if course requires manual check, add asterisk and append remarks if yes
      const prerequisiteResult = checkPrerequisiteGroup(course, courseHistory);
      const exclusionResult = checkExclusionGroup(course, courseHistory);

      if (
        ((prerequisiteResult === CourseValidationResult.SATISFIED &&
        exclusionResult === CourseValidationResult.SATISFIED) || course.courseOverride)
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

    if (creditCnt > maxCredits || maxCredits > 18) {
      remarks += `Credit overload: ${creditCnt} / ${maxCredits}\n`;
      remarks += `Student CGA: ${cga.toFixed(3)}\n`;
    }

    return {
      studentName,
      studentId,
      email,
      program,
      admissionYear,
      courses,
      remarks,
    };
  };

  const submitForm = async () => {
    try {
      const {
        studentName,
        studentId,
        program,
        email,
        admissionYear,
        courses,
        remarks,
      } = prepareSubmission();
      setIsLoading(true);
      const response2 = await fetch(
        "/qualtrics_backend.php/api/get_survey_id",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const sur_id_req_result = await response2.json();
      if (sur_id_req_result.status == 400) {
        setIsLoading(false);
        throw new Error("Failed to create new survey session");
      }

      const response_id = sur_id_req_result.sessionId;

      console.log({ response_id: response_id });
      const enrolledCourse = shoppingCart.map((c) => c.code).join(", ");

      const processed = new Set<string>();
      const issues: string[] = [];
      (suggestedUnmet || []).forEach((u: any) => {
        if (!processed.has(u.code)) {
          issues.push(`${u.code} (${u.reason})`);
          processed.add(u.code);
        }
      });
      (suggestedExcluded || []).forEach((u: any) => {
        if (!processed.has(u.code)) {
          issues.push(`${u.code} (${u.reason})`);
          processed.add(u.code);
        }
      });
      (suggestedRemoved || []).forEach((u: any) => {
        if (!processed.has(u.code)) {
          issues.push(`${u.code} (${u.reason || "removed-by-user"})`);
          processed.add(u.code);
        }
      });

      const reasons = issues.join("; ");

      const survey_responses = {
        advance: true,
        responses: {
          QID1: studentName,
          QID2: studentId,
          QID3: program,
          QID4: email,
          QID5: admissionYear,
          QID6: enrolledCourse,
          QID7: reasons,
          QID8: "",
          QID9: "",
          QID10: "",
          QID11: "",
          QID12: "",
          QID13: remarks,
        },
      };
      const req_body = {
        qual_body: survey_responses,
        survey_id: response_id,
      };
      try {
        console.log("Qualtrics payload (preview):", req_body);
      } catch (e) {
        // ignore logging errors
      }
      const submission_options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(req_body),
      };
      // console.log("SUBMISSIONS OPTIONS");
      // console.log(submission_options);
      const submission_response = await fetch(
        `/qualtrics_backend.php/api/submit_survey`,
        submission_options,
      );
      const submission_data = await submission_response.json();
      // console.log(submission_response);

      if (submission_data.status != 200) {
        setIsLoading(false);
        throw new Error("Failed to submit survey responses");
      }

      alert(
        `Submitted ${shoppingCart.map((course) => course.code).join(", ")}`,
      );
      setIsLoading(false);
      router.push("/end");
    } catch (error) {
      // console.error(error);
      setIsLoading(false);
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
      ((prerequisiteResult !== CourseValidationResult.UNSATISFIED &&
      exclusionResult !== CourseValidationResult.UNSATISFIED) || (selectedCourse.courseOverride && selectedCourse.courseOverride === true));

    return (
      <div
        className="flex-grow"
        style={{ width: "fit-content", height: "fit-content" }}
      >
        <h4 className="text-lg font-semibold">
          {selectedCourse.code} ({selectedCourse.units} credits)
        </h4>
        <p>{selectedCourse.title}</p>
        <p >{selectedCourse.courseOverride}</p>
        {selectedCourse.courseOverride &&
        <p>
          NOTE: The course is overridden by the DDP Office for you to be able to take it. Please disregard any warning/excluded messages.
          This usually happens for multi-semester courses, like FYP's. Do NOT add this to the shopping cart unless
          you are sure you can take this. Contact DDP Office/SENG/SSCI Major Program Office for eligibility.
        </p>
      }
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

        
        <div className="flex justify-between pt-4 flex-wrap">
          <button
            className={`m-1 px-4 py-2 bg-gray-200 border border-gray-200 w-full ${
              isSelectedCourseInCart || !canAddToCart
                ? "opacity-50 cursor-not-allowed"
                : "text-black"
            }`}
            onClick={() => {
              if (selectedCourse) {
                dispatch(addCourse(selectedCourse));
                setCreditCnt((creditCnt) => creditCnt + selectedCourse.units);
              }
            }}
            disabled={isSelectedCourseInCart || !canAddToCart}
          >
            Add to Cart
          </button>
          <button
            className={`m-1 px-4 py-2 bg-gray-200 border border-gray-200 w-full ${
              !isSelectedCourseInCart
                ? "opacity-50 cursor-not-allowed"
                : "text-black"
            }`}
            onClick={() => {
              if (selectedCourse) {
                setCreditCnt((creditCnt) => creditCnt - selectedCourse.units);

                dispatch(removeCourse(selectedCourse));
              }
            }}
            disabled={!isSelectedCourseInCart}
          >
            Remove from Cart
          </button>
          <button
            className={`m-1 px-4 py-2 bg-gray-200 border border-gray-200 w-full ${
              !isSelectedCourseInCart
                ? "opacity-50 cursor-not-allowed"
                : "text-black"
            }`}
            disabled={!isSelectedCourseInCart}
            onClick={() => {
              if (selectedCourse) {
                dispatch(moveCourseToFront(selectedCourse));
              }
            }}
          >
            Move to Front
          </button>
        </div>
      </div>
    );
  }, [selectedCourse, courseHistory, isSelectedCourseInCart, dispatch]);

  return (
    <div className="flex h-full lg:flex-row flex-col">
      <div className="flex-1 p-4 flex flex-col overflow-y-auto">
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
      <div
        className="sticky flex-shrink-0 w-full lg:w-1/4 p-4 overflow-y-auto transition-transform bg-white h-64 border-t border-gray-200 lg:h-full -mt-4"
        aria-labelledby="drawer-bottom-label"
      >
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
                  <div className="flex flex-wrap m-2">
                    {shoppingCart.map((course) => {
                      return (
                        <CourseChip key={course.code} course={course.code} />
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap">
                    {/* Submit button */}
                    <button
                      className="px-4 py-2 m-1 border text-white border-gray-200 w-full"
                      onClick={submitForm}
                      disabled={isLoading}
                      style={{
                        backgroundColor: !isLoading ? "#3b82f6" : "#6b7280",
                      }}
                    >
                      {isLoading ? "Loading..." : "Submit"}
                    </button>
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
