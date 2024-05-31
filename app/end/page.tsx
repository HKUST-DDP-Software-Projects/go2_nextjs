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

  const maxCredits = cga < 3 ? 20 : cga >= 3 && cga <= 3.29 ? 21 : 24;

  const clearData = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const downloadSubmission = () => {
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

    const creditCnt = shoppingCart.reduce(
      (acc, course) => acc + course.units,
      0,
    );

    if (creditCnt > maxCredits || maxCredits > 18) {
      remarks += `Credit overload: ${creditCnt} / ${maxCredits}\n`;
      remarks += `Student CGA: ${cga.toFixed(3)}\n`;
    }

    const submission = {
      studentName,
      studentId,
      email,
      program,
      admissionYear,
      courses,
      remarks,
    };

    const blob = new Blob([JSON.stringify(submission, null, 2)], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pre-enrollment-${personalDetails.studentId}.json`;
    a.click();
  };

  return (
    <div className="mx-5 p-4">
      <h1 className="text-center text-2xl font-bold mb-4">
        Thank you for submitting the pre-enrollment request!
      </h1>
      <p className="text-lg ">
        The DDP Office has received your pre-enrollment request. You will
        receive a confirmation email by the end of pre-enrollment period.
        <br />
        If you have made a mistake, you may go back to the previous pages using
        the navigation bar.
        <br />
        If you are using a shared computer, please remember to clear your data
        using the button below.
        <br />
        You may also download a copy of your data using the button below.
      </p>
      <div className="flex justify-center mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-4 rounded"
          onClick={clearData}
        >
          Clear Data
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-4 rounded ml-4"
          onClick={downloadSubmission}
        >
          Download Submission
        </button>
      </div>
    </div>
  );
}
