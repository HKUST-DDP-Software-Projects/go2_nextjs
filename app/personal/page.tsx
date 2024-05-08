"use client";

import { setPersonalDetails } from "@/redux/features/personalDetailsSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ADMISSION_YEARS = [
  {
    display: "2022-2023",
    value: "2022",
  },
];

const ENGINEERING_MAJORS = [
  {
    display: "Computer Science",
    value: "CO",
  },
];

const BUSINESS_MAJORS = [
  {
    display: "General Business Management",
    value: "GBM",
  },
];

export default function PersonalDetails() {
  const personalDetails = useAppSelector(
    (state) => state.personalDetailsReducer,
  );

  const dispatch = useAppDispatch();
  const router = useRouter();

  const [name, setName] = useState(personalDetails.name);
  const [studentId, setStudentId] = useState(personalDetails.studentId);
  const [admissionYear, setAdmissionYear] = useState(
    personalDetails.admissionYear,
  );
  const [engineeringMajor, setEngineeringMajor] = useState(
    personalDetails.engineeringMajor,
  );
  const [businessMajor, setBusinessMajor] = useState(
    personalDetails.businessMajor,
  );

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleStudentIdChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStudentId(event.target.value);
  };

  const handleAdmissionYearChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setAdmissionYear(event.target.value);
  };

  const handleEngineeringMajorChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setEngineeringMajor(event.target.value);
  };

  const handleBusinessMajorChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setBusinessMajor(event.target.value);
  };

  const handleSubmit = () => {
    dispatch(
      setPersonalDetails({
        name,
        studentId,
        admissionYear,
        engineeringMajor,
        businessMajor,
      }),
    );

    router.push("/course");
  };

  return (
    <div className="flex flex-col space-y-4 m-4">
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Name"
        className="border border-gray-300 rounded-md p-2"
      />
      <input
        type="text"
        value={studentId}
        onChange={handleStudentIdChange}
        placeholder="Student ID"
        className="border border-gray-300 rounded-md p-2"
      />
      <select
        value={admissionYear}
        onChange={handleAdmissionYearChange}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="">Select Admission Year</option>
        {ADMISSION_YEARS.map((year) => (
          <option key={year.value} value={year.value}>
            {year.display}
          </option>
        ))}
      </select>
      <select
        value={engineeringMajor}
        onChange={handleEngineeringMajorChange}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="">Select Engineering Major</option>
        {ENGINEERING_MAJORS.map((major) => (
          <option key={major.value} value={major.value}>
            {major.display}
          </option>
        ))}
      </select>
      <select
        value={businessMajor}
        onChange={handleBusinessMajorChange}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="">Select Business Major</option>
        {BUSINESS_MAJORS.map((major) => (
          <option key={major.value} value={major.value}>
            {major.display}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Save
      </button>
    </div>
  );
}
