import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../utils/axios";

const COOLDOWN_KEY = "csroot_password_reset_cooldown";
const COOLDOWN_TIME = 60;

export function ForgetPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const expiry = Number(localStorage.getItem(COOLDOWN_KEY));

      if (!expiry) {
        setCountdown(0);
        return;
      }

      const remaining = Math.max(
        0,
        Math.ceil((expiry - Date.now()) / 1000)
      );

      setCountdown(remaining);

      if (remaining === 0) {
        localStorage.removeItem(COOLDOWN_KEY);
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!identifier.trim()) {
      setError("Please enter your email or username.");
      return;
    }

    if (countdown > 0) {
      setError(`Please wait ${countdown} seconds before trying again.`);
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/forget-password", {
        identifier: identifier.trim(),
      });

      const expiry = Date.now() + COOLDOWN_TIME * 1000;

      localStorage.setItem(COOLDOWN_KEY, expiry.toString());

      setCountdown(COOLDOWN_TIME);
      setSuccess("Password reset link sent successfully. Please check your email.");
      setIdentifier("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to send reset link. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
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
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Enter your email or username to receive a password reset link.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email or Username
              </label>

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or username"
                autoComplete="username"
                disabled={loading || countdown > 0}
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || countdown > 0}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : countdown > 0
                  ? `Try again in ${countdown}s`
                  : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800 pt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-zinc-400 transition hover:text-white hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}