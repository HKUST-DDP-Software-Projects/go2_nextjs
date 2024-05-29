"use client";

import Autocomplete from "@/components/autocomplete";
import Modal from "@/components/modal";
import Table from "@/components/table";
import {
  addCourseEnrollment,
  editCourseEnrollment,
  removeCourseEnrollment,
  handleImport,
} from "@/redux/features/courseSlice";
import { CourseDetail, CourseEnrollment, CourseStatus } from "@/helpers/course";
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

  return (
    <Autocomplete
      options={Object.values(courseCatalog)}
      onSelect={handleSelectCourse}
      label="Search Course"
      placeholder="Search Course"
      displayOption={(course) => `${course.title} (${course.code})`}
    />
  );
};

const CoursePage = () => {
  const dispatch = useAppDispatch();
  const courseEnrollments = useAppSelector(
    (state) => state.courseReducer.courseHistory,
  );

  const [isEditCourseEnrollmentModalOpen, setIsEditCourseEnrollmentModalOpen] =
    useState(false);
  const [isImportCourseModalOpen, setIsImportCourseModalOpen] = useState(false);

  const [selectedCourseEnrollment, setSelectedCourseEnrollment] =
    useState<CourseEnrollment | null>(null);
  const initialFormData = {
    code: "",
    title: "",
    units: 0,
    term: "",
    grade: "",
    status: CourseStatus.PLANNED,
    prerequisites: [],
    corequisites: [],
    exclusions: [],
  } satisfies CourseEnrollment;
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
    setIsEditCourseEnrollmentModalOpen(false);
  };

  const handleEditCourseEnrollment = () => {
    if (selectedCourseEnrollment === null) return;
    dispatch(editCourseEnrollment([selectedCourseEnrollment, formData]));
    setFormData(initialFormData);
    setSelectedCourseEnrollment(null);
    setIsEditCourseEnrollmentModalOpen(false);
  };

  const handleRemoveCourseEnrollment = (courseEnrollment: CourseEnrollment) => {
    dispatch(removeCourseEnrollment(courseEnrollment));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Course Enrollment</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
          onClick={() => setIsImportCourseModalOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 inline-block mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          Import Course from SIS
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={() => setIsEditCourseEnrollmentModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5 inline-block mr-2" />
          Add Course Enrollment
        </button>
      </div>
      <Table
        columns={[
          {
            key: "code",
            header: "Course Code",
          },
          {
            key: "title",
            header: "Course Name",
          },
          {
            key: "units",
            header: "Units",
          },
          {
            key: "term",
            header: "Term",
          },
          {
            key: "grade",
            header: "Grade",
          },
          {
            key: "status",
            header: "Status",
          },
          {
            key: "custom",
            header: "Actions",
            format: (courseEnrollment: CourseEnrollment) => (
              <>
                <button
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  onClick={() => {
                    setSelectedCourseEnrollment(courseEnrollment);
                    setFormData(courseEnrollment);
                    setIsEditCourseEnrollmentModalOpen(true);
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
              </>
            ),
          },
        ]}
        data={courseEnrollments}
        keyFunc={(course) => `${course.code}-${course.term}`}
      />
      <Modal
        isModalOpen={isEditCourseEnrollmentModalOpen}
        title={
          selectedCourseEnrollment
            ? "Edit Course Enrollment"
            : "Add Course Enrollment"
        }
        actionText={selectedCourseEnrollment ? "Save" : "Add"}
        onAction={
          selectedCourseEnrollment
            ? handleEditCourseEnrollment
            : handleAddCourseEnrollment
        }
        onCancel={() => {
          setSelectedCourseEnrollment(null);
          setFormData(initialFormData);
          setIsEditCourseEnrollmentModalOpen(false);
        }}
      >
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
      </Modal>
      <Modal
        isModalOpen={isImportCourseModalOpen}
        title="Import Course"
        actionText="Import"
        onAction={() => {}}
        onCancel={() => setIsImportCourseModalOpen(false)}
      >
        <ol className="list-decimal list-inside mb-4">
          <li>
            Go to the{" "}
            <a
              href="https://sisprod.psft.ust.hk/psc/SISPROD/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSS_MY_CRSEHIST.GBL?Page=SSS_MY_CRSEHIST&Action=U"
              target="_blank"
              className="text-blue-500 hover:text-blue-700"
            >
              My Course History on HKUST SIS
            </a>
          </li>
          <li>
            &ldquo;Select All&rdquo; the page and copy, or press Ctrl+A and
            Ctrl+C
          </li>
          <li>Paste the copied text into the textbox below</li>
        </ol>
        <textarea
          className="border border-gray-300 px-4 py-2 w-full rounded-md"
          onPaste={(event) => {
            event.preventDefault();
            dispatch(handleImport(event.clipboardData.getData("text/plain")));
            setIsImportCourseModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default CoursePage;
