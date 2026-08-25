import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#282A35] px-4 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-40 animate-pulse rounded bg-zinc-800" />

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="h-72 animate-pulse rounded-2xl bg-[#1d1f27]" />
            <div className="h-72 animate-pulse rounded-2xl bg-[#1d1f27]" />
          </div>

          <div className="mt-5 h-40 animate-pulse rounded-2xl bg-[#1d1f27]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#282A35] px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#1d1f27] p-8 text-center">
          <h1 className="text-2xl font-bold">
            You are not logged in
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Please login to view your profile.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#04AA6D] px-7 text-sm font-bold text-white transition hover:bg-[#038c5a]"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Not available";

  const lastActive = user.lastActiveAt
    ? new Date(user.lastActiveAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  const subscription =
    user.subscription?.plan === "premium"
      ? "Premium"
      : "Free";

  const language = user.preferredLanguage
    ? user.preferredLanguage.charAt(0).toUpperCase() +
      user.preferredLanguage.slice(1)
    : "JavaScript";

  const xpForNextLevel = 1000;
  const currentLevelXp =
    user.experiencePoints % xpForNextLevel;

  const xpProgress =
    (currentLevelXp / xpForNextLevel) * 100;

  const currentLevel =
    Math.floor(user.experiencePoints / xpForNextLevel) + 1;

  const nextLevel = currentLevel + 1;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#282A35] text-white">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#04AA6D]">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Profile
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Your CS ROOT learning profile, progress and account
              information.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/settings"
              className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-700 px-5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900 hover:text-white"
            >
              Settings
            </Link>

            <Link
              to="/settings/profile"
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#04AA6D] px-5 text-sm font-bold text-white transition hover:bg-[#038c5a]"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#1d1f27]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#04AA6D] via-[#738AFF] to-[#E87500]" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">

              <div className="shrink-0">
                <img
                  src={
                    user.profilePicture ||
                    "https://res.cloudinary.com/dlzi244at/image/upload/v1763367677/defaultPersonImage_exseqc.avif"
                  }
                  alt={user.username}
                  className="h-28 w-28 rounded-2xl border border-zinc-700 object-cover shadow-xl sm:h-32 sm:w-32"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="break-words text-2xl font-bold sm:text-3xl lg:text-4xl">
                    {user.name || user.username}
                  </h2>

                  {user.isEmailVerified && (
                    <span className="rounded-full border border-[#04AA6D]/30 bg-[#04AA6D]/10 px-3 py-1 text-xs font-semibold text-[#04AA6D]">
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  @{user.username}
                </p>

                {user.bio ? (
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
                    {user.bio}
                  </p>
                ) : (
                  <p className="mt-5 text-sm italic text-zinc-600">
                    No bio added yet.
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
                  {user.email && (
                    <span className="break-all">
                      {user.email}
                    </span>
                  )}

                  {user.githubUsername && (
                    <span>
                      GitHub: {user.githubUsername}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 rounded-2xl border border-zinc-800 bg-[#282A35] p-5 sm:min-w-[190px]">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">
                  Current Level
                </p>

                <p className="mt-2 text-4xl font-bold text-[#738AFF]">
                  {currentLevel}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  CS ROOT learner
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-zinc-800 bg-[#1d1f27] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#738AFF]">
                Learning Progress
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Level {currentLevel}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Keep learning and solving problems to reach your next level.
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-sm font-semibold text-zinc-300">
                {currentLevelXp.toLocaleString()} /{" "}
                {xpForNextLevel.toLocaleString()} XP
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Level {nextLevel} next
              </p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-[#738AFF] transition-all duration-500"
              style={{
                width: `${xpProgress}%`,
              }}
            />
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
          <div className="bg-[#1d1f27] p-5 sm:p-6">
            <p className="text-2xl font-bold text-white">
              {user.totalPoints.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              Total Points
            </p>
          </div>

          <div className="bg-[#1d1f27] p-5 sm:p-6">
            <p className="text-2xl font-bold text-[#738AFF]">
              {user.experiencePoints.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              Experience
            </p>
          </div>

          <div className="bg-[#1d1f27] p-5 sm:p-6">
            <p className="text-2xl font-bold text-[#E87500]">
              {user.streaks}
            </p>

            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              Day Streak
            </p>
          </div>

          <div className="bg-[#1d1f27] p-5 sm:p-6">
            <p className="text-2xl font-bold text-[#04AA6D]">
              {user.friends}
            </p>

            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              Friends
            </p>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">

          <div className="rounded-2xl border border-zinc-800 bg-[#1d1f27] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E87500]">
                  Achievement
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Your Progress
                </h2>
              </div>

              <span className="rounded-full border border-zinc-700 bg-[#282A35] px-3 py-1 text-xs font-semibold text-zinc-400">
                {user.badgesCount} Badges
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#282A35] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">
                Current Badge
              </p>

              <h3 className="mt-3 text-2xl font-bold text-[#E87500]">
                {user.badge || "Getting Started"}
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Keep solving problems, completing tutorials and building your
                streak to unlock more achievements.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-[#282A35] p-5">
                <p className="text-2xl font-bold text-white">
                  {user.totalPoints}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Points earned
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-[#282A35] p-5">
                <p className="text-2xl font-bold text-[#E87500]">
                  {user.streaks}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Current streak
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-[#282A35] p-5">
                <p className="text-2xl font-bold text-[#04AA6D]">
                  {user.badgesCount}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Badges
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#1d1f27] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#04AA6D]">
              Membership
            </p>

            <div className="mt-3 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">
                {subscription}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  subscription === "Premium"
                    ? "bg-[#738AFF]/10 text-[#738AFF]"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {subscription}
              </span>
            </div>

            <div className="mt-7 space-y-5 border-t border-zinc-800 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">
                  Account role
                </span>

                <span className="font-semibold capitalize text-zinc-300">
                  {user.role}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">
                  Account status
                </span>

                <span
                  className={`font-semibold ${
                    user.isActive
                      ? "text-[#04AA6D]"
                      : "text-red-400"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">
                  Authentication
                </span>

                <span className="font-semibold capitalize text-zinc-300">
                  {user.authProvider || "Email"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">
                  Preferred Language
                </span>

                <span className="font-semibold capitalize text-zinc-300">
                  {language}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">

          <div className="rounded-2xl border border-zinc-800 bg-[#1d1f27] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#04AA6D]">
              Learning
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Learning Profile
            </h2>

            <div className="mt-7 space-y-5">

              <div className="flex items-center justify-between gap-5 border-b border-zinc-800 pb-4">
                <span className="text-sm text-zinc-500">
                  Preferred Language
                </span>

                <span className="text-right text-sm font-semibold capitalize text-zinc-200">
                  {language}
                </span>
              </div>

              <div className="flex items-center justify-between gap-5 border-b border-zinc-800 pb-4">
                <span className="text-sm text-zinc-500">
                  Problem Timer
                </span>

                <span
                  className={`text-sm font-semibold ${
                    user.enableProblemTimer
                      ? "text-[#04AA6D]"
                      : "text-zinc-400"
                  }`}
                >
                  {user.enableProblemTimer
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-5 border-b border-zinc-800 pb-4">
                <span className="text-sm text-zinc-500">
                  Current Badge
                </span>

                <span className="text-right text-sm font-semibold text-zinc-200">
                  {user.badge || "No badge yet"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-5">
                <span className="text-sm text-zinc-500">
                  Badges Earned
                </span>

                <span className="text-sm font-semibold text-zinc-200">
                  {user.badgesCount}
                </span>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#1d1f27] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#738AFF]">
              Account
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Account Information
            </h2>

            <div className="mt-7 space-y-5">

              <div className="flex items-center justify-between gap-5 border-b border-zinc-800 pb-4">
                <span className="text-sm text-zinc-500">
                  Username
                </span>

                <span className="max-w-[60%] break-all text-right text-sm font-semibold text-zinc-200">
                  @{user.username}
                </span>
              </div>

              <div className="flex items-center justify-between gap-5 border-b border-zinc-800 pb-4">
                <span className="text-sm text-zinc-500">
                  Email
                </span>

                <span className="max-w-[60%] break-all text-right text-sm font-semibold text-zinc-200">
                  {user.email || "Not available"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-5 border-b border-zinc-800 pb-4">
                <span className="text-sm text-zinc-500">
                  Member Since
                </span>

                <span className="text-right text-sm font-semibold text-zinc-200">
                  {joinedDate}
                </span>
              </div>

              <div className="flex items-center justify-between gap-5">
                <span className="text-sm text-zinc-500">
                  Last Active
                </span>

                <span className="text-right text-sm font-semibold text-zinc-200">
                  {lastActive}
                </span>
              </div>

            </div>
          </div>
        </section>

        {user.showReputation && (
          <section className="mt-5 rounded-2xl border border-zinc-800 bg-[#1d1f27] p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E87500]">
                  Community
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Reputation
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Your public reputation score on CS ROOT.
                </p>
              </div>

              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-[#E87500]">
                  {user.reputation}
                </span>

                <span className="mb-1 text-sm text-zinc-600">
                  / 5
                </span>
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-[#E87500]"
                style={{
                  width: `${Math.min(
                    Math.max(user.reputation, 0),
                    5
                  ) * 20}%`,
                }}
              />
            </div>
          </section>
        )}

        <section className="mt-5 rounded-2xl border border-zinc-800 bg-[#1d1f27] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
            Security
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Account Security
          </h2>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-zinc-800 bg-[#282A35] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold">
                    Email Verification
                  </h3>

                  <p className="mt-1 text-xs text-zinc-600">
                    Your email verification status.
                  </p>
                </div>

                <span
                  className={`text-xs font-bold ${
                    user.isEmailVerified
                      ? "text-[#04AA6D]"
                      : "text-red-400"
                  }`}
                >
                  {user.isEmailVerified
                    ? "Verified"
                    : "Not verified"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#282A35] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold">
                    Two-Step Verification
                  </h3>

                  <p className="mt-1 text-xs text-zinc-600">
                    Additional protection for your account.
                  </p>
                </div>

                <span
                  className={`text-xs font-bold ${
                    user.twoStepVerification
                      ? "text-[#04AA6D]"
                      : "text-zinc-500"
                  }`}
                >
                  {user.twoStepVerification
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
            </div>

          </div>

          <div className="mt-5 border-t border-zinc-800 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Activity Visibility
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Control who can see your activity.
                </p>
              </div>

              <span className="rounded-full border border-zinc-700 bg-[#282A35] px-4 py-2 text-xs font-semibold capitalize text-zinc-400">
                {user.activityVisibility}
              </span>
            </div>
          </div>
        </section>

        {user.isBanned && (
          <section className="mt-5 rounded-2xl border border-red-900/50 bg-red-950/20 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
              Account Status
            </p>

            <h2 className="mt-2 text-xl font-bold text-red-300">
              Account Restricted
            </h2>

            <p className="mt-3 text-sm leading-6 text-red-400/80">
              Your account currently has restrictions applied to it.
            </p>
          </section>
        )}

      </main>
    </div>
  );
}