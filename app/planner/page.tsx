// "use client";
// // import React, { useState } from 'react';
// // import all_courses_w_prereq from "@/helpers/all_courses_w_prereq.json";

// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// // import { programRequirements } from "@/helpers/requirement";
// import Accordion from "@/components/accordion";
// import Tabs from "@/components/tab";
// import {
//   checkExclusionGroup,
//   checkPrerequisiteGroup,
//   COURSE_CATALOG,
//   returnCorequisiteGroup,
// } from "@/helpers/course";
// import {
//   checkRequirementRule,
//   checkRequirementRuleSet,
// } from "@/helpers/matcher";
// import { Requirement, RequirementRule } from "@/helpers/requirement";

// import { match } from "@/redux/features/plannerSlice";
// import { PencilIcon } from "@heroicons/react/outline";
// import Chip from "@/components/chip";

// type OpenCourseSelectionModal = (
//   courseList: string[],
//   selectedCourses: string[],
// ) => void;

// interface RequirementListProps {
//   name: string;
//   selectedCourses: string[];
//   courseList: string[];
//   openCourseSelectionModal: OpenCourseSelectionModal;
// }

// function ControlledCheckbox({ checked }: { checked: boolean }) {
//   return (
//     <input
//       type="checkbox"
//       className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out flex-shrink-0"
//       checked={checked}
//       readOnly
//     />
//   );
// }

// function getRuleString(rule: RequirementRule): string {
//   const ruleStrings = [];
//   if (rule.minCreditCnt) {
//     ruleStrings.push(`${rule.minCreditCnt} or more credit(s)`);
//   }
//   if (rule.maxCreditCnt) {
//     ruleStrings.push(`${rule.maxCreditCnt} or fewer credit(s)`);
//   }
//   if (rule.minCourseCnt) {
//     ruleStrings.push(`${rule.minCourseCnt} or more course(s)`);
//   }
//   if (rule.maxCourseCnt) {
//     ruleStrings.push(`${rule.maxCourseCnt} or fewer course(s)`);
//   }

//   let ruleString = `Took ${ruleStrings.join(", ")}`;
//   if (rule.lists) {
//     ruleString += ` from ${rule.lists.map((list) => `"${list}"`).join(", ")}`;
//   }
//   return ruleString;
// }

// function RequirementList({
//   name,
//   selectedCourses,
//   courseList,
//   openCourseSelectionModal,
// }: RequirementListProps) {
//   return (
//     <div className="border-r border-gray-200 mr-4 p-4 rounded-sm w-72 h-full flex-shrink-0 flex flex-col bg-white relative">
//       <div className="flex-shrink-0">
//         <h3 className="text-lg font-medium">{name}</h3>
//       </div>
//       <div className="pl-4 flex flex-wrap overflow-y-scroll">
//         {selectedCourses.map((course) => (
//           <Chip key={course} label={course} />
//         ))}
//       </div>
//       <button
//         className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
//         onClick={() => openCourseSelectionModal(courseList, selectedCourses)}
//       >
//         <PencilIcon className="h-5 w-5" />
//       </button>
//     </div>
//   );
// }

// interface RequirementProps {
//   requirement: Requirement;
//   planner: { [key: string]: string[] };
//   openCourseSelectionModal: (
//     courseList: string[],
//     selectedCourses: string[],
//   ) => void;
// }

// interface SelectableCoursesListProps {
//   requirement: Requirement;
//   selectedCourses: string[];
// }

// function SelectableCoursesList({
//   requirement,
//   selectedCourses,
// }: SelectableCoursesListProps) {
//   // console.log("courseCodes", courseCodes)
//   let isRequirementMet = false;
//   for (const ruleset of requirement.rulesets) {
//     if (checkRequirementRuleSet(requirement, ruleset, selectedCourses)) {
//       isRequirementMet = true;
//       break;
//     }
//   }
//   const courseList = [];
//   if (!isRequirementMet) {
//     const requirementList = [];
//     for (const ruleset of requirement.rulesets) {
//       // Assume this ruleset is not fulfilled
//       for (const rule of ruleset.rules) {
//         if (!checkRequirementRule(requirement, rule, selectedCourses)) {
//           requirementList.push(...rule.lists);
//         }
//       }
//     }
//     for (const [list_name, course_list] of Object.entries(requirement.lists)) {
//       if (requirementList.includes(list_name)) {
//         if (course_list) {
//           courseList.push(...course_list);
//         }
//       }
//     }
//   }

//   // Prerequisites & Exclusions Filtering
//   const courseCodes = useAppSelector((state) =>
//     state.courseReducer.courseHistory.map((course) => course.code),
//   );
//   const filteredCourses = courseList
//     .map((course) => COURSE_CATALOG.find((c) => c.code === course))
//     .filter(
//       (course) =>
//         course &&
//         checkPrerequisiteGroup(course, courseCodes) &&
//         !checkExclusionGroup(course, courseCodes),
//     );
//   const uniqueFilteredCourses = Array.from(new Set(filteredCourses));
//   console.log("uniqueFilteredCourses", uniqueFilteredCourses);
//   // Corequisite listing
//   const corequisiteDict: { [key: string]: string[] } = {};
//   uniqueFilteredCourses.forEach((course) => {
//     const corequisites = returnCorequisiteGroup(course, courseCodes);
//     if (course && corequisites.length > 0) {
//       corequisiteDict[course.code] = corequisites;
//     }
//   });
//   // return { corequisiteDict, uniqueFilteredCourses };
//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h2 style={{ color: "#2c3e50", marginBottom: "10px" }}>
//         Selectable Courses:
//       </h2>
//       {uniqueFilteredCourses.length > 0 ? (
//         <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
//           {uniqueFilteredCourses.map((course) => (
//             <li
//               key={course?.code}
//               style={{
//                 marginBottom: "10px",
//                 backgroundColor: "#ecf0f1",
//                 padding: "10px",
//                 borderRadius: "5px",
//               }}
//             >
//               {course?.code}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No courses available.</p>
//       )}

//       <h2 style={{ color: "#2c3e50", marginTop: "20px", marginBottom: "10px" }}>
//         Corequisite List:
//       </h2>
//       {Object.keys(corequisiteDict).length > 0 ? (
//         <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
//           {Object.entries(corequisiteDict).map(([courseCode, corequisites]) => (
//             <li
//               key={courseCode}
//               style={{
//                 marginBottom: "10px",
//                 backgroundColor: "#ecf0f1",
//                 padding: "10px",
//                 borderRadius: "5px",
//               }}
//             >
//               <strong>{courseCode}:</strong> {corequisites.join(", ")}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No corequisites available.</p>
//       )}
//     </div>
//   );
// }

// function RequirementComponent({
//   requirement,
//   planner,
//   openCourseSelectionModal,
// }: RequirementProps) {
//   const selectedCourses = planner?.[requirement.name] || [];
//   // find the first valid ruleset
//   const validRulesetIdx = requirement.rulesets.findIndex((ruleset) =>
//     checkRequirementRuleSet(requirement, ruleset, selectedCourses),
//   );

//   // contain all indices other than the first valid ruleset
//   const defaultActiveIndex = requirement.rulesets
//     .map((_, index) => index)
//     .filter((index) => index !== validRulesetIdx);

//   return (
//     <div className="pl-4 flex flex-col md:flex-row" style={{ height: "300px" }}>
//       <div
//         className="md:w-2/4 w-full h-48 flex-grow flex overflow-x-auto bg-white shadow rounded-lg p-4"
//         style={{ height: "300px" }}
//       >
//         <h2 className="text-2xl font-bold mb-4">Course Requirements</h2>
//         {Object.entries(requirement.lists).map(([name, courseList]) => (
//           <RequirementList
//             key={name}
//             name={name}
//             selectedCourses={[
//               ...new Set(
//                 courseList!.filter((course) =>
//                   selectedCourses.includes(course),
//                 ),
//               ),
//             ]}
//             courseList={courseList!}
//             openCourseSelectionModal={openCourseSelectionModal}
//           />
//         ))}
//       </div>
//       <div
//         className="md:w-1/4 w-full h-48 md:border-l border-gray-200 p-4 bg-white shadow rounded-lg mt-4 md:mt-0 md:ml-4"
//         style={{ height: "300px" }}
//       >
//         <h2 className="text-2xl font-bold mb-4">Rulesets</h2>
//         <Accordion
//           items={[...requirement.rulesets]
//             .sort(
//               (a, b) =>
//                 Number(
//                   checkRequirementRuleSet(requirement, b, selectedCourses),
//                 ) -
//                 Number(
//                   checkRequirementRuleSet(requirement, a, selectedCourses),
//                 ),
//             )
//             .map((ruleset) => ({
//               key: ruleset.description,
//               title: (
//                 <div className="flex items-center">
//                   <ControlledCheckbox
//                     checked={checkRequirementRuleSet(
//                       requirement,
//                       ruleset,
//                       selectedCourses,
//                     )}
//                   />
//                   <h3 className="text-lg font-medium ml-2">
//                     {ruleset.description}
//                   </h3>
//                 </div>
//               ),
//               content: (
//                 <div className="pl-4">
//                   {ruleset.rules.map((rule) => (
//                     <div
//                       key={rule.lists.join("")}
//                       className="flex items-center"
//                     >
//                       <ControlledCheckbox
//                         checked={checkRequirementRule(
//                           requirement,
//                           rule,
//                           selectedCourses,
//                         )}
//                       />
//                       <label
//                         htmlFor="checkbox"
//                         className="ml-2 block text-sm leading-5 text-gray-900"
//                       >
//                         {getRuleString(rule)}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               ),
//             }))}
//           defaultActive={false}
//           defaultActiveIndex={defaultActiveIndex}
//         />
//       </div>
//       <div
//         className="md:w-1/4 w-full h-48 md:border-l border-gray-200 p-4 bg-white shadow rounded-lg mt-4 md:mt-0 md:ml-4"
//         style={{ height: "300px" }}
//       >
//         <h2 className="text-2xl font-bold mb-4">Courses for You</h2>
//         <Accordion
//           items={[
//             {
//               key: "selectable courses",
//               title: (
//                 <div className="flex items-center">
//                   <h3 className="text-lg font-medium ml-2">
//                     Selectable Courses
//                   </h3>
//                 </div>
//               ),
//               content: (
//                 <SelectableCoursesList
//                   requirement={requirement}
//                   selectedCourses={selectedCourses}
//                 />
//               ),
//             },
//           ]}
//           defaultActive={false}
//           defaultActiveIndex={defaultActiveIndex}
//         />
//       </div>
//     </div>
//   );
// }

// export default function Planner() {
//   const dispatch = useAppDispatch();
//   const courseEnrollments = useAppSelector(
//     (state) => state.courseReducer.courseHistory,
//   );
//   const programmes = useAppSelector(
//     (state) => state.plannerReducer.selectedDegrees,
//   );
//   const planner = useAppSelector((state) => state.plannerReducer.planner);

//   // const [isCourseSelectionModalOpen, setIsCourseSelectionModalOpen] =
//   //   useState(false);
//   // const [courseList, setCourseList] = useState<string[]>([]);
//   // const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

//   return (
//     <main className="w-full h-full mx-auto p-4">
//       <Tabs
//         tabs={programmes.map((degree, degreeIdx) => ({
//           label: degree.name,
//           content: (
//             <div className="flex flex-col">
//               <div className="flex flex-wrap">
//                 <button
//                   className="bg-gray-200 rounded-sm px-4 py-2 mr-2 mb-2"
//                   onClick={() =>
//                     dispatch(match([courseEnrollments, degreeIdx]))
//                   }
//                 >
//                   Match
//                 </button>
//               </div>
//               <Accordion
//                 defaultActive={true}
//                 items={degree.requirements.map((programme, programmeIdx) => ({
//                   key: programme.name,
//                   title: programme.name,
//                   content: (
//                     <Accordion
//                       defaultActive={true}
//                       items={programme.requirementGroups
//                         .flatMap((group) => group.requirements)
//                         .map((requirement) => ({
//                           key: requirement.name,
//                           title: requirement.name,
//                           content: (
//                             <RequirementComponent
//                               requirement={requirement}
//                               planner={planner[degreeIdx][programmeIdx]}
//                               openCourseSelectionModal={() => {}}
//                             />
//                           ),
//                         }))}
//                     />
//                   ),
//                 }))}
//               />
//             </div>
//           ),
//         }))}
//       ></Tabs>
//       {/* <CourseSelectionModal
//         isOpen={isCourseSelectionModalOpen}
//         onClose={() => setIsCourseSelectionModalOpen(false)}
//         selectedCourses={selectedCourses}
//         courseList={courseList}
//       /> */}
//     </main>
//   );
// }
