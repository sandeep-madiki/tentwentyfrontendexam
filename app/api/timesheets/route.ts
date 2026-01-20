import { Timesheet, TimesheetEntry } from "../../types/timesheet";

function calculateStatus(
  entries: TimesheetEntry[],
): "COMPLETED" | "INCOMPLETE" | "MISSING" {
  if (entries.length === 0) {
    return "MISSING";
  }
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  if (totalHours >= 40) {
    return "COMPLETED";
  }
  return "INCOMPLETE";
}

const timesheets: Timesheet[] = [
  {
    id: "1",
    week: 1,
    startDate: "2024-01-01",
    endDate: "2024-01-05",
    status: "COMPLETED",
    entries: [
      {
        id: "e1",
        project: "Homepage Development",
        typeOfWork: "Feature development",
        taskDescription: "Implemented responsive navigation",
        hours: 4,
        date: "2024-01-01",
      },
      {
        id: "e2",
        project: "Homepage Development",
        typeOfWork: "Feature development",
        taskDescription: "Added hero section",
        hours: 4,
        date: "2024-01-01",
      },
    ],
  },
  {
    id: "2",
    week: 2,
    startDate: "2024-01-08",
    endDate: "2024-01-12",
    status: "COMPLETED",
    entries: [],
  },
  {
    id: "3",
    week: 3,
    startDate: "2024-01-15",
    endDate: "2024-01-19",
    status: "INCOMPLETE",
    entries: [
      {
        id: "e3",
        project: "Homepage Development",
        typeOfWork: "Bug fixes",
        taskDescription: "Fixed mobile menu issue",
        hours: 2,
        date: "2024-01-15",
      },
    ],
  },
  {
    id: "4",
    week: 4,
    startDate: "2024-01-22",
    endDate: "2024-01-26",
    status: "COMPLETED",
    entries: [],
  },
  {
    id: "5",
    week: 5,
    startDate: "2024-01-29",
    endDate: "2024-02-02",
    status: "MISSING",
    entries: [],
  },
];

export async function GET() {
  return Response.json(timesheets);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.entryId) {
    const timesheet = timesheets.find((t) => t.id === body.timesheetId);
    if (!timesheet) {
      return Response.json({ error: "Timesheet not found" }, { status: 404 });
    }

    const entryDate = new Date(body.date);
    const startDate = new Date(timesheet.startDate);
    const endDate = new Date(timesheet.endDate);

    if (entryDate < startDate || entryDate > endDate) {
      return Response.json(
        { error: "Date must be within timesheet range" },
        { status: 400 },
      );
    }

    if (body.entryId.startsWith("new")) {
      const newEntry: TimesheetEntry = {
        id: crypto.randomUUID(),
        project: body.project,
        typeOfWork: body.typeOfWork,
        taskDescription: body.taskDescription,
        hours: body.hours,
        date: body.date,
      };
      timesheet.entries.push(newEntry);

      timesheet.status = calculateStatus(timesheet.entries);

      return Response.json(newEntry);
    } else {
      const entryIndex = timesheet.entries.findIndex(
        (e) => e.id === body.entryId,
      );
      if (entryIndex === -1) {
        return Response.json({ error: "Entry not found" }, { status: 404 });
      }

      const newDate = new Date(body.date);
      if (newDate < startDate || newDate > endDate) {
        return Response.json(
          { error: "Date must be within timesheet range" },
          { status: 400 },
        );
      }

      timesheet.entries[entryIndex] = {
        ...timesheet.entries[entryIndex],
        project: body.project,
        typeOfWork: body.typeOfWork,
        taskDescription: body.taskDescription,
        hours: body.hours,
        date: body.date,
      };

      timesheet.status = calculateStatus(timesheet.entries);

      return Response.json(timesheet.entries[entryIndex]);
    }
  } else {
    const newTimesheet: Timesheet = {
      id: crypto.randomUUID(),
      week: body.week,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status || "MISSING",
      entries: [],
    };
    timesheets.push(newTimesheet);
    return Response.json(newTimesheet);
  }
}

export async function PUT(req: Request) {
  const body = await req.json();

  if (body.entryId) {
    const timesheet = timesheets.find((t) => t.id === body.timesheetId);
    if (!timesheet) {
      return Response.json({ error: "Timesheet not found" }, { status: 404 });
    }

    const entryIndex = timesheet.entries.findIndex(
      (e) => e.id === body.entryId,
    );
    if (entryIndex === -1) {
      return Response.json({ error: "Entry not found" }, { status: 404 });
    }

    timesheet.entries[entryIndex] = {
      ...timesheet.entries[entryIndex],
      ...body,
    };
    return Response.json(timesheet.entries[entryIndex]);
  } else {
    const index = timesheets.findIndex((t) => t.id === body.id);
    if (index === -1) {
      return Response.json({ error: "Timesheet not found" }, { status: 404 });
    }
    timesheets[index] = { ...timesheets[index], ...body };
    return Response.json(timesheets[index]);
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get("entryId");
  const timesheetId = searchParams.get("timesheetId");

  if (entryId && timesheetId) {
    const timesheet = timesheets.find((t) => t.id === timesheetId);
    if (!timesheet) {
      return Response.json({ error: "Timesheet not found" }, { status: 404 });
    }
    timesheet.entries = timesheet.entries.filter((e) => e.id !== entryId);

    timesheet.status = calculateStatus(timesheet.entries);

    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
}
