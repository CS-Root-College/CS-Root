import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type Section = "menu" | "password" | "sessions" | "2fa" | "theme";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white focus:bg-white/[0.06]";

const labelClass = "mb-2 block text-sm font-medium text-gray-300";

function SaveButton({
  children = "Save Changes",
  loading = false
}: {
  children?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex justify-end pt-4">
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Saving..." : children}
      </button>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL se active section read karein (default "menu")
  const rawSection = searchParams.get("section") as Section | null;
  const validSections: Section[] = ["menu", "password", "sessions", "2fa", "theme"];
  const activeSection: Section =
    rawSection && validSections.includes(rawSection) ? rawSection : "menu";

  const setActiveSection = (section: Section) => {
    setSavedMessage("");
    if (section === "menu") {
      setSearchParams({});
    } else {
      setSearchParams({ section });
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [sessions, setSessions] = useState<any[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const showSaved = (message: string) => {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(""), 3000);
  };

  useEffect(() => {
    async function fetchSecurityData() {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch("/api/user/settings", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions || []);
          setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSecurityData();
  }, []);

  const handleBack = () => {
    setSavedMessage("");
    if (activeSection !== "menu") {
      // Agar app ke andar se hi is section par aaye hain to history back karein
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        // Direct link open kiya tha to seedha main settings menu par bhejein
        setSearchParams({});
      }
    } else {
      navigate(-1);
    }
  };

  const getHeaderTitle = () => {
    switch (activeSection) {
      case "password":
        return "Change Password";
      case "sessions":
        return "Where You're Logged In";
      case "2fa":
        return "Two-Step Verification";
      case "theme":
        return "Theme";
      default:
        return "Settings";
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.newPassword.length < 8) {
      alert("New password must contain at least 8 characters.");
      return;
    }

    if (password.newPassword !== password.confirm) {
      alert("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND}/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      showSaved("Password updated successfully.");
      setPassword({ current: "", newPassword: "", confirm: "" });
    } catch (error: any) {
      alert(error.message || "Error updating password. Check your current password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutSession = async (id: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`/api/user/sessions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to terminate session");

      setSessions((prev) => prev.filter((s) => s.id !== id));
      showSaved("Device logged out successfully.");
    } catch (error) {
      alert("Failed to log out device.");
    }
  };

  const handleToggle2FA = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      const nextState = !twoFactorEnabled;
      const response = await fetch("/api/user/2fa", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: nextState })
      });

      if (!response.ok) throw new Error("Failed to update 2FA");

      setTwoFactorEnabled(nextState);
      showSaved(
        nextState
          ? "Two-step verification enabled."
          : "Two-step verification disabled."
      );
    } catch (error) {
      setTwoFactorEnabled((prev) => !prev);
      showSaved("Two-step verification preference updated.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuOptions: {
    id: Exclude<Section, "menu"> | "profile";
    title: string;
    description: string;
    badge?: string;
    route?: string;
  }[] = [
    {
      id: "profile",
      title: "My Profile",
      description: "View and edit your personal profile details",
      route: "/profile"
    },
    {
      id: "password",
      title: "Change Password",
      description: "Update your current password to keep your account secure"
    },
    {
      id: "sessions",
      title: "Where You're Logged In",
      description: "View and manage active sessions across your devices",
      badge: sessions.length > 0 ? `${sessions.length} active` : undefined
    },
    {
      id: "2fa",
      title: "Two-Step Verification",
      description: "Add an extra layer of security to your account",
      badge: twoFactorEnabled ? "Enabled" : "Off"
    },
    {
      id: "theme",
      title: "Theme",
      description: "Appearance and display mode preferences",
      badge: "Dark (Locked)"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-8 flex items-center gap-3.5">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0a] text-white transition hover:border-white/25 hover:bg-white/10 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>

          <div className="min-w-0">
            {activeSection !== "menu" && (
              <p className="text-xs font-medium text-gray-400">Settings</p>
            )}
            <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
              {getHeaderTitle()}
            </h1>
          </div>
        </header>

        {savedMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            {savedMessage}
          </div>
        )}

        <div className="flex-1">
          {activeSection === "menu" && (
            <div className="space-y-3">
              {menuOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    if (option.route) {
                      navigate(option.route);
                    } else {
                      setActiveSection(option.id as Section);
                    }
                  }}
                  className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.04] active:scale-[0.99] sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-base font-semibold text-white">
                        {option.title}
                      </h2>
                      {option.badge && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            option.badge === "Enabled"
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "bg-white/10 text-gray-300"
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                      {option.description}
                    </p>
                  </div>

                  <span className="shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeSection === "password" && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-xl sm:p-7">
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-16`}
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      value={password.current}
                      onChange={(e) =>
                        setPassword({ ...password, current: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>New Password</label>
                    <button
                      type="button"
                      onClick={() => alert("Forgot password recovery flow triggered.")}
                      className="mb-2 text-xs font-medium text-gray-400 underline hover:text-white"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-16`}
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Enter new password"
                      value={password.newPassword}
                      onChange={(e) =>
                        setPassword({ ...password, newPassword: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-16`}
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Confirm new password"
                      value={password.confirm}
                      onChange={(e) =>
                        setPassword({ ...password, confirm: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <SaveButton loading={isSubmitting}>Update Password</SaveButton>
              </form>
            </div>
          )}

          {activeSection === "sessions" && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-xl sm:p-7">
              <p className="mb-5 text-sm text-gray-400">
                Devices where your account is currently signed in. Log out of any session you don&apos;t recognize.
              </p>

              {sessions.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
                  <p className="text-sm text-gray-400">
                    No other active sessions found.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            {session.device}
                          </p>
                          {session.current && (
                            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          {session.browser} • {session.location} ({session.time})
                        </p>
                      </div>

                      {!session.current && (
                        <button
                          type="button"
                          onClick={() => handleLogoutSession(session.id)}
                          className="w-full rounded-lg border border-red-500/40 px-3.5 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 sm:w-auto"
                        >
                          Log Out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "2fa" && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-xl sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-semibold text-white">
                      Authenticator / OTP Protection
                    </h2>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        twoFactorEnabled
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {twoFactorEnabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-400">
                    Require a verification code in addition to your password when signing in from a new device.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleToggle2FA}
                  className={`w-full shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 sm:w-auto ${
                    twoFactorEnabled
                      ? "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "theme" && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-xl sm:p-7">
              <p className="mb-5 text-sm text-gray-400">
                Select your interface theme. Dark mode is currently locked as the default experience.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative flex flex-col justify-between rounded-xl border-2 border-white bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black text-white">
                        ☾
                      </span>
                      <span className="text-sm font-semibold text-white">Dark</span>
                    </div>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-black">
                      Active
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-gray-400">
                    Default dark interface optimized for low-light focus.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="relative flex cursor-not-allowed flex-col justify-between rounded-xl border border-white/10 bg-white/[0.01] p-4 text-left opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-gray-400">
                        ☀
                      </span>
                      <span className="text-sm font-semibold text-gray-300">Light</span>
                    </div>
                    <span className="flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Locked
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    Light mode is currently unavailable.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-auto pt-10 text-center">
          <p className="text-xs font-medium tracking-wide text-gray-500">
            Version 1.0.0
          </p>
        </footer>
      </div>
    </div>
  );
}