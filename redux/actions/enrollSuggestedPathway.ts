import suggestedPathways from "@/helpers/suggested_pathways.json";
import {
  checkPrerequisiteGroup,
  checkExclusionGroup,
  CourseValidationResult,
} from "@/helpers/course";
import {
  addCourse,
  addSuggestedAutoAddedCode,
  addSuggestedUnmetPrereq,
  addSuggestedExcluded,
} from "@/redux/features/preenrollmentSlice";

export const enrollSuggestedPathway = (admitYear: string, major: string) => {
  return (dispatch: any, getState: any) => {
    const state = getState();
    const raw = suggestedPathways as any;

    console.log("[enrollSuggestedPathway] start", { admitYear, major });

    // Build a normalized map: years -> majors -> array-of-course-codes
    const yearsMap: Record<string, Record<string, any>> = {};

    // If the JSON uses grouped engineeringMajors/businessMajors
    if (raw.engineeringMajors || raw.businessMajors) {
      const groups = [raw.engineeringMajors || {}, raw.businessMajors || {}];
      groups.forEach((group: any) => {
        Object.keys(group).forEach((year) => {
          yearsMap[year] = yearsMap[year] || {};
          Object.keys(group[year] || {}).forEach((m: string) => {
            yearsMap[year][m] = group[year][m];
          });
        });
      });
    } else {
      // assume top-level keys are years
      Object.keys(raw).forEach((year) => (yearsMap[year] = raw[year]));
    }

    const pathwayYears = yearsMap[admitYear];
    if (!pathwayYears) {
      console.log("[enrollSuggestedPathway] no pathwayYears for admitYear", admitYear);
      return { added: [], unmet: [] };
    }

    const majorPathwayRaw = pathwayYears[major];
    if (!majorPathwayRaw) {
      console.log("[enrollSuggestedPathway] no majorPathwayRaw for major", major, "in year", admitYear);
      return { added: [], unmet: [] };
    }

    // helper to extract course codes from several possible shapes
    const extractCourseCodes = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) {
        // array of strings
        if (val.every((v) => typeof v === "string")) return val as string[];
        // array of objects like { term: '', courses: [...] }
        const codes: string[] = [];
        val.forEach((item) => {
          if (typeof item === "string") codes.push(item);
          else if (item && Array.isArray(item.courses)) codes.push(...item.courses);
          else if (item && typeof item === "object") {
            // nested object: collect any string values or arrays
            Object.values(item).forEach((v: any) => {
              if (typeof v === "string") codes.push(v);
              else if (Array.isArray(v)) codes.push(...v.filter((x) => typeof x === "string"));
            });
          }
        });
        return Array.from(new Set(codes));
      }
      if (typeof val === "object") {
        // object mapping -> flatten
        return Array.from(
          new Set(
            Object.values(val).flatMap((v: any) => extractCourseCodes(v)),
          ),
        );
      }
      return [];
    };

    const majorPathway = extractCourseCodes(majorPathwayRaw);
    console.log("[enrollSuggestedPathway] majorPathwayRaw:", majorPathwayRaw);
    console.log("[enrollSuggestedPathway] extracted majorPathway:", majorPathway);
    if (!majorPathway || majorPathway.length === 0) {
      console.log("[enrollSuggestedPathway] no courses extracted for", major, admitYear);
      return { added: [], unmet: [] };
    }

    const takenCodes: string[] = (state.courseReducer?.courseHistoryString as string[]) || [];
    const cartCodes: string[] = (state.preenrollmentReducer?.shoppingCart || []).map(
      (c: any) => c.code,
    );

    // use catalog to get course details
    const catalog: Record<string, any> = state.courseReducer?.courseCatalog || {};

    const selectedCodes = Array.from(new Set([...takenCodes, ...cartCodes]));

    const added: string[] = [];
    const unmet: { code: string; reason: string }[] = [];

    // majorPathway is now an array of course codes
    majorPathway.forEach((courseCode: string) => {
        if (takenCodes.includes(courseCode)) {
          console.log(`[enrollSuggestedPathway] skipping ${courseCode} - already taken`);
          return; // already taken
        }
        if (cartCodes.includes(courseCode)) {
          console.log(`[enrollSuggestedPathway] skipping ${courseCode} - already in cart`);
          return; // already in cart
        }

        const courseDetail = catalog[courseCode];
        if (!courseDetail) return; // unknown course

        const prereqStatus = checkPrerequisiteGroup(courseDetail, selectedCodes);
        const exclusionStatus = checkExclusionGroup(courseDetail, selectedCodes);
        console.log(`[enrollSuggestedPathway] evaluate ${courseCode}`, { prereqStatus, exclusionStatus, selectedCodesCount: selectedCodes.length });

        // Decision logic:
        // - If prerequisite UNSATISFIED -> do NOT add to cart; record as suggested unmet
        // - If exclusion UNSATISFIED -> do NOT add to cart; record as suggested excluded
        // - If NEED_MANUAL_CHECK for either -> add to cart AND record the issue

        if (prereqStatus === CourseValidationResult.UNSATISFIED) {
          const reason = `Prerequisite: ${prereqStatus}`;
          dispatch(addSuggestedUnmetPrereq({ code: courseCode, reason }));
          unmet.push({ code: courseCode, reason });
          return;
        }

        if (exclusionStatus === CourseValidationResult.UNSATISFIED) {
          const reason = `Exclusion: ${exclusionStatus}`;
          dispatch(addSuggestedExcluded({ code: courseCode, reason }));
          unmet.push({ code: courseCode, reason });
          return;
        }

        // Otherwise add to cart
        dispatch(addCourse(courseDetail));
        dispatch(addSuggestedAutoAddedCode(courseCode));
        added.push(courseCode);

        if (prereqStatus === CourseValidationResult.NEED_MANUAL_CHECK) {
          const reason = `Prerequisite: ${prereqStatus}`;
          dispatch(addSuggestedUnmetPrereq({ code: courseCode, reason }));
          unmet.push({ code: courseCode, reason });
        }

        if (exclusionStatus === CourseValidationResult.NEED_MANUAL_CHECK) {
          const reason = `Exclusion: ${exclusionStatus}`;
          dispatch(addSuggestedExcluded({ code: courseCode, reason }));
          unmet.push({ code: courseCode, reason });
        }
    });

    return { added, unmet };
  };
};
