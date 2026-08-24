import { memo, useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

type MenuItem = {
  label: string;
  path: string;
};

const tutorialItems: MenuItem[] = [
  {
    label: "DSA",
    path: "/tutorials/dsa",
  },
  {
    label: "OOPs",
    path: "/tutorials/oops",
  },
  {
    label: "DBMS",
    path: "/tutorials/dbms",
  },
  {
    label: "Computer Networks",
    path: "/tutorials/computer-networks",
  },
  {
    label: "Operating Systems",
    path: "/tutorials/operating-systems",
  },
];

const practiceItems: MenuItem[] = [
  {
    label: "DSA Problems",
    path: "/practice/dsa",
  },
  {
    label: "Coding Problems",
    path: "/practice/coding",
  },
  {
    label: "MCQs",
    path: "/practice/mcq",
  },
  {
    label: "Quizzes",
    path: "/practice/quizzes",
  },
];

const resourceItems: MenuItem[] = [
  {
    label: "Notes",
    path: "/resources/notes",
  },
  {
    label: "Books",
    path: "/resources/books",
  },
  {
    label: "Cheat Sheets",
    path: "/resources/cheat-sheets",
  },
  {
    label: "Useful Websites",
    path: "/resources/websites",
  },
];

const NavSkeleton = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-zinc-900" />

        <div className="hidden items-center gap-3 md:flex">
          <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-900" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-900" />
          <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-900" />
        </div>

        <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-900 md:hidden" />
      </div>
    </header>
  );
};

const Avatar = ({
  username,
  profilePicture,
}: {
  username: string;
  profilePicture?: string;
}) => {
  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt={username}
        className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-700"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-200 ring-1 ring-zinc-700">
      {username.charAt(0).toUpperCase()}
    </div>
  );
};

const DesktopDropdown = ({
  label,
  items,
  active,
}: {
  label: string;
  items: MenuItem[];
  active: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
          active
            ? "bg-zinc-900 text-white"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
        }`}
      >
        {label}

        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/40">
            <div className="mb-1 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                {label}
              </p>
            </div>

            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MobileDropdown = ({
  label,
  items,
  open,
  onToggle,
  onNavigate,
}: {
  label: string;
  items: MenuItem[];
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) => {
  return (
    <div className="border-b border-zinc-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3.5 text-left text-sm font-medium text-zinc-300"
      >
        {label}

        <ChevronDown
          size={16}
          className={`text-zinc-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="mb-3 space-y-1 rounded-xl bg-zinc-900/50 p-2">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const Navbar = memo(() => {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileTutorialsOpen, setMobileTutorialsOpen] = useState(false);
  const [mobilePracticeOpen, setMobilePracticeOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setMobileTutorialsOpen(false);
    setMobilePracticeOpen(false);
    setMobileResourcesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      setProfileOpen(false);
      setMobileOpen(false);

      await logout();

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const isTutorialActive = tutorialItems.some((item) =>
    isActive(item.path)
  );

  const isPracticeActive = practiceItems.some((item) =>
    isActive(item.path)
  );

  const isResourceActive = resourceItems.some((item) =>
    isActive(item.path)
  );

  if (isLoading) {
    return <NavSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
        >
          <img
            src="/logo.png"
            alt="CS Root"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {!isAuthenticated ? (
            <>
              <DesktopDropdown
                label="Tutorials"
                items={tutorialItems}
                active={isTutorialActive}
              />

              <DesktopDropdown
                label="Practice"
                items={practiceItems}
                active={isPracticeActive}
              />

              <DesktopDropdown
                label="Resources"
                items={resourceItems}
                active={isResourceActive}
              />

              <Link
                to="/roadmap"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/roadmap")
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                Roadmap
              </Link>

              <Link
                to="/about"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/about")
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                About
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/")
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                Home
              </Link>

              <Link
                to="/problems"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/problems")
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                Problems
              </Link>

              <Link
                to="/dashboard"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/dashboard")
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/compiler"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/compiler")
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                Compiler
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div
              ref={profileRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-zinc-800 hover:bg-zinc-900"
              >
                <Avatar
                  username={user?.username ?? ""}
                  profilePicture={user?.profilePicture}
                />

                <div className="hidden max-w-28 text-left lg:block">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {user?.username}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className={`text-zinc-500 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/40">
                  <div className="mb-1 border-b border-zinc-900 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        username={user?.username ?? ""}
                        profilePicture={user?.profilePicture}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {user?.username}
                        </p>

                        <p className="truncate text-xs text-zinc-600">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Profile
                  </Link>

                  <Link
                    to="/dashboard"
                    className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/submissions"
                    className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    My Submissions
                  </Link>

                  <Link
                    to="/progress"
                    className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Progress
                  </Link>

                  <Link
                    to="/roadmap"
                    className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Roadmap
                  </Link>

                  <Link
                    to="/settings"
                    className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Settings
                  </Link>

                  <div className="my-1 border-t border-zinc-900" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() =>
            setMobileOpen((prev) => !prev)
          }
          className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white md:hidden"
        >
          {mobileOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            {isAuthenticated && (
              <div className="mb-4 flex items-center gap-3 border-b border-zinc-900 pb-5">
                <Avatar
                  username={user?.username ?? ""}
                  profilePicture={user?.profilePicture}
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.username}
                  </p>

                  <p className="truncate text-xs text-zinc-600">
                    {user?.email}
                  </p>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`block border-b border-zinc-900 py-3.5 text-sm font-medium ${
                    isActive("/")
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/problems"
                  onClick={() => setMobileOpen(false)}
                  className={`block border-b border-zinc-900 py-3.5 text-sm font-medium ${
                    isActive("/problems")
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Problems
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`block border-b border-zinc-900 py-3.5 text-sm font-medium ${
                    isActive("/dashboard")
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/compiler"
                  onClick={() => setMobileOpen(false)}
                  className={`block border-b border-zinc-900 py-3.5 text-sm font-medium ${
                    isActive("/compiler")
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Compiler
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-zinc-900 py-3.5 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Profile
                </Link>

                <Link
                  to="/submissions"
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-zinc-900 py-3.5 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  My Submissions
                </Link>

                <Link
                  to="/progress"
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-zinc-900 py-3.5 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Progress
                </Link>

                <Link
                  to="/roadmap"
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-zinc-900 py-3.5 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Roadmap
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-zinc-900 py-3.5 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full py-3.5 text-left text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileDropdown
                  label="Tutorials"
                  items={tutorialItems}
                  open={mobileTutorialsOpen}
                  onToggle={() =>
                    setMobileTutorialsOpen(
                      (prev) => !prev
                    )
                  }
                  onNavigate={() =>
                    setMobileOpen(false)
                  }
                />

                <MobileDropdown
                  label="Practice"
                  items={practiceItems}
                  open={mobilePracticeOpen}
                  onToggle={() =>
                    setMobilePracticeOpen(
                      (prev) => !prev
                    )
                  }
                  onNavigate={() =>
                    setMobileOpen(false)
                  }
                />

                <MobileDropdown
                  label="Resources"
                  items={resourceItems}
                  open={mobileResourcesOpen}
                  onToggle={() =>
                    setMobileResourcesOpen(
                      (prev) => !prev
                    )
                  }
                  onNavigate={() =>
                    setMobileOpen(false)
                  }
                />

                <Link
                  to="/roadmap"
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-zinc-900 py-3.5 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Roadmap
                </Link>

                <Link
                  to="/about"
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-zinc-900 py-3.5 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  About
                </Link>

                <div className="mt-5 flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-lg border border-zinc-800 py-2.5 text-center text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-lg bg-white py-2.5 text-center text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
});