export interface SurveyResult {
  id: number;
  poll: string;
  candidate: string;
  age: string;
  gender: string;
  race: string;
  income: string;
  urbanity: string;
  education: string;
  weight: number;
}

export interface TargetWeights {
  age: { [key: string]: number };
  gender: { [key: string]: number };
  race: { [key: string]: number };
  income: { [key: string]: number };
  urbanity: { [key: string]: number };
  education: { [key: string]: number };
}

export interface IpfResultType {
  iterations: number;
  finalChange: number;
  l1Errors: number[];
}
