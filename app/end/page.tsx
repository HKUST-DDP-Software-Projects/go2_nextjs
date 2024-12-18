"use client";
import {
  CourseStatus,
  CourseValidationResult,
  checkExclusionGroup,
  checkExclusionSet,
  checkPrerequisiteGroup,
  checkPrerequisiteSet,
  gradeToNumber,
  isCourseGradeRelevant,
} from "@/helpers/course";
import { useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";

export default function End() {
  const courseHistory = useAppSelector((state) =>
    state.courseReducer.courseHistory.map((course) => course.code),
  );

  const personalDetails = useAppSelector(
    (state) => state.personalDetailsReducer,
  );

  const shoppingCart = useAppSelector(
    (state) => state.preenrollmentReducer.shoppingCart || [],
  );

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

  // const maxCredits = cga < 3 ? 20 : cga >= 3 && cga <= 3.29 ? 21 : 24;

  const clearData = () => {
    localStorage.clear();
  };

  useEffect(() => {
    // If the details are not filled, redirect to the main page
    if (!personalDetails.studentId) {
      window.location.href = "/";
    }
    clearData();
  }, []);

  // const downloadSubmission = () => {
  //   let remarks = "";
  //
  //   const program =
  //     personalDetails.engineeringMajor + personalDetails.businessMajor;
  //   const admissionYear = personalDetails.admissionYear;
  //   const studentName = personalDetails.name;
  //   const studentId = personalDetails.studentId;
  //   const email = personalDetails.email;
  //
  //   const courses = shoppingCart.map((course) => {
  //     // Check if course requires manual check, add asterisk and append remarks if yes
  //     const prerequisiteResult = checkPrerequisiteGroup(course, courseHistory);
  //     const exclusionResult = checkExclusionGroup(course, courseHistory);
  //
  //     if (
  //       prerequisiteResult === CourseValidationResult.SATISFIED &&
  //       exclusionResult === CourseValidationResult.SATISFIED
  //     ) {
  //       return course.code;
  //     }
  //
  //     if (prerequisiteResult === CourseValidationResult.NEED_MANUAL_CHECK) {
  //       course.prerequisites
  //         .filter(
  //           (prerequisite) =>
  //             checkPrerequisiteSet(prerequisite, courseHistory) ===
  //             CourseValidationResult.NEED_MANUAL_CHECK,
  //         )
  //         .forEach((prerequisite) => {
  //           remarks += `Prerequisite for ${course.code}: ${prerequisite.description} needs manual check.\n`;
  //         });
  //     }
  //
  //     if (exclusionResult === CourseValidationResult.NEED_MANUAL_CHECK) {
  //       course.exclusions
  //         .filter(
  //           (exclusion) =>
  //             checkExclusionSet(exclusion, courseHistory) ===
  //             CourseValidationResult.NEED_MANUAL_CHECK,
  //         )
  //         .forEach((exclusion) => {
  //           remarks += `Exclusion for ${course.code}: ${exclusion.description} needs manual check.\n`;
  //         });
  //     }
  //
  //     return course.code + "*";
  //   });
  //
  //   const creditCnt = shoppingCart.reduce(
  //     (acc, course) => acc + course.units,
  //     0,
  //   );
  //
  //   if (creditCnt > maxCredits || maxCredits > 18) {
  //     remarks += `Credit overload: ${creditCnt} / ${maxCredits}\n`;
  //     remarks += `Student CGA: ${cga.toFixed(3)}\n`;
  //   }
  //
  //   const submission = {
  //     studentName,
  //     studentId,
  //     email,
  //     program,
  //     admissionYear,
  //     courses,
  //     remarks,
  //   };
  //
  //   const blob = new Blob([JSON.stringify(submission, null, 2)], {
  //     type: "text/plain",
  //   });
  //
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `pre-enrollment-${personalDetails.studentId}.json`;
  //   a.click();
  // };

  return (
    <div className="mx-5 p-4">
      <h1 className="text-center text-2xl font-bold mb-4">
        Thank you for submitting the pre-enrollment request!
      </h1>
      <p className="text-lg ">
        Dear {personalDetails.name},
        <br />
        The DDP Office has received your pre-enrollment request. Below you may
        find the information that you have submitted.
        <br />
        <b>Personal Details</b>
        <br />
        Student ID: {personalDetails.studentId}
        <br />
        Admission Year: {personalDetails.admissionYear}
        <br />
        Program of Study: {personalDetails.engineeringMajor}
        {personalDetails.businessMajor}
        <br />
        <br />
        <b>Courses</b>
        <ul>
          {shoppingCart.map((course) => (
            <li key={course.code}>
              {course.code} - {course.title}
            </li>
          ))}
        </ul>
        <br />
        If you have made a mistake, you may go back to the main menu and re-fill
        the form using{" "}
        <a
          href={"https://techmgmtpe-dev.hkust.edu.hk"}
          style={{ color: "#3b82f6" }}
        >
          this link
        </a>
        .
        <br />
        Your data has been cleared from the storage for your safety.
        <br />
        Thank you for using the Pre-Enrollment Portal.
      </p>
      {/*<div className="flex justify-center mt-4">*/}
      {/*  <button*/}
      {/*    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-4 rounded"*/}
      {/*    onClick={clearData}*/}
      {/*  >*/}
      {/*    Clear Data*/}
      {/*  </button>*/}
      {/*  /!*TODO: Before release, Enable Automatic Data Clearing Function!!*!/*/}
      {/*  /!*<button*!/*/}
      {/*  /!*  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-4 rounded ml-4"*!/*/}
      {/*  /!*  onClick={downloadSubmission}*!/*/}
      {/*  /!*>*!/*/}
      {/*  /!*  Download Submission*!/*/}
      {/*  /!*</button>*!/*/}
      {/*</div>*/}
    </div>
  );
}
