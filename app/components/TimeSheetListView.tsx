"use client";

import { Timesheet, TimesheetEntry } from "../types/timesheet";
import { useState, useMemo } from "react";

interface Props {
  readonly timesheet: Timesheet;
  readonly onAddEntry: (date: string) => void;
  readonly onEditEntry: (entry: TimesheetEntry) => void;
  readonly onDeleteEntry: (entryId: string) => void;
}

export default function TimesheetListView({
  timesheet,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}: Props) {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getWeekDays = () => {
    const start = new Date(timesheet.startDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const entriesByDate = useMemo(() => {
    const grouped: Record<string, TimesheetEntry[]> = {};
    weekDays.forEach((day) => {
      grouped[day] = timesheet.entries.filter((entry) => entry.date === day);
    });
    return grouped;
  }, [timesheet.entries, weekDays]);

  const totalHours = useMemo(() => {
    return timesheet.entries.reduce((sum, entry) => sum + entry.hours, 0);
  }, [timesheet.entries]);

  const targetHours = 40;
  const progressPercentage = Math.min((totalHours / targetHours) * 100, 100);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            This week&apos;s timesheet
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {formatDate(timesheet.startDate)} - {formatDate(timesheet.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {totalHours}/{targetHours} hrs
            </p>
            <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Daily Entries */}
      <div className="space-y-6">
        {weekDays.map((day) => {
          const entries = entriesByDate[day] || [];
          const dayTotal = entries.reduce((sum, e) => sum + e.hours, 0);

          return (
            <div key={day} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{formatDate(day)}</h3>
                {dayTotal > 0 && (
                  <span className="text-sm text-gray-500">{dayTotal} hrs</span>
                )}
              </div>

              {/* Entries for this day */}
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{entry.project}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <span>{entry.hours} hrs</span>
                      <span>•</span>
                      <span>{entry.typeOfWork}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {entry.taskDescription}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowMenu(showMenu === entry.id ? null : entry.id)
                      }
                      className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
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
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    {showMenu === entry.id && (
                      <div className="absolute right-0 top-8 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-lg">
                        <button
                          onClick={() => {
                            onEditEntry(entry);
                            setShowMenu(null);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDeleteEntry(entry.id);
                            setShowMenu(null);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Task Button */}
              <button
                onClick={() => onAddEntry(day)}
                className="w-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600 transition hover:border-blue-400 hover:bg-blue-100"
              >
                + Add new task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
