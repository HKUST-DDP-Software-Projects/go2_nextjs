// import { CourseEnrollment } from './course-enrollment-interface'
import { CourseEnrollment, CourseStatus } from "@/redux/features/courseSlice";
import {
  CourseListMap,
  CourseListObject,
  GR23,
  ProgrammeRequirement,
  Requirement,
  RequirementRule,
  RequirementRuleSet,
  RequirementValidation,
} from "./requirement";

let globalValidReqCount = 0;
let globalRecursionCount = 0;
let globalProgramValidateCount = 0;

const courseCreditCache: Map<string, number> = new Map();
function getCredit(courseCode: string): number {
  try {
    return courseCreditCache.get(courseCode)!;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

// // helper function 3: check list overlaps
function overlap(v1: string[], v2: string[]): string[] {
  const overlapCourses: string[] = [];

  new Set(v1).forEach((v1Course) => {
    if (v2.includes(v1Course)) overlapCourses.push(v1Course);
  });

  return overlapCourses;
}

// // helper function 4: check list singlecounts --> return courses that in v1 but not v2
function singleCount(v1: string[], v2: string[]): string[] {
  const singleCourses: string[] = [];

  v1.forEach((v1Course) => {
    if (!v2.includes(v1Course)) singleCourses.push(v1Course);
  });

  return singleCourses;
}

// // helper function 5: convert CourseListMap into a course list
function convertMapToVector(m1: CourseListMap): string[] {
  const courseSet = new Set<string>();
  [...m1.values()].forEach((val) => {
    val.forEach((courseCode) => {
      courseSet.add(courseCode);
    });
  });
  return Array.from(courseSet);
}

// // helper function 6: check credit count of list of courses
function getListCredit(courses: string[]): number {
  return courses.reduce((cred, course) => {
    try {
      const c = getCredit(course);
      return cred + c;
    } catch (e) {
      console.log(e);
      return cred;
    }
  }, 0);
}

// // helper function 7: get courses remaining by combining course list and usable count
function getRemainingCourses(
  courses: string[],
  usableCount: number[],
): string[] {
  if (usableCount.length !== courses.length)
    throw new Error("two lists with different length");
  return courses.filter((_, i) => usableCount[i] > 0);
}

// // helper function 8: get a list of courses that appears in a requirement
function getListFromReq(req: Requirement): string[] {
  const courseSet = new Set<string>(
    Object.values(req.lists).flatMap((rrs) => rrs!),
  );
  return Array.from(courseSet);
}

// // helper function 9: check if a requirement rule can be fulfilled with given courses
export function checkRequirementRule(
  r: Requirement,
  rr: RequirementRule,
  selectedCourses: string[],
): boolean {
  const courseList: string[] = [];
  rr.lists.forEach(
    (list) => r.lists[list] && courseList.push(...r.lists[list]!),
  );
  const vs = overlap(courseList, selectedCourses);
  const courseCount = vs.length;
  const credCount = getListCredit(vs);
  if (rr.maxCourseCnt && courseCount > rr.maxCourseCnt) return false;
  if (rr.minCourseCnt && courseCount < rr.minCourseCnt) return false;
  if (rr.maxCreditCnt && credCount > rr.maxCreditCnt) return false;
  if (rr.minCreditCnt && credCount < rr.minCreditCnt) return false;
  return true;
}

// // helper function 10: check if a requirement validation can be fulfilled with given courses
function checkValidations(
  rv: RequirementValidation,
  selectedCourses: string[],
): boolean {
  const vs = overlap(rv.courses, selectedCourses);
  const courseCount = vs.length;
  const credCount = getListCredit(vs);
  if (rv.maxCourseCnt && courseCount > rv.maxCourseCnt) return false;
  if (rv.minCourseCnt && courseCount < rv.minCourseCnt) return false;
  if (rv.maxCreditCnt && credCount > rv.maxCreditCnt) return false;
  if (rv.minCreditCnt && credCount < rv.minCreditCnt) return false;
  return true;
}

// // helper function 11: check if a requirement rule set can be fulfilled with given courses
export function checkRequirementRuleSet(
  r: Requirement,
  rrs: RequirementRuleSet,
  selectedCourses: string[],
): boolean {
  return rrs.rules.every((rr) => checkRequirementRule(r, rr, selectedCourses));
}

// // helper function 12: check whether a requirement can be fulfilled with given courses, by using the above 3 helper functions
function validReq(req: Requirement, selectedCourses: string[]): boolean {
  globalValidReqCount++;

  // check all validations - if one fail, matching fail
  if (!req.validations.every((rv) => checkValidations(rv, selectedCourses)))
    return false;

  // check all rulesets - if one success, matching success
  return req.rulesets.some((rrs) =>
    checkRequirementRuleSet(req, rrs, selectedCourses),
  );
}

// // helper function 13: function to iterate masks, if all masks iterated, return vector<int> with first value be -1
function nextMask(currentMask: number[], maskCount: number) {
  if (currentMask[0] === -1) {
    // current mask is none
    for (let i = 0; i < maskCount; i++) {
      // place the mask in the format of 111100000
      currentMask[i] = 1;
    }
    for (let i = maskCount; i < currentMask.length; i++) {
      currentMask[i] = 0;
    }
  } else {
    // check the rightmost index that can be rightshifted
    let indexPointer = currentMask.length - 1; // pointer scans from right to left
    let oneCount = 0; // the number of 1 identified, except the 1 that can be rightshifted
    let allOne = true; // till now all digits are 1
    while (oneCount < maskCount && indexPointer >= 0) {
      if (allOne) {
        if (currentMask[indexPointer] === 1) oneCount++;
        else allOne = false;
      } else if (currentMask[indexPointer] === 1) {
        break; // this digit 1 can be right-shifted
      }
      indexPointer--;
    }

    // if all-scanned, mask in format of 000001111
    if (oneCount === maskCount || indexPointer < 0) {
      currentMask[0] = -1; // set mask as invalid
    } else {
      // next mask is available
      currentMask[indexPointer] = 0; // rightshift the old 1, it becomes 0
      currentMask[indexPointer + 1] = 1; // the rightshifted 1
      for (let i = 0; i < oneCount; i++) {
        currentMask[indexPointer + 2 + i] = 1; // shift all the remaining 1's to the left
      }
      for (let i = indexPointer + 2 + oneCount; i < currentMask.length; i++) {
        currentMask[i] = 0; // remaining digits to be 0
      }
    }
  }
}

// // helper function 14: function to check mask does not include previous answers [every binary digit 1 in successful mask is also 1 in current mask]
// bool validMask(vector<int> currentMask, vector<vector<int>> successfulMasks)
// {
// 	for (vector<int> vi : successfulMasks)
// 	{ // check each successful mask
// 		bool binaryMatch = True;
// 		for (int i = 0; i < vi.size(); i++)
// 		{
// 			if (vi[i] == 1 && currentMask[i] == 0)
// 			{
// 				binaryMatch = False;
// 			}
// 		}
// 		if (binaryMatch)
// 			return False;
// 	}
// 	return True;
// }

// successful mask: [[1,0]], current mask: [0,1]
function validMask(currentMask: number[], successfulMasks: number[][]) {
  for (const successfulMask of successfulMasks) {
    // check each successful mask
    let binaryMatch = true;
    for (let i = 0; i < successfulMask.length; i++) {
      if (successfulMask[i] === 1 && currentMask[i] === 0) {
        binaryMatch = false;
      }
    }
    if (binaryMatch) return false;
  }
  return true;
}

// // helper function 15: mapping a Requirement with a list of relevant courses --> return list of all possible matching methods
function matchingReq(req: Requirement, courses: string[]) {
  // each vector<string> is a possible combination to matches this req
  const reqCourses = getListFromReq(req);
  const relevantCourses = overlap(reqCourses, courses);

  const masks: number[] = []; // 0-1 masks of choosing relevant courses
  masks.length = relevantCourses.length;

  const successfulCombo: string[][] = []; // function return
  if (masks.length === 0) return successfulCombo; // immediately return empty vector if no relevant courses

  masks[0] = -1; // indicate no previous masks
  const successfulMasks: number[][] = []; // store all the possible masks that can fulfill requirement

  for (let maskCount = 1; maskCount <= relevantCourses.length; maskCount++) {
    nextMask(masks, maskCount);
    while (masks[0] !== -1) {
      // check if it includes previous correct answer, if yes then start matching
      if (validMask(masks, successfulMasks)) {
        const trialCourses = getRemainingCourses(relevantCourses, masks);
        if (validReq(req, trialCourses)) {
          successfulMasks.push(JSON.parse(JSON.stringify(masks)));
          successfulCombo.push(JSON.parse(JSON.stringify(trialCourses)));
        }
      }

      // go to next mask
      nextMask(masks, maskCount);
    }
  }
  return successfulCombo;
}

// // helper function 16: validating program interaction, only happen when matching is almost completed
function programValidate(
  currentMap: CourseListMap[],
  requirements: ProgrammeRequirement[],
) {
  // Assume first major is placed first
  // Assume common core is placed last
  globalProgramValidateCount++;

  const vvs: string[][] = []; // change all "maps" to "course lists"
  vvs.length = requirements.length;
  for (let i = 0; i < requirements.length; i++) {
    vvs[i] = convertMapToVector(currentMap[i]);
  }

  for (let i = 0; i < requirements.length - 1; i++) {
    // check double counts with common core
    const doubleCountCred = getListCredit(
      overlap(vvs[i], vvs[requirements.length - 1]),
    );
    if (
      requirements[i].rules.ccMaxDoubleCount &&
      doubleCountCred > requirements[i].rules.ccMaxDoubleCount!
    ) {
      // double counted too many credits to common core
      return false;
    }

    // check single counts between programs
    if (i === 0) continue; // first major is exempted from single count credit rules
    let vsSingle = vvs[i];
    for (let j = 0; j < requirements.length - 1; j++) {
      if (i !== j) {
        vsSingle = singleCount(vsSingle, vvs[j]); // maintain vsSingle as a list of courses not used in any other reqs
      }
    }
    const singleCountCred = getListCredit(vsSingle);
    if (
      requirements[i].rules.minSingleCount &&
      singleCountCred < requirements[i].rules.minSingleCount!
    ) {
      // insufficient major or minor single count
      return false;
    }
  }

  return true;
}

// // helper function 17: edit courseUsableCount
function editUsableCount(
  count: number[],
  courses: string[],
  courseUses: string[],
  editValue: number,
) {
  courseUses.forEach((course) => {
    count[courses.indexOf(course)] += editValue;
  });
}

// // helper function MAIN: assignment across/within program
function matchingHelper(
  currentMap: CourseListMap[],
  requirements: ProgrammeRequirement[],
  matchedProgCount: number,
  matchedGroupCount: number,
  matchedReqCount: number,
  courses: CourseEnrollment[],
  courseCodes: string[],
  courseUsableCount: number[][],
): [CourseListMap[], boolean, number] {
  // currentMap: the mapped requirement - course pairs before reaching this function, int key as index of Program
  // groups: a 2D array of groups to be matched, first dimension as index of Program
  // matchedProgCount: the number of programs finished matching, also the index of the next program to be matched
  // matchedGroupCount: the number of groups finished matching, also the index of the next group to be matched
  // courses: list of course usable, or course history
  // courseUsableCount: the number of times that can be used to fulfill requirement from a respective course in "courses", first dimension index of prog
  // rules: final rules for each program
  // return variable: pair<int,CourseListMap>: the completed mapping of courses and requirements per program
  // return variable: bool: true for rules fulfilled, false otherwise

  // whole program is done matching

  globalRecursionCount++;

  if (
    matchedGroupCount ===
    requirements[matchedProgCount].requirementGroups.length
  ) {
    // check program interaction requirement satisfied or not

    if (matchedProgCount !== requirements.length - 1) {
      // first major, or interim majors / minors
      return matchingHelper(
        currentMap,
        requirements,
        matchedProgCount + 1,
        0,
        0,
        courses,
        courseCodes,
        courseUsableCount,
      );
    } else {
      const mcga = calculateCga(currentMap, requirements, courses, true);
      // last major or minor or cc, matching done
      // console.log(JSON.stringify(currentMap.map((m) => [...m.entries()])))
      return [currentMap, programValidate(currentMap, requirements), mcga];
    }
  } else if (
    matchedReqCount ===
    requirements[matchedProgCount].requirementGroups[matchedGroupCount]
      .requirements.length
  ) {
    // whole group is done matching
    return matchingHelper(
      currentMap,
      requirements,
      matchedProgCount,
      matchedGroupCount + 1,
      0,
      courses,
      courseCodes,
      courseUsableCount,
    );
  } else {
    // recursive matching
    const rq =
      requirements[matchedProgCount].requirementGroups[matchedGroupCount]
        .requirements[matchedReqCount];
    const vvs = matchingReq(
      rq,
      getRemainingCourses(courseCodes, courseUsableCount[matchedProgCount]),
    );
    if (vvs.length === 0) {
      // no possible matchings
      return [currentMap, false, -1];
    } else {
      let successMap: CourseListMap[] = [];
      let success = false;
      let mcga = -1;

      for (const vs of vvs) {
        // Try use the current matching
        currentMap[matchedProgCount].set(
          `${requirements[matchedProgCount].name}: ${rq.name}`,
          vs,
        ); // Add to current map
        editUsableCount(
          courseUsableCount[matchedProgCount],
          courseCodes,
          vs,
          -1,
        ); // Remove course from usecount
        const [newMap, currentSuccess, currentMCGA] = matchingHelper(
          currentMap,
          requirements,
          matchedProgCount,
          matchedGroupCount,
          matchedReqCount + 1,
          courses,
          courseCodes,
          courseUsableCount,
        );

        if (currentSuccess && currentMCGA > mcga) {
          mcga = currentMCGA;
          successMap = newMap.map(
            (m) => new Map(JSON.parse(JSON.stringify(Array.from(m)))),
          );
          success = true;
        }

        currentMap[matchedProgCount].delete(rq.name);
        editUsableCount(
          courseUsableCount[matchedProgCount],
          courseCodes,
          vs,
          1,
        );
      }

      // if all the trials done
      return [successMap, success, mcga];
    }
  }
}

// Assume first major is placed first
// Assume common core is placed last
export function assignCoursesToCourseLists(
  requirements: ProgrammeRequirement[],
  courses: CourseEnrollment[],
):
  | {
      map: CourseListMap[];
      globalValidReqCount: number;
      globalRecursionCount: number;
      globalProgramValidateCount: number;
      mcga: number;
    }
  | undefined {
  // populate course credit cache
  courseCreditCache.clear();
  courses.forEach((course) => courseCreditCache.set(course.code, course.units));

  // first string is requirement rule name, second vector is course code list
  globalValidReqCount = 0;
  globalRecursionCount = 0;
  globalProgramValidateCount = 0;

  const courseCodes = courses.map((c) => c.code);

  // courseUsableCount[idx of programme][idx of course] = number of times the course can be used
  const courseUsableCount: number[][] = [];
  requirements.forEach((programme, i) => {
    // if a course is in the reusable list, it can be used twice
    courseUsableCount.push([]);
    courseCodes.forEach((course, j) => {
      courseUsableCount[i][j] = 1;
      if (programme.reusableCourses.includes(course)) {
        courseUsableCount[i][j] = 2;
      }
    });
  });

  const currentMap: CourseListMap[] = [];
  for (let i = 0; i < requirements.length; i++) {
    currentMap[i] = new Map();
  }
  const pairedResult = matchingHelper(
    currentMap,
    requirements,
    0,
    0,
    0,
    courses,
    courseCodes,
    courseUsableCount,
  );

  if (!pairedResult[1]) {
    // boolean = False, no suitable matching
    return undefined;
  }

  return {
    map: pairedResult[0],
    globalValidReqCount,
    globalRecursionCount,
    globalProgramValidateCount,
    mcga: pairedResult[2],
  };
}

// // helper function 15p: mapping a Requirement with a list of relevant courses --> return list of all possible matching methods PARTIAL
function matchingReqPartial(req: Requirement, courseCodes: string[]): string[] {
  // each vector<string> is a possible combination to matches this req
  const reqCourses = getListFromReq(req);
  const relevantCourses = overlap(reqCourses, courseCodes);

  const masks: number[] = []; // 0-1 masks of choosing relevant courses
  masks.length = relevantCourses.length;

  if (masks.length === 0) {
    return relevantCourses; // return empty vector since no course overlap
  }

  masks[0] = -1; // indicate no previous masks
  let successfulCombo = relevantCourses; // function return, default to use all courses

  for (let maskCount = 1; maskCount <= relevantCourses.length; maskCount++) {
    nextMask(masks, maskCount); // 0-1 masks of choosing relevant courses
    while (masks[0] !== -1) {
      const trialCourses = getRemainingCourses(relevantCourses, masks);
      if (validReq(req, trialCourses)) {
        successfulCombo = trialCourses;
        break; // since we only need to partial match, we only need one successful combo
      }
      // go to next mask
      nextMask(masks, maskCount); // 0-1 masks of choosing relevant courses
    }
  }

  return successfulCombo;
}

// // helper function MAINp: assignment across/within program PARTIAL
function matchingHelperPartial(
  currentMap: CourseListMap[],
  requirements: ProgrammeRequirement[],
  matchedProgCount: number,
  matchedGroupCount: number,
  matchedReqCount: number,
  courseCodes: string[],
  courseUsableCount: number[][],
): [CourseListMap[], boolean] {
  // currentMap: the mapped requirement - course pairs before reaching this function, int key as index of Program
  // groups: a 2D array of groups to be matched, first dimension as index of Program
  // matchedProgCount: the number of programs finished matching, also the index of the next program to be matched
  // matchedGroupCount: the number of groups finished matching, also the index of the next group to be matched
  // courses: list of course usable, or course history
  // courseUsableCount: the number of times that can be used to fulfill requirement from a respective course in "courses", first dimension index of prog
  // rules: final rules for each program
  // return variable: pair<int,CourseListMap>: the completed mapping of courses and requirements per program
  // return variable: bool: true for rules fulfilled, false otherwise

  // print out all the variables
  // console.log({
  //   currentMap,
  //   matchedProgCount,
  //   matchedGroupCount,
  //   matchedReqCount,
  // });

  // whole program is done matching
  if (
    matchedGroupCount ===
    requirements[matchedProgCount].requirementGroups.length
  ) {
    // check program interaction requirement satisfied or not

    if (matchedProgCount !== requirements.length - 1) {
      // first major, or interim majors / minors
      return matchingHelperPartial(
        currentMap,
        requirements,
        matchedProgCount + 1,
        0,
        0,
        courseCodes,
        courseUsableCount,
      );
    } else {
      // last major or minor or cc, matching done
      return [currentMap, true]; // always return True
    }
  } else if (
    matchedReqCount ===
    requirements[matchedProgCount].requirementGroups[matchedGroupCount]
      .requirements.length
  ) {
    // whole group is done matching
    return matchingHelperPartial(
      currentMap,
      requirements,
      matchedProgCount,
      matchedGroupCount + 1,
      0,
      courseCodes,
      courseUsableCount,
    );
  } else {
    // recursive matching
    const rq =
      requirements[matchedProgCount].requirementGroups[matchedGroupCount]
        .requirements[matchedReqCount];
    const vvs = matchingReqPartial(
      rq,
      getRemainingCourses(courseCodes, courseUsableCount[matchedProgCount]),
    );
    // Try use the current matching
    currentMap[matchedProgCount].set(
      `${requirements[matchedProgCount].name}: ${rq.name}`,
      vvs,
    ); // Add to current map
    editUsableCount(courseUsableCount[matchedProgCount], courseCodes, vvs, -1); // Remove course from usecount
    matchingHelperPartial(
      currentMap,
      requirements,
      matchedProgCount,
      matchedGroupCount,
      matchedReqCount + 1,
      courseCodes,
      courseUsableCount,
    );

    // if trial is successful - always successful since PARTIAL
    return [currentMap, true];
  }
}

// // main function that does matching PARTIAL
export function assignCoursesToCourseListsPartial(
  requirements: ProgrammeRequirement[],
  courses: CourseEnrollment[],
): CourseListMap[] {
  const courseUsableCount: number[][] = [];
  const courseCodes = courses.map((c) => c.code);

  requirements.forEach((programme, i) => {
    // if a course is in the reusable list, it can be used twice
    courseUsableCount.push([]);
    courseCodes.forEach((course, j) => {
      courseUsableCount[i][j] = 1;
      if (programme.reusableCourses.includes(course)) {
        courseUsableCount[i][j] = 2;
      }
    });
  });

  // Initialize currentMap with empty maps of length requirements.length
  const currentMap: CourseListMap[] = [];
  for (let i = 0; i < requirements.length; i++) {
    currentMap[i] = new Map();
  }

  const pairedResult = matchingHelperPartial(
    currentMap,
    requirements,
    0,
    0,
    0,
    courseCodes,
    courseUsableCount,
  );

  return pairedResult[0];
}

export function populateCourseListMap(
  programme: ProgrammeRequirement,
  courseListMap: CourseListMap,
  courses: CourseEnrollment[],
  gr23s: GR23[],
): CourseListMap {
  const courseCodes = courses.map((c) => c.code);
  const newCourseListMap: CourseListMap = new Map();
  const existingCourses = [...courseListMap.values()].flat();
  for (const [courseListKey, courseList] of courseListMap) {
    const newCourseList: string[] = [];
    for (const course of courseList) {
      if (course.endsWith("?")) {
        newCourseList.push(
          ...courseCodes.filter(
            (c) =>
              c.startsWith(course.slice(0, -1)) && !existingCourses.includes(c),
          ),
        );
      } else {
        newCourseList.push(course);
      }
    }

    // Add GR23 courses
    gr23s
      .filter(
        (gr23) =>
          gr23.programme === programme.name &&
          gr23.requirementListName === courseListKey,
      )
      .forEach((gr23) => {
        newCourseList.push(gr23.courseToAdd);
      });

    newCourseListMap.set(courseListKey, newCourseList);
  }
  return newCourseListMap;
}

export function populateCourseListObject(
  programme: ProgrammeRequirement,
  courseListObject: CourseListObject,
  courses: CourseEnrollment[],
  gr23s: GR23[],
): CourseListObject {
  const courseCodes = courses.map((c) => c.code);
  const newCourseListObject: CourseListObject = {};
  const existingCourses = Object.values(courseListObject).flat();
  for (const [courseListKey, courseList] of Object.entries(courseListObject)) {
    const newCourseList: string[] = [];
    for (const course of courseList!) {
      if (course.endsWith("?")) {
        newCourseList.push(
          ...courseCodes.filter(
            (c) =>
              c.startsWith(course.slice(0, -1)) && !existingCourses.includes(c),
          ),
        );
      } else {
        newCourseList.push(course);
      }
    }

    // Add GR23 courses
    gr23s
      .filter(
        (gr23) =>
          gr23.programme === programme.name &&
          gr23.requirementListName === courseListKey,
      )
      .forEach((gr23) => {
        newCourseList.push(gr23.courseToAdd);
      });

    newCourseListObject[courseListKey] = newCourseList;
  }
  return newCourseListObject;
}

export function calculateCga(
  currentMap: CourseListMap[],
  requirements: ProgrammeRequirement[],
  courses: CourseEnrollment[],
  mcga: boolean,
): number {
  const relevantCourseCodes = [
    ...new Set(
      requirements.flatMap((programme, i) => {
        if (mcga && !programme.rules.mcga) {
          return [];
        }

        return [...currentMap[i].values()].flat();
      }),
    ),
  ];

  const relevantCourses = courses.filter(
    (course) =>
      (!mcga || relevantCourseCodes.includes(course.code)) &&
      course.status === CourseStatus.TAKEN &&
      !["PP", "P"].includes(course.grade),
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
}

export function gradeToNumber(grade: string): number {
  switch (grade) {
    case "A+":
      return 4.3;
    case "A":
      return 4;
    case "A-":
      return 3.7;
    case "B+":
      return 3.3;
    case "B":
      return 3;
    case "B-":
      return 2.7;
    case "C+":
      return 2.3;
    case "C":
      return 2;
    case "C-":
      return 1.7;
    case "D":
      return 1;
    default:
      return 0;
  }
}
