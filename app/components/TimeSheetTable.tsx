"use client";

import { Timesheet, TimesheetStatus } from "../types/timesheet";
import { useState, useMemo } from "react";

interface Props {
  readonly data: Timesheet[];
  readonly onEdit: (timesheet: Timesheet) => void;
  readonly onView: (timesheet: Timesheet) => void;
  readonly onCreate: (timesheet: Timesheet) => void;
}

const STATUS_COLORS: Record<TimesheetStatus, string> = {
  COMPLETED: "bg-green-100 text-green-800",
  INCOMPLETE: "bg-yellow-100 text-yellow-800",
  MISSING: "bg-red-100 text-red-800",
};

export default function TimesheetTable({
  data,
  onEdit,
  onView,
  onCreate,
}: Props) {
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<"week" | "date">("week");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (dateRangeFilter) {
      filtered = filtered.filter((item) => {
        const [start, end] = dateRangeFilter.split(" to ");
        return item.startDate >= start && item.endDate <= (end || start);
      });
    }

    filtered.sort((a, b) => {
      if (sortColumn === "week") {
        return sortDirection === "asc" ? a.week - b.week : b.week - a.week;
      } else {
        return sortDirection === "asc"
          ? a.startDate.localeCompare(b.startDate)
          : b.startDate.localeCompare(a.startDate);
      }
    });

    return filtered;
  }, [data, statusFilter, dateRangeFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (column: "week" | "date") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleString("default", { month: "long" });
    const year = start.getFullYear();
    return `${startDay} - ${endDay} ${month}, ${year}`;
  };

  const getActionLabel = (status: TimesheetStatus) => {
    switch (status) {
      case "COMPLETED":
      case "INCOMPLETE":
        return "View";
      case "MISSING":
        return "Create";
      default:
        return "View";
    }
  };

  const handleAction = (timesheet: Timesheet) => {
    if (timesheet.status === "MISSING") {
      onCreate(timesheet);
    } else if (timesheet.status === "INCOMPLETE") {
      onEdit(timesheet);
    } else {
      onView(timesheet);
    }
  };

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="flex gap-4 border-b border-gray-200 p-4">
        <div className="flex-1">
          <label
            htmlFor="status-filter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TimesheetStatus | "")
            }
            className="w-[25%] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All</option>
            <option value="COMPLETED">Completed</option>
            <option value="INCOMPLETE">Incomplete</option>
            <option value="MISSING">Missing</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                <button
                  onClick={() => handleSort("week")}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  WEEK #
                  <svg
                    className={`h-4 w-4 ${
                      sortColumn === "week" ? "text-blue-600" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  DATE
                  <svg
                    className={`h-4 w-4 ${
                      sortColumn === "date" ? "text-blue-600" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No timesheets found
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {item.week}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {formatDateRange(item.startDate, item.endDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleAction(item)}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {getActionLabel(item.status)}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
            const page = i + 1;
            if (totalPages > 8 && page === 8) {
              return (
                <span key="ellipsis" className="px-2 text-sm text-gray-500">
                  ...
                </span>
              );
            }
            if (totalPages > 8 && page < 8) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            }
            return null;
          })}

          {totalPages > 8 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                currentPage === totalPages
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
