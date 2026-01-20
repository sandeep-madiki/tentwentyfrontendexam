"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 md:min-h-0">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-semibold text-gray-900">Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <label className="flex items-center text-sm text-gray-600">
              <input type="checkbox" className="me-1"/> 
              Remember me
            </label>

            <button
              type="submit"
              className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{backgroundColor: '#1A56DB'}}
           >
              Sign in
            </button>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="hidden min-h-screen bg-blue-600 text-white md:flex md:items-center md:justify-center">
        <div className="flex flex-col items-start justify-center px-8 py-12 text-start">
          <h2 className="text-3xl font-semibold">ticktock</h2>
          <p className="mt-3 max-w-md text-sm text-blue-100">
           Introducing ticktock, our cutting-edge timesheet web application disigned to revolutionize how you manage employee work hours. With ticktock, you can effortlessly track and monitor employee attendence and productivity from anywhere, anytime, using any internet-connected device.
          </p>
        </div>
      </div>
    </div>
  );
}
