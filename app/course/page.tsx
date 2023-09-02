"use client";

import {
  CourseDetail,
  CourseEnrollment,
  CourseStatus,
  addCourseEnrollment,
  editCourseEnrollment,
  removeCourseEnrollment,
} from "@/redux/features/courseSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { useState } from "react";

const CourseAutocomplete = ({
  handleSelectCourse,
}: {
  handleSelectCourse: (course: CourseDetail) => void;
}) => {
  const courseCatalog = useAppSelector(
    (state) => state.courseReducer.courseCatalog,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CourseDetail[]>([]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const results = Object.values(courseCatalog).filter((course) =>
      course.code.toLowerCase().includes(event.target.value.toLowerCase()),
    );
    setSearchResults(results);
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="courseName"
        className="block text-gray-700 font-medium mb-2"
      >
        Search Course
      </label>
      <input
        type="text"
        id="courseName"
        name="courseName"
        value={searchTerm}
        onChange={handleSearchChange}
        onBlur={() => {
          setTimeout(() => {
            setSearchResults([]);
          }, 200);
        }}
        className="border border-gray-300 px-4 py-2 w-full rounded-md"
      />
      {searchResults.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 mt-1 overflow-y-scroll h-full">
          {searchResults.map((course) => (
            <li
              key={`${course.code}-${course.title}`}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200 w-full"
              onClick={() => {
                setSearchTerm("");
                setSearchResults([]);
                handleSelectCourse(course);
              }}
            >
              {course.title} ({course.code} - {course.units} units)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CoursePage = () => {
  const dispatch = useAppDispatch();
  const courseEnrollments = useAppSelector(
    (state) => state.courseReducer.courseHistory,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseEnrollment, setSelectedCourseEnrollment] =
    useState<CourseEnrollment | null>(null);
  const initialFormData = {
    code: "",
    title: "",
    units: 0,
    term: "",
    grade: "",
    status: CourseStatus.PLANNED,
  };
  const [formData, setFormData] = useState<CourseEnrollment>(initialFormData);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddCourseEnrollment = () => {
    dispatch(addCourseEnrollment(formData));
    setFormData(initialFormData);
    setIsModalOpen(false);
  };

  const handleEditCourseEnrollment = () => {
    if (selectedCourseEnrollment === null) return;
    dispatch(editCourseEnrollment([selectedCourseEnrollment, formData]));
    setFormData(initialFormData);
    setSelectedCourseEnrollment(null);
    setIsModalOpen(false);
  };

  const handleRemoveCourseEnrollment = (courseEnrollment: CourseEnrollment) => {
    dispatch(removeCourseEnrollment(courseEnrollment));
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Course Enrollment</h3>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5 inline-block mr-2" />
          Add Course Enrollment
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Course Code</th>
            <th className="border border-gray-300 px-4 py-2">Course Name</th>
            <th className="border border-gray-300 px-4 py-2">Units</th>
            <th className="border border-gray-300 px-4 py-2">Term</th>
            <th className="border border-gray-300 px-4 py-2">Grade</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">
              Used in requirements
            </th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courseEnrollments.map((courseEnrollment) => (
            <tr key={`${courseEnrollment.code}-${courseEnrollment.term}`}>
              <td className="border border-gray-300 px-4 py-2">
                {courseEnrollment.code}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {courseEnrollment.title}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {courseEnrollment.units}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {courseEnrollment.term}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {courseEnrollment.grade}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {courseEnrollment.status}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                To be implemented
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  onClick={() => {
                    setSelectedCourseEnrollment(courseEnrollment);
                    setFormData(courseEnrollment);
                    setIsModalOpen(true);
                  }}
                >
                  <PencilIcon className="h-5 w-5 inline-block" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveCourseEnrollment(courseEnrollment)}
                >
                  <TrashIcon className="h-5 w-5 inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-1/2 overflow-y-auto max-h-full">
            <h3 className="text-lg font-medium mb-4">
              {selectedCourseEnrollment
                ? "Edit Course Enrollment"
                : "Add Course Enrollment"}
            </h3>
            <CourseAutocomplete
              handleSelectCourse={(course) => {
                setFormData({
                  ...formData,
                  code: course.code,
                  title: course.title,
                  units: course.units,
                });
              }}
            />
            <div className="mb-4">
              <label
                htmlFor="courseCode"
                className="block text-gray-700 font-medium mb-2"
              >
                Course Code
              </label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.code}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="courseName"
                className="block text-gray-700 font-medium mb-2"
              >
                Course Name
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.title}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="units"
                className="block text-gray-700 font-medium mb-2"
              >
                Units
              </label>
              <input
                type="number"
                id="units"
                name="units"
                value={formData.units}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="term"
                className="block text-gray-700 font-medium mb-2"
              >
                Term
              </label>
              <input
                type="text"
                id="term"
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="grade"
                className="block text-gray-700 font-medium mb-2"
              >
                Grade
              </label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-gray-700 font-medium mb-2"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 w-full rounded-md"
              >
                <option value={CourseStatus.PLANNED}>Planned</option>
                <option value={CourseStatus.IN_PROGRESS}>In Progress</option>
                <option value={CourseStatus.TAKEN}>Taken</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
                onClick={
                  selectedCourseEnrollment
                    ? handleEditCourseEnrollment
                    : handleAddCourseEnrollment
                }
              >
                {selectedCourseEnrollment ? "Save" : "Add"}
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => {
                  setSelectedCourseEnrollment(null);
                  setFormData({ courseName: "", courseCode: "", grade: "" });
                  setIsModalOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;
