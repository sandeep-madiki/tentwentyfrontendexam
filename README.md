# Timesheet Management App

A simple timesheet management application built with **Next.js**, allowing users to view, create, edit, and delete weekly timesheet entries with both table and list views. Authentication is handled using **NextAuth**, and styling is done using **Tailwind CSS**.

---

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd <project-folder>

### 2. Install dependies
```bash
npm install

### 3. Start server
```bash
npm run dev


Frameworks & Libraries Used

Next.js 16 – React framework used for routing, server-side rendering, and API routes
TypeScript – For type safety and better developer experience
Tailwind CSS – Utility-first CSS framework for rapid and responsive UI development
NextAuth.js – Used for implementing authentication with a credentials provider (dummy authentication)


Time Spent

Approximately 6–8 hours


Implementation Notes

Authentication is implemented using NextAuth.js with a Credentials provider and dummy authentication, as required for the assessment.
User session and authentication state are managed using NextAuth sessions.
All client-side data interactions are handled through internal Next.js API routes, ensuring a clear separation between UI logic and data handling.
The dashboard consumes timesheet data via these internal API routes and updates the UI based on API responses.
Reusable components and modular structure were used to keep the codebase readable and maintainable.
The provided design was used as a visual reference, while the implementation focuses on the simplified timesheet workflow outlined in the assessment.
