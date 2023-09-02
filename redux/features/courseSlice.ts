import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import rawCourses from "@/helpers/courses_1920.json";

export type CourseDetail = {
  code: string;
  title: string;
  units: number;
};

export enum CourseStatus {
  TAKEN = "Taken",
  TRANSFERRED = "Transferred",
  IN_PROGRESS = "In Progress",
  PLANNED = "Planned",
}

export type CourseEnrollment = {
  term: string;
  grade: string;
  status: CourseStatus;
} & CourseDetail;

export type CourseState = {
  courseHistory: CourseEnrollment[];
  courseCatalog: Record<string, CourseDetail>;
};

const initialState = {
  courseHistory: [
    {
      code: "ACCT 2010",
      title: "Principles of Accounting I",
      term: "2020-21 Fall",
      grade: "A-",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "ACCT 2200",
      title: "Principles of Accounting II",
      term: "2022-23 Spring",
      grade: "A+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 1021",
      title: "Intro to Computer Science",
      term: "2019-20 Fall",
      grade: "A+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 1991",
      title: "Industrial Experience",
      term: "2021-22 Summer",
      grade: "P",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "COMP 2012H",
      title: "OOP & Data Structures (H)",
      term: "2020-21 Fall",
      grade: "A+",
      units: 5.0,
      status: "Taken",
    },
    {
      code: "COMP 2211",
      title: "Exploring AI",
      term: "2021-22 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 2611",
      title: "Computer Organization",
      term: "2020-21 Spring",
      grade: "A",
      units: 4.0,
      status: "Taken",
    },
    {
      code: "COMP 2711",
      title: "Discrete Math Tools",
      term: "2019-20 Fall",
      grade: "P",
      units: 4.0,
      status: "Taken",
    },
    {
      code: "COMP 3021",
      title: "Java Programming",
      term: "2021-22 Fall",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 3111H",
      title: "Hons Software Eng",
      term: "2021-22 Fall",
      grade: "A+",
      units: 4.0,
      status: "Taken",
    },
    {
      code: "COMP 3511",
      title: "Operating Systems",
      term: "2021-22 Spring",
      grade: "A-",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 3632",
      title: "Principles of Cybersecurity",
      term: "2021-22 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 3711",
      title: "Design & Analy. of Algori",
      term: "2021-22 Spring",
      grade: "B+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 4211",
      title: "Machine Learning",
      term: "2022-23 Fall",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 4332",
      title: "Big Data Mining & Management",
      term: "2022-23 Spring",
      grade: "A+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 4900",
      title: "Academic & Prof Dev",
      term: "2020-21 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "COMP 4900",
      title: "Academic & Prof Dev",
      term: "2020-21 Spring",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "COMP 4900",
      title: "Academic & Prof Dev",
      term: "2021-22 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "COMP 4900",
      title: "Academic & Prof Dev",
      term: "2021-22 Spring",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "COMP 4900",
      title: "Academic & Prof Dev",
      term: "2022-23 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "COMP 4900",
      title: "Academic & Prof Dev",
      term: "2022-23 Spring",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "COMP 4901W",
      title: "BCSC",
      term: "2021-22 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "COMP 4981",
      title: "Final Year Project",
      term: "2021-22 Summer",
      grade: "PP",
      units: 6.0,
      status: "Taken",
    },
    {
      code: "COMP 4981",
      title: "Final Year Project",
      term: "2022-23 Fall",
      grade: "PP",
      units: 6.0,
      status: "Taken",
    },
    {
      code: "COMP 4981",
      title: "Final Year Project",
      term: "2022-23 Spring",
      grade: "A",
      units: 6.0,
      status: "Taken",
    },
    {
      code: "ECON 2103",
      title: "Principles of Microeconomics",
      term: "2020-21 Fall",
      grade: "A+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "ECON 2123",
      title: "Macroeconomics",
      term: "2020-21 Spring",
      grade: "A+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "ECON 3014",
      title: "Managerial Microeconomics",
      term: "2021-22 Fall",
      grade: "A-",
      units: 4.0,
      status: "Taken",
    },
    {
      code: "ECON 3334",
      title: "Intro to Econometrics",
      term: "2021-22 Fall",
      grade: "A",
      units: 4.0,
      status: "Taken",
    },
    {
      code: "ELEC 1100",
      title: "Electro-Robot Design",
      term: "2019-20 Spring",
      grade: "A+",
      units: 4.0,
      status: "Taken",
    },
    {
      code: "ENGG 1010",
      title: "Academic Orientation",
      term: "2019-20 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "ENGG 1010",
      title: "Academic Orientation",
      term: "2019-20 Spring",
      grade: "P",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "ENGG 2010",
      title: "Engineering Seminar Series",
      term: "2020-21 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "ENGG 2010",
      title: "Engineering Seminar Series",
      term: "2020-21 Spring",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "ENGG 2010",
      title: "Engineering Seminar Series",
      term: "2021-22 Fall",
      grade: "P",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "FINA 2303",
      title: "Financial Management",
      term: "2021-22 Fall",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "FINA 3103",
      title: "Intermediate Investments",
      term: "2021-22 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "FINA 3203",
      title: "Derivative Securities",
      term: "2022-23 Fall",
      grade: "B+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "HLTH 1010",
      title: "Healthy Lifestyle",
      term: "2019-20 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "HLTH 1010",
      title: "Healthy Lifestyle",
      term: "2019-20 Spring",
      grade: "P",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "HUMA 2010",
      title: "Metaphors in English & Chinese",
      term: "2022-23 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "IEDA 2010",
      title: "IE & Decision Analytics",
      term: "2020-21 Fall",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "ISOM 2600",
      title: "Intro to BA",
      term: "2021-22 Spring",
      grade: "A",
      units: 1.0,
      status: "Taken",
    },
    {
      code: "ISOM 2700",
      title: "Operations Management",
      term: "2020-21 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "LABU 2060",
      title: "Effective Bus Com",
      term: "2020-21 Spring",
      grade: "A-",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "LANG 1002A",
      title: "Eng for Univ Studies I",
      term: "2019-20 Fall",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "LANG 1003A",
      title: "Eng for Univ Studies II",
      term: "2019-20 Spring",
      grade: "A-",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "LANG 2030",
      title: "Tech Com I",
      term: "2020-21 Fall",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "LANG 4030",
      title: "Tech Comm II for CSE,CPEGDSCT",
      term: "2022-23 Fall",
      grade: "A-",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "MARK 2120",
      title: "Marketing Management",
      term: "2021-22 Fall",
      grade: "B+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "MATH 1013",
      title: "Calculus IB",
      term: "2019-20 Fall",
      grade: "A-",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "MATH 1014",
      title: "Calculus II",
      term: "2019-20 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "MATH 2111",
      title: "Matrix Algebra & Applications",
      term: "2020-21 Fall",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "MATH 2411",
      title: "Applied Statistics",
      term: "2020-21 Spring",
      grade: "A",
      units: 4.0,
      status: "Taken",
    },
    {
      code: "MGMT 1130",
      title: "Traps and Pitfalls",
      term: "2022-23 Fall",
      grade: "B+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "MGMT 2010",
      title: "Business Ethics and Individual",
      term: "2021-22 Fall",
      grade: "A-",
      units: 2.0,
      status: "Taken",
    },
    {
      code: "PHYS 1002",
      title: "Intro Astrophy Astronomy",
      term: "2019-20 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "PHYS 1003",
      title: "Energy & Rel Environ Issu",
      term: "2019-20 Spring",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "PHYS 1112",
      title: "Gen Phys I Calculus",
      term: "2019-20 Fall",
      grade: "A+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "RMBI 1020",
      title: "BI in Contemporary Society",
      term: "2022-23 Spring",
      grade: "A+",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "TEMG 1010",
      title: "TECH & MGMT Prof Activiti",
      term: "2020-21 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "TEMG 1010",
      title: "TECH & MGMT Prof Activiti",
      term: "2020-21 Spring",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "TEMG 1010",
      title: "TECH & MGMT Prof Activiti",
      term: "2021-22 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "TEMG 1010",
      title: "TECH & MGMT Prof Activiti",
      term: "2021-22 Spring",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "TEMG 1010",
      title: "TM Professional Activities",
      term: "2022-23 Fall",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "TEMG 1010",
      title: "TM Professional Activities",
      term: "2022-23 Spring",
      grade: "PP",
      units: 0.0,
      status: "Taken",
    },
    {
      code: "TEMG 3950",
      title: "Case-based Problem Solving",
      term: "2020-21 Fall",
      grade: "A",
      units: 2.0,
      status: "Taken",
    },
    {
      code: "TEMG 4950K",
      title: "Google & Open Data for PCCW",
      term: "2022-23 Spring",
      grade: "A+",
      units: 4.0,
      status: "Taken",
    },
    {
      code: "TEMG 4952A",
      title: "UBSZurich-Investment Prototype",
      term: "2020-21 Winter",
      grade: "A",
      units: 3.0,
      status: "Taken",
    },
    {
      code: "TEMG 4952B",
      title: "ML & Credit Rating Prediction",
      term: "2020-21 Summer",
      grade: "A+",
      units: 3.0,
      status: "Taken",
    },
  ],
  courseCatalog: Object.fromEntries(
    rawCourses.map((course) => [
      course.code,
      {
        code: course.code,
        title: course.title,
        units: parseInt(course.credits),
      },
    ]),
  ),
} as CourseState;

export const course = createSlice({
  name: "course",
  initialState,
  reducers: {
    reset: () => initialState,
    mergeCourseCatalog: (state, action: PayloadAction<CourseEnrollment[]>) => {
      // add missing course to courseCatalog
      action.payload.forEach((course) => {
        if (!(course.code in state.courseCatalog)) {
          state.courseCatalog[course.code] = {
            code: course.code,
            title: course.title,
            units: course.units,
          };
        }
      });
    },
    addCourseEnrollment: (state, action: PayloadAction<CourseEnrollment>) => {
      state.courseHistory.push(action.payload);
    },
    editCourseEnrollment: (
      state,
      action: PayloadAction<[CourseEnrollment, CourseEnrollment]>,
    ) => {
      const [oldCourseEnrollment, newCourseEnrollment] = action.payload;
      const index = state.courseHistory.findIndex(
        (courseEnrollment) =>
          courseEnrollment.code === oldCourseEnrollment.code &&
          courseEnrollment.term === oldCourseEnrollment.term,
      );
      state.courseHistory[index] = newCourseEnrollment;
    },
    removeCourseEnrollment: (
      state,
      action: PayloadAction<CourseEnrollment>,
    ) => {
      const index = state.courseHistory.findIndex(
        (courseEnrollment) =>
          courseEnrollment.code === action.payload.code &&
          courseEnrollment.term === action.payload.term,
      );
      state.courseHistory.splice(index, 1);
    },
  },
});

export const {
  reset,
  addCourseEnrollment,
  editCourseEnrollment,
  removeCourseEnrollment,
} = course.actions;
export default course.reducer;
