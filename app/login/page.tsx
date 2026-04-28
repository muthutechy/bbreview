"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="card w-full">
        <h1 className="text-3xl font-black">Executive Login</h1>
        <p className="mt-2 text-gray-600">Login to manage businesses and review links.</p>
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn-primary mt-6 w-full">
          Continue with Google
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Email OTP login can be added in Version 2.
        </p>
      </div>
    </main>
  );
}
