import React, { useRef, useState, useEffect } from "react";

type Tab =
  | "profile"
  | "account"
  | "security"
  | "notifications";

const navigation: { id: Tab; label: string; icon: string; description: string }[] = [
  { id: "profile", label: "My Profile", icon: "◉", description: "Personal information and profile photo" },
  { id: "account", label: "Account Settings", icon: "⚙", description: "Manage your account details" },
  { id: "security", label: "Security & Privacy", icon: "♢", description: "Password and account security" },
  { id: "notifications", label: "Notifications", icon: "♧", description: "Manage notification preferences" }
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white focus:bg-white/[0.06]";

const labelClass = "mb-2 block text-sm font-medium text-gray-300";

function SaveButton({ children = "Save Changes", loading = false }: { children?: string; loading?: boolean }) {
  return (
    <div className="flex justify-end pt-4">
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Saving..." : children}
      </button>
    </div>
  );
}

function Toggle({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-white" : "bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full transition ${
          checked ? "left-6 bg-black" : "left-1 bg-white"
        }`}
      />
    </button>
  );
}

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isUsernameEditable, setIsUsernameEditable] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    authProvider: "email",
    githubUsername: "",
    isEmailVerified: false
  });

  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const [account, setAccount] = useState({
    language: "English",
    timezone: "Asia/Kolkata"
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: ""
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    security: true,
    updates: true,
    announcements: false,
    promotional: false
  });

  const [savedMessage, setSavedMessage] = useState("");

  const pageClass = "min-h-screen bg-black text-white";
  const panelClass = "rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-xl";
  const mutedClass = "text-gray-400";

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch("/api/user/settings", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch settings");

        const data = await response.json();
        const userProfile = data.profile || {};

        setProfile({
          fullName: userProfile.fullName || "",
          username: userProfile.authProvider === "github"
            ? (userProfile.githubUsername || userProfile.username || "")
            : (userProfile.username || ""),
          email: userProfile.email || "",
          bio: userProfile.bio || "",
          authProvider: userProfile.authProvider || "email",
          githubUsername: userProfile.githubUsername || "",
          isEmailVerified: Boolean(userProfile.isEmailVerified || userProfile.authProvider === "email")
        });

        if (userProfile.isEmailVerified || userProfile.authProvider === "email") {
          setVerifiedEmail(userProfile.email || "");
        }

        setAccount(data.account || { language: "English", timezone: "Asia/Kolkata" });
        setNotifications(data.notifications || {});
        setSessions(data.sessions || []);
        if (userProfile.avatarUrl) setAvatar(userProfile.avatarUrl);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const showSaved = (message: string) => {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleSendOtp = async () => {
    if (!profile.email || !profile.email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setOtpLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("/api/user/send-email-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: profile.email })
      });

      if (!response.ok) throw new Error("Failed to send OTP");

      setShowOtpBox(true);
      showSaved(`Verification OTP sent to ${profile.email}`);
    } catch (error) {
      alert("Could not send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      alert("Please enter a valid OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("/api/user/verify-email-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: profile.email, otp })
      });

      if (!response.ok) throw new Error("Invalid OTP");

      setVerifiedEmail(profile.email);
      setProfile((prev) => ({ ...prev, isEmailVerified: true }));
      setShowOtpBox(false);
      setOtp("");
      showSaved("Email verified successfully!");
    } catch (error) {
      alert("Invalid or expired OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) throw new Error("Failed to update profile");

      setIsUsernameEditable(false);
      showSaved("Profile details updated successfully.");
    } catch (error) {
      alert("Error updating profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("/api/user/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(account)
      });

      if (!response.ok) throw new Error("Failed to update account preferences");

      showSaved("Account preferences updated successfully.");
    } catch (error) {
      alert("Error updating account preferences.");
    } finally {
      setIsSubmitting(false);
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
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND}/users/password`,  {
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

      setSessions(sessions.filter((s) => s.id !== id));
      showSaved("Device logged out successfully.");
    } catch (error) {
      alert("Failed to log out device.");
    }
  };

  const handleNotificationSave = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(notifications)
      });

      if (!response.ok) throw new Error("Failed to update notifications");
      showSaved("Notification preferences updated.");
    } catch (error) {
      alert("Error saving notification settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateNotification = (key: keyof typeof notifications) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key]
    }));
  };

  const handleAccountAction = async (action: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action.toLowerCase()} your account?`
    );

    if (confirmed) {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch(`/api/user/account-${action.toLowerCase()}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error();
        alert(`Account ${action.toLowerCase()} request successful.`);
      } catch (error) {
        alert(`${action} request failed.`);
      }
    }
  };

  const isEmailCurrentlyVerified =
    profile.email.trim() !== "" &&
    profile.email.trim().toLowerCase() === verifiedEmail.trim().toLowerCase();

  const shouldShowVerifyButton =
    profile.email.trim().length > 0 && !isEmailCurrentlyVerified;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1250px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        <div className="mb-9">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Account Management
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Settings
          </h1>

          <p className={`mt-2 text-sm ${mutedClass}`}>
            Manage your personal information, account and preferences.
          </p>
        </div>

        {savedMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white"
          >
            {savedMessage}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">

          <aside className={`${panelClass} p-3 lg:sticky lg:top-8`}>
            <div className="mb-4 px-3 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Settings Menu
              </p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              {navigation.map((item) => {
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as Tab)}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition lg:w-full ${
                      active
                        ? "bg-white text-black font-medium shadow-md"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${active ? "bg-black text-white" : "bg-white/5 text-white"}`}>
                      {item.icon}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className={`hidden text-xs lg:block ${active ? "text-gray-700" : mutedClass}`}>
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className={`${panelClass} min-w-0 p-5 sm:p-8`}>

            {activeTab === "profile" && (
              <section>
                <form onSubmit={handleProfileSubmit} className="space-y-6">

                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-white">◉</span>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-white">Profile Photo</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-gray-200"
                          >
                            Upload Photo
                          </button>

                          {avatar && (
                            <button
                              type="button"
                              onClick={() => {
                                setAvatar(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                              className="rounded-lg border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/5"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-gray-300">
                      Signed in with{" "}
                      <span className="font-semibold capitalize text-white">
                        {profile.authProvider === "github" ? "GitHub" : "Email / Gmail"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input
                        className={inputClass}
                        type="text"
                        placeholder="Enter full name"
                        value={profile.fullName}
                        onChange={(e) =>
                          setProfile({ ...profile, fullName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>
                          {profile.authProvider === "github" ? "GitHub Username" : "Username"}
                        </label>
                        {profile.authProvider === "github" && (
                          <span className="mb-2 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-300">
                            Connected via GitHub
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          className={`${inputClass} ${profile.authProvider !== "github" ? "pr-12" : "cursor-not-allowed opacity-80"}`}
                          type="text"
                          placeholder="Enter username"
                          value={profile.username}
                          disabled={profile.authProvider === "github" || !isUsernameEditable}
                          onChange={(e) =>
                            setProfile({ ...profile, username: e.target.value })
                          }
                          required
                        />
                        {profile.authProvider !== "github" && (
                          <button
                            type="button"
                            onClick={() => setIsUsernameEditable(!isUsernameEditable)}
                            title={isUsernameEditable ? "Lock username" : "Edit username"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                          >
                            {isUsernameEditable ? "✓" : "✎"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Email / Gmail Address</label>
                        {isEmailCurrentlyVerified && (
                          <span className="mb-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <div className="relative flex items-center">
                        <input
                          className={`${inputClass} ${shouldShowVerifyButton ? "pr-24" : ""}`}
                          type="email"
                          placeholder={
                            profile.authProvider === "github"
                              ? "Add your Gmail address to verify"
                              : "Enter email address"
                          }
                          value={profile.email}
                          onChange={(e) => {
                            setProfile({ ...profile, email: e.target.value });
                            if (showOtpBox) {
                              setShowOtpBox(false);
                              setOtp("");
                            }
                          }}
                          required
                        />

                        {shouldShowVerifyButton && (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpLoading}
                            className="absolute right-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
                          >
                            {otpLoading ? "Sending..." : showOtpBox ? "Resend" : "Verify"}
                          </button>
                        )}
                      </div>

                      {showOtpBox && (
                        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-white/15 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-white">
                              Enter Verification OTP
                            </p>
                            <p className="mt-0.5 text-[11px] text-gray-400">
                              We sent a code to <span className="text-white">{profile.email}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                              className="w-32 rounded-lg border border-white/15 bg-black px-3 py-2 text-center text-sm tracking-widest text-white outline-none focus:border-white"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={otpLoading}
                              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
                            >
                              {otpLoading ? "Checking..." : "Confirm"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Bio</label>
                    <textarea
                      className={inputClass}
                      rows={4}
                      maxLength={250}
                      placeholder="Write something about yourself..."
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                    />
                    <p className={`mt-1 text-right text-xs ${mutedClass}`}>
                      {profile.bio.length}/250
                    </p>
                  </div>

                  <SaveButton loading={isSubmitting} />
                </form>
              </section>
            )}

            {activeTab === "account" && (
              <section>
                <form onSubmit={handleAccountSubmit} className="space-y-6">

                  <div>
                    <label className={labelClass}>Language</label>
                    <select
                      className={inputClass}
                      value={account.language}
                      onChange={(e) =>
                        setAccount({ ...account, language: e.target.value })
                      }
                    >
                      <option className="bg-black text-white">English</option>
                      <option className="bg-black text-white">Hindi</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Time Zone</label>
                    <select
                      className={inputClass}
                      value={account.timezone}
                      onChange={(e) =>
                        setAccount({ ...account, timezone: e.target.value })
                      }
                    >
                      <option value="Asia/Kolkata" className="bg-black text-white">
                        India Standard Time (IST)
                      </option>
                      <option value="Europe/London" className="bg-black text-white">
                        London
                      </option>
                      <option value="America/New_York" className="bg-black text-white">
                        Eastern Time
                      </option>
                      <option value="UTC" className="bg-black text-white">
                        UTC
                      </option>
                    </select>
                  </div>

                  <SaveButton loading={isSubmitting} />

                </form>

                <div className="mt-10 border-t border-white/10 pt-7">
                  <h3 className="mb-2 font-semibold text-white">Account Management</h3>
                  <p className={`mb-5 text-sm ${mutedClass}`}>
                    Manage the status of your account.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleAccountAction("Deactivate")}
                      className="rounded-xl border border-white/30 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Deactivate Account
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAccountAction("Delete")}
                      className="rounded-xl border border-red-500/50 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "security" && (
              <section>
                <form onSubmit={handlePasswordSubmit} className="space-y-5">

                  <div>
                    <label className={labelClass}>Current Password</label>
                    <div className="relative">
                      <input
                        className={`${inputClass} pr-12`}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-white"
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
                        className={`${inputClass} pr-12`}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <div className="relative">
                      <input
                        className={`${inputClass} pr-12`}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <SaveButton loading={isSubmitting}>Update Password</SaveButton>
                </form>

                <div className="mt-9 border-t border-white/10 pt-7">
                  <h3 className="font-semibold text-white">Additional Security</h3>
                  <p className={`mt-2 text-sm ${mutedClass}`}>
                    Additional security features can be enabled through your account security service.
                  </p>

                  <div className="mt-6 border-t border-white/10 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowSessions(!showSessions)}
                      className="flex w-full items-center justify-between text-left transition"
                    >
                      <div>
                        <h4 className="font-semibold text-white">Where You're Logged In</h4>
                        <p className={`mt-1 text-sm ${mutedClass}`}>
                          Click to view and manage active sessions and connected devices.
                        </p>
                      </div>
                      <span className="text-xl text-gray-400">
                        {showSessions ? "▲" : "▼"}
                      </span>
                    </button>

                    {showSessions && (
                      <div className="mt-5 space-y-3">
                        {sessions.length === 0 ? (
                          <p className={`text-xs ${mutedClass}`}>No other active sessions found.</p>
                        ) : (
                          sessions.map((session: any) => (
                            <div
                              key={session.id}
                              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 transition"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-white">{session.device}</p>
                                  {session.current && (
                                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white">
                                      Current Device
                                    </span>
                                  )}
                                </div>
                                <p className={`mt-1 text-xs ${mutedClass}`}>
                                  {session.browser} • {session.location} ({session.time})
                                </p>
                              </div>

                              {!session.current && (
                                <button
                                  type="button"
                                  onClick={() => handleLogoutSession(session.id)}
                                  className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                                >
                                  Log Out
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                        <p className={`mt-1 text-xs ${mutedClass}`}>
                          Add another layer of account protection.
                        </p>
                      </div>
                      <span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white">
                        Not configured
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "notifications" && (
              <section>
                <div className="space-y-1">
                  {[
                    {
                      key: "email" as const,
                      title: "Email Notifications",
                      description: "Receive important updates through email."
                    },
                    {
                      key: "security" as const,
                      title: "Security Alerts",
                      description: "Get notified about important account activity."
                    },
                    {
                      key: "updates" as const,
                      title: "Product Updates",
                      description: "Stay informed about new features and improvements."
                    },
                    {
                      key: "announcements" as const,
                      title: "Announcements",
                      description: "Receive important company announcements."
                    },
                    {
                      key: "promotional" as const,
                      title: "Promotional Notifications",
                      description: "Receive offers, promotions and special updates."
                    }
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 border-b border-white/10 py-5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className={`mt-1 text-xs ${mutedClass}`}>
                          {item.description}
                        </p>
                      </div>

                      <Toggle
                        checked={notifications[item.key]}
                        onChange={() => updateNotification(item.key)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={handleNotificationSave}
                    disabled={isSubmitting}
                    className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-gray-200 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </section>
            )}

          </main>
        </div>

        <footer className={`mt-8 border-t border-white/10 pt-5 text-center text-xs ${mutedClass}`}>
          Account Settings · All rights reserved.
        </footer>

      </div>
    </div>
  );
}