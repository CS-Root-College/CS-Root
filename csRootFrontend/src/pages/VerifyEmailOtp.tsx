import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

const api = import.meta.env.VITE_PUBLIC_BACKEND;

export function VerifyEmailOtp() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    if (otp.trim().length !== 6) {
      setError(
        "Verification code must be 6 digits."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${api}/api/v1/users/verify-email`,
        {
          email: email.trim(),
          otp: otp.trim(),
        },
        {
          withCredentials: true,
        }
      );

      console.log(
        "Email verified:",
        response.data
      );

      /*
       * Backend has created the user and
       * generated authentication cookies.
       *
       * Get the authenticated user and
       * update AuthContext.
       */
      await refreshUser();

      navigate("/");

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Verification failed. Please try again."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black px-4 py-12 text-white">

      <div className="mx-auto w-full max-w-md">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold tracking-tight">
            Verify your email
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Enter the 6-digit code we sent to your
            email.
          </p>

        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-600 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="000000"
                autoComplete="one-time-code"
                disabled={loading}
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-center text-xl font-semibold tracking-[0.4em] text-white outline-none placeholder:text-zinc-700 transition focus:border-zinc-600 disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Verifying..."
                : "Verify Email"}
            </button>

          </form>

          <div className="mt-6 border-t border-zinc-800 pt-6 text-center">

            <p className="text-sm text-zinc-500">
              Didn't receive the code?
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              You can request a new code later.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}