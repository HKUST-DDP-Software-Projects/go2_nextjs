"use client";

import { setPersonalDetails } from "@/redux/features/personalDetailsSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONFIG } from "@/helpers/config";

const ADMISSION_YEARS = Object.keys(CONFIG.engineeringMajors).map((year) => ({
  // example: 2122 -> { display: "2021-2022", value: "2122" }
  display: `20${year.slice(0, 2)}-20${year.slice(2, 4)}`,
  value: year,
}));

const ENGINEERING_MAJORS = [
  {
    display: "Aerospace Engineering",
    value: "AE",
  },
  {
    display: "Bioengineering",
    value: "BE",
  },
  {
    display: "Chemical Engineering",
    value: "CE",
  },
  {
    display: "Civil Engineering",
    value: "CI",
  },
  {
    display: "Civil and Environmental Engineering",
    value: "CV",
  },
  {
    display: "Computer Engineering",
    value: "CP",
  },
  {
    display: "Computer Science",
    value: "CO",
  },
  {
    display: "Decision Analytics",
    value: "DA",
  },
  {
    display: "Electrical Engineering",
    value: "EE",
  },
  {
    display: "Industrial Engineering & Engineering Management",
    value: "IE",
  },
  {
    display: "Integrative Systems and Design",
    value: "ID",
  },
  {
    display: "Mechanical Engineering",
    value: "ME",
  },
  {
    display: "Biotechnology",
    value: "BT",
  },
];

const BUSINESS_MAJORS = [
  {
    display: "Economics",
    value: "ECON",
  },
  {
    display: "Finance",
    value: "FINA",
  },
  {
    display: "General Business Management",
    value: "GBM",
  },
  {
    display: "Global Business",
    value: "GBUS",
  },
  {
    display: "Management",
    value: "MGMT",
  },
  {
    display: "Marketing",
    value: "MARK",
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
  const [email, setEmail] = useState(personalDetails.email);
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
        email,
        admissionYear,
        engineeringMajor,
        businessMajor,
      }),
    );

    router.push("/course");
  };

  return (
    <div className="flex flex-col space-y-4 m-4">
      <h1 className="text-2xl font-bold">Personal Details</h1>

      <label className="block text-gray-700 font-medium">Name</label>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Name"
        className="border border-gray-300 rounded-md p-2"
      />

      <label className="block text-gray-700 font-medium">Student ID</label>
      <input
        type="text"
        value={studentId}
        onChange={handleStudentIdChange}
        placeholder="Student ID"
        className="border border-gray-300 rounded-md p-2"
      />

      <label className="block text-gray-700 font-medium">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border border-gray-300 rounded-md p-2"
      />

      <label className="block text-gray-700 font-medium">Admission Year</label>
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

      <label className="block text-gray-700 font-medium">
        Engineering Major
      </label>
      <select
        value={engineeringMajor}
        onChange={handleEngineeringMajorChange}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="">Select Engineering Major</option>
        {ENGINEERING_MAJORS.filter(
          (major) =>
            CONFIG.engineeringMajors?.[admissionYear] &&
            major.value in CONFIG.engineeringMajors[admissionYear],
        ).map((major) => (
          <option key={major.value} value={major.value}>
            {major.display}
          </option>
        ))}
      </select>

      <label className="block text-gray-700 font-medium">Business Major</label>
      <select
        value={businessMajor}
        onChange={handleBusinessMajorChange}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="">Select Business Major</option>
        {BUSINESS_MAJORS.filter(
          (major) =>
            CONFIG.businessMajors?.[admissionYear] &&
            major.value in CONFIG.businessMajors[admissionYear],
        ).map((major) => (
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
