"use client";

import { TimesheetEntry, TypeOfWork } from "../types/timesheet";
import { useEffect, useState } from "react";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: Omit<TimesheetEntry, "id">, id?: string) => void;
  readonly initialData?: TimesheetEntry | null;
  readonly date?: string;
  readonly timesheetRange?: { start: string; end: string };
}

const PROJECTS = [
  "Homepage Development",
  "API Development",
  "Mobile App",
  "Dashboard Redesign",
];

const TYPES_OF_WORK: TypeOfWork[] = [
  "Bug fixes",
  "Feature development",
  "Code review",
  "Testing",
  "Documentation",
];

export default function TimesheetModal({
  open,
  onClose,
  onSave,
  initialData,
  date,
  timesheetRange,
}: Props) {
  const [project, setProject] = useState(initialData?.project ?? "");
  const [typeOfWork, setTypeOfWork] = useState<TypeOfWork>(
    initialData?.typeOfWork ?? "Bug fixes",
  );
  const [taskDescription, setTaskDescription] = useState(
    initialData?.taskDescription ?? "",
  );
  const [hours, setHours] = useState(initialData?.hours ?? 4);
  const [entryDate, setEntryDate] = useState(
    initialData?.date ?? date ?? new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setProject(initialData.project);
      setTypeOfWork(initialData.typeOfWork);
      setTaskDescription(initialData.taskDescription);
      setHours(initialData.hours);
      setEntryDate(initialData.date);
    } else {
      setProject("");
      setTypeOfWork("Bug fixes");
      setTaskDescription("");
      setHours(4);
      setEntryDate(date ?? new Date().toISOString().split("T")[0]);
    }
    setError("");
  }, [open, initialData, date]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!project || !taskDescription || hours <= 0) {
      setError("Please fill in all required fields");
      return;
    }

    if (timesheetRange) {
      const entry = new Date(entryDate);
      const start = new Date(timesheetRange.start);
      const end = new Date(timesheetRange.end);

      if (entry < start || entry > end) {
        setError(
          `Date must be between ${timesheetRange.start} and ${timesheetRange.end}`,
        );
        return;
      }
    }

    onSave(
      {
        project,
        typeOfWork,
        taskDescription,
        hours,
        date: entryDate,
      },
      initialData?.id,
    );
  };

  const incrementHours = () => setHours((prev) => prev + 1);
  const decrementHours = () => setHours((prev) => Math.max(1, prev - 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          {initialData ? "Edit Entry" : "Add New Entry"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Select Project */}
          <div>
            <label
              htmlFor="project-select"
              className="mb-2 flex items-center text-sm font-medium text-gray-700"
            >
              Select Project
              <span className="ml-1 text-red-500">*</span>
              <svg
                className="ml-1 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </label>
            <select
              id="project-select"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">Select a project</option>
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Type of Work */}
          <div>
            <label
              htmlFor="work-type-select"
              className="mb-2 flex items-center text-sm font-medium text-gray-700"
            >
              Type of Work
              <span className="ml-1 text-red-500">*</span>
              <svg
                className="ml-1 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </label>
            <select
              id="work-type-select"
              value={typeOfWork}
              onChange={(e) => setTypeOfWork(e.target.value as TypeOfWork)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            >
              {TYPES_OF_WORK.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Task Description */}
          <div>
            <label
              htmlFor="task-description"
              className="mb-2 flex items-center text-sm font-medium text-gray-700"
            >
              Task description
              <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              id="task-description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Write task description here..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
            <p className="mt-1 text-xs text-gray-500">A note for extra info</p>
          </div>

          {/* Hours */}
          <div>
            <label
              htmlFor="hours-input"
              className="mb-2 flex items-center text-sm font-medium text-gray-700"
            >
              Hours
              <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={decrementHours}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                disabled={hours <= 1}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <input
                id="hours-input"
                type="number"
                value={hours}
                onChange={(e) => setHours(Math.max(1, Number(e.target.value)))}
                min="1"
                max="24"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
              <button
                type="button"
                onClick={incrementHours}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Date (hidden if pre-filled) */}
          {!date && (
            <div>
              <label
                htmlFor="entry-date"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Date
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                id="entry-date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                min={timesheetRange?.start}
                max={timesheetRange?.end}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {initialData ? "Update entry" : "Add entry"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
