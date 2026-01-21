"use client";

import { useEffect, useState, useCallback } from "react";
import { Timesheet, TimesheetEntry } from "../types/timesheet";
import TimesheetTable from "../components/TimeSheetTable";
import TimesheetListView from "../components/TimeSheetListView";
import TimesheetModal from "../components/TimeSheetModal";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

type ViewMode = "table" | "list";

export default function DashboardPage() {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(
    null,
  );
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(
    null,
  );
  const [currentWeekTimesheet, setCurrentWeekTimesheet] =
    useState<Timesheet | null>(null);

  const resolveCurrentWeekTimesheet = (
    sheets: Timesheet[],
    selected: Timesheet | null,
  ) => {
    if (selected) {
      return sheets.find((t) => t.id === selected.id) || sheets[0] || null;
    }

    const today = new Date();
    return (
      sheets.find((t) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return today >= start && today <= end;
      }) ||
      sheets[0] ||
      null
    );
  };

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [modalDate, setModalDate] = useState<string | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTimesheets = useCallback(async () => {
    const res = await fetch("/api/timesheets");
    const data = await res.json();

    setTimesheets(data);
    setCurrentWeekTimesheet(
      resolveCurrentWeekTimesheet(data, selectedTimesheet),
    );
  }, [selectedTimesheet]);

  useEffect(() => {
    void fetchTimesheets();
  }, [fetchTimesheets]);

  useEffect(() => {
    setCurrentWeekTimesheet(
      resolveCurrentWeekTimesheet(timesheets, selectedTimesheet),
    );
  }, [timesheets, selectedTimesheet]);

  const calculateStatus = (
    entries: TimesheetEntry[],
  ): "COMPLETED" | "INCOMPLETE" | "MISSING" => {
    if (entries.length === 0) return "MISSING";
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    return totalHours >= 40 ? "COMPLETED" : "INCOMPLETE";
  };

  const handleSaveEntry = async (
    data: Omit<TimesheetEntry, "id">,
    entryId?: string,
  ) => {
    if (isUpdating) return;
    setIsUpdating(true);

    let timesheetId = selectedTimesheet?.id;
    if (!timesheetId) {
      const entryDate = new Date(data.date);
      const matchingTimesheet = timesheets.find((t) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return entryDate >= start && entryDate <= end;
      });
      timesheetId = matchingTimesheet?.id || timesheets[0]?.id;
    }

    if (!timesheetId) {
      console.error("No timesheet found for this entry");
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timesheetId,
          entryId: entryId || `new-${Date.now()}`,
          ...data,
        }),
      });

      fetchTimesheets();

      if (!response.ok) {
        const error = await response.json();
        console.error("Error saving entry:", error);
        alert(error.error || "Failed to save entry");
        // await fetchTimesheets();
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("An error occurred while saving the entry");
      // await fetchTimesheets();
    } finally {
      setIsUpdating(false);
      setModalOpen(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);

    const timesheetId = selectedTimesheet?.id || currentWeekTimesheet?.id;
    if (!timesheetId) {
      setIsUpdating(false);
      return;
    }

    try {
      setTimesheets((prevTimesheets) =>
        prevTimesheets.map((ts) => {
          if (ts.id === timesheetId) {
            const updatedEntries = ts.entries.filter((e) => e.id !== entryId);
            return {
              ...ts,
              entries: updatedEntries,
              status: calculateStatus(updatedEntries),
            };
          }
          return ts;
        }),
      );

      const response = await fetch(
        `/api/timesheets?entryId=${entryId}&timesheetId=${timesheetId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Error deleting entry:", error);
        alert(error.error || "Failed to delete entry");
        await fetchTimesheets();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("An error occurred while deleting the entry");
      await fetchTimesheets();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddEntry = (date: string) => {
    const entryDate = new Date(date);
    const matchingTimesheet = timesheets.find((t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return entryDate >= start && entryDate <= end;
    });

    if (matchingTimesheet) {
      setSelectedTimesheet(matchingTimesheet);
    }

    setSelectedEntry(null);
    setModalDate(date);
    setModalOpen(true);
  };

  const handleEditEntry = (entry: TimesheetEntry) => {
    const containingTimesheet = timesheets.find((ts) =>
      ts.entries.some((e) => e.id === entry.id),
    );

    if (containingTimesheet) {
      setSelectedTimesheet(containingTimesheet);
    }

    setSelectedEntry(entry);
    setModalDate(undefined);
    setModalOpen(true);
  };

  const handleTableAction = (timesheet: Timesheet, action: string) => {
    setSelectedTimesheet(timesheet);
    if (action === "view" || action === "create" || action === "edit") {
      setViewMode("list");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">
            {viewMode === "table" ? "Table View" : "List View"}
          </h1>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold text-gray-900">ticktock</div>
            <nav className="flex gap-6">
              <button className="border-b-2 border-blue-600 pb-1 font-medium text-blue-600">
                Timesheets
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {session?.user?.name || "John Doe"}
              </span>
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Timesheets
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {viewMode === "table" ? (
          <TimesheetTable
            data={timesheets}
            onEdit={(item) => handleTableAction(item, "edit")}
            onView={(item) => handleTableAction(item, "view")}
            onCreate={(item) => handleTableAction(item, "create")}
          />
        ) : (
          currentWeekTimesheet && (
            <TimesheetListView
              timesheet={currentWeekTimesheet}
              onAddEntry={handleAddEntry}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          )
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          © 2024 tentwenty. All rights reserved.
        </div>
      </div>

      <TimesheetModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEntry(null);
          setModalDate(undefined);
        }}
        onSave={handleSaveEntry}
        initialData={selectedEntry}
        date={modalDate}
        timesheetRange={
          selectedTimesheet
            ? {
                start: selectedTimesheet.startDate,
                end: selectedTimesheet.endDate,
              }
            : undefined
        }
      />
    </div>
  );
}
