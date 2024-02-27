// import Modal from "@/components/modal";
// import { CourseEnrollment } from "@/redux/features/courseSlice";
// import { setSelectedCoursesInRequirement } from "@/redux/features/plannerSlice";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import { useState } from "react";

// type Props = {
//   degreeIdx: number;
//   programmeIdx: number;
//   requirementName: string;
//   courseListName: string;

//   onClose: () => void;
//   isOpen: boolean;
// };

// export default function CourseSelectionModal({
//   degreeIdx,
//   programmeIdx,
//   requirementName,
//   courseListName,
//   onClose,
//   isOpen,
// }: Props) {
//   return <div>Course Selection Modal</div>;
//   const [searchTerm, setSearchTerm] = useState("");
//   const [departmentFilter, setDepartmentFilter] = useState("");
//   const [creditsFilter, setCreditsFilter] = useState("");

//   const enrollments = useAppSelector(
//     (state) => state.courseReducer.courseHistory,
//   );

//   const dispatch = useAppDispatch();

//   const selectedCourses = useAppSelector(
//     (state) =>
//       state.plannerReducer.planner[degreeIdx][programmeIdx][requirementName],
//   );

//   const setSelectedCourses = (courses: string[]) => {
//     dispatch(setSelectedCoursesInRequirement(courses));
//   };

//   const handleCourseSelect = (course: CourseEnrollment) => {
//     setSelectedCourses([...selectedCourses, course]);
//   };

//   const handleCourseRemove = (courseId: string) => {
//     const courseIndex = selectedCourses.findIndex(
//       (course) => course.code === courseId,
//     );
//     setSelectedCourses([
//       ...selectedCourses.slice(0, courseIndex),
//       ...selectedCourses.slice(courseIndex + 1),
//     ]);
//   };

//   const filteredCourses = enrollments.filter(
//     (course) =>
//       course.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
//       course.code
//         .split(" ")?.[0]
//         .toLowerCase()
//         .includes(departmentFilter.toLowerCase()) &&
//       (creditsFilter === "" || course.units === parseInt(creditsFilter)),
//   );

//   const isCourseSelected = (courseId: string) =>
//     selectedCourses.some((course) => course.code === courseId);

//   const isCourseEnrolled = (courseId: string) =>
//     enrollments.some((enrollment) => enrollment.code === courseId);

//   return (
//     <Modal
//       isModalOpen={isOpen}
//       title="Select Courses"
//       onCancel={onClose}
//       actionText="Set Courses"
//       onAction={() => {}}
//     >
//       <div className="bg-gray-100 p-4 flex flex-col">
//         <div className="flex-grow flex flex-col mb-4">
//           <div className="flex items-center mb-2 flex-col md:flex-row">
//             <label htmlFor="search" className="mr-2">
//               Search:
//             </label>
//             <input
//               type="text"
//               className="border border-gray-300 p-1 rounded-md focus:outline-none flex-grow"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>
//         <div className="flex-grow flex justify-between flex-col md:flex-row">
//           <div className="flex items-center mb-2 flex-col md:flex-row">
//             <label htmlFor="department" className="mr-2">
//               Department:
//             </label>
//             <input
//               type="text"
//               id="department"
//               value={departmentFilter}
//               onChange={(e) => setDepartmentFilter(e.target.value)}
//               className="border border-gray-300 p-1 rounded-md focus:outline-none w-full"
//             />
//           </div>
//           <div className="flex items-center mb-2 flex-col md:flex-row">
//             <label htmlFor="credits" className="mr-2">
//               Credits:
//             </label>
//             <input
//               type="text"
//               id="credits"
//               value={creditsFilter}
//               onChange={(e) => setCreditsFilter(e.target.value)}
//               className="border border-gray-300 p-1 rounded-md focus:outline-none w-full"
//             />
//           </div>
//         </div>
//       </div>
//       <div className="p-4">
//         {filteredCourses.map((course) => (
//           <div
//             key={`${course.code}-${course.term}`}
//             className={`flex justify-between items-center bg-white rounded-md p-2 mb-2 shadow-sm ${
//               isCourseSelected(course.code)
//                 ? "bg-green-100"
//                 : isCourseEnrolled(course.code)
//                 ? "bg-blue-100"
//                 : ""
//             }`}
//           >
//             <span className="mr-2">{course.code}</span>
//             <span>{course.title}</span>
//             <button
//               onClick={() =>
//                 isCourseSelected(course.code)
//                   ? handleCourseRemove(course.code)
//                   : handleCourseSelect(course)
//               }
//               className={`${
//                 isCourseSelected(course.code) ? "text-red-500" : ""
//               } hover:text-red-700`}
//             >
//               {isCourseSelected(course.code) ? "Remove" : "Select"}
//             </button>
//           </div>
//         ))}
//       </div>
//       <div className="bg-gray-100 p-4">
//         <h3 className="text-lg font-medium mb-2">Selected Courses</h3>
//         <div className="flex flex-wrap">
//           {selectedCourses.map((course) => (
//             <div
//               key={`${course.code}-${course.term}`}
//               className="bg-green-100 rounded-md p-2 m-1"
//             >
//               {course.code}
//             </div>
//           ))}
//         </div>
//       </div>
//     </Modal>
//   );
// }
