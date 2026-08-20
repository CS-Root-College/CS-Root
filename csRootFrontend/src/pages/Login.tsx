import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const api = import.meta.env.VITE_PUBLIC_BACKEND;

export function Login() {
  const navigate = useNavigate();

  const { refreshUser } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!identifier.trim()) {
      setError("Please enter your email or username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const isEmail = identifier.includes("@");

      const response = await axios.post(
        `${api}/api/v1/users/login`,
        {
          ...(isEmail
            ? {
                email: identifier.trim(),
              }
            : {
                username: identifier.trim(),
              }),

          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(
        "Login successful:",
        response.data
      );

      /*
       * Login endpoint has now created
       * the authentication cookies.
       *
       * Ask the backend who the currently
       * authenticated user is and update
       * AuthContext.
       */
      await refreshUser();

      navigate("/");

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Login failed. Please check your credentials."
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

        {/* Heading */}

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Login to continue to CS Root
          </p>

        </div>

        {/* Login Card */}

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email / Username */}

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
                onChange={(event) =>
                  setIdentifier(event.target.value)
                }
                placeholder="Enter your email or username"
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* Error */}

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* Register */}

          <div className="mt-6 border-t border-zinc-800 pt-6 text-center">

            <p className="text-sm text-zinc-500">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-medium text-white hover:underline"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}