import rawConfig from "./config.json";

type PreEnrollableCourseConfig = Record<string, Record<string, string[]>>;
type AdmissionYear = string;
type EngineeringMajor = string;
type BusinessMajor = string;

export const CONFIG = rawConfig as unknown as {
  qualtricsSurveyID: string;
  qualtricsBaseURL: string;
  qualtricsAPIToken: string;
  googleFormUrl: string;
  engineeringMajors: Record<
    AdmissionYear,
    Record<EngineeringMajor, PreEnrollableCourseConfig>
  >;
  businessMajors: Record<
    AdmissionYear,
    Record<BusinessMajor, PreEnrollableCourseConfig>
  >;
};
