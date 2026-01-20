export type TimesheetStatus = "COMPLETED" | "INCOMPLETE" | "MISSING";

export type TypeOfWork =
  | "Bug fixes"
  | "Feature development"
  | "Code review"
  | "Testing"
  | "Documentation";

export interface TimesheetEntry {
  id: string;
  project: string;
  typeOfWork: TypeOfWork;
  taskDescription: string;
  hours: number;
  date: string;
}

export interface Timesheet {
  id: string;
  week: number;
  startDate: string;
  endDate: string;
  status: TimesheetStatus;
  entries: TimesheetEntry[];
}
