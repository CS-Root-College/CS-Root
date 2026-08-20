import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const api = import.meta.env.VITE_PUBLIC_BACKEND;

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { refreshUser } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const github = searchParams.get("github");

    if (github === "success") {
      const handleGithubLogin = async () => {
        try {
          setLoading(true);
          setError("");

          await refreshUser();

          navigate("/", { replace: true });
        } catch {
          setError("GitHub login failed. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      handleGithubLogin();
    }

    if (github === "error") {
      setError("GitHub login failed. Please try again.");
    }
  }, [searchParams, refreshUser, navigate]);

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

      await axios.post(
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

  const handleGithubLogin = () => {
    window.location.href =
      `${api}/api/v1/oauth/github-login`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black px-4 py-12 text-white">

      <div className="mx-auto w-full max-w-md">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Login to continue to CS Root
          </p>

        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-zinc-950 px-3 text-xs text-zinc-600">
                OR
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-black py-3 text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-current"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-1.02-.014-1.85-2.782.604-3.369-1.183-3.369-1.183-.455-1.156-1.11-1.464-1.11-1.464-.908-.621.069-.608.069-.608 1.004.071 1.532 1.031 1.532 1.031.892 1.529 2.341 1.087 2.91.832.091-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.684-.103-.253-.446-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 7.338a9.56 9.56 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.393.1 2.646.64.7 1.028 1.593 1.028 2.684 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.337-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
            </svg>

            Continue with GitHub
          </button>

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
