import { memo, useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

import { useAuth } from "../context/AuthContext";

const LOGO =
  "https://res.cloudinary.com/djvksizg/image/upload/v1786735203/csr_dark_theme_logo.png";

const NavSkeleton = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="h-9 w-28 animate-pulse rounded-md bg-zinc-900" />

        <div className="hidden items-center gap-3 md:flex">
          <div className="h-9 w-16 animate-pulse rounded-md bg-zinc-900" />
          <div className="h-9 w-20 animate-pulse rounded-md bg-zinc-900" />
        </div>

        <div className="h-9 w-10 animate-pulse rounded-md bg-zinc-900 md:hidden" />
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
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
      {username.charAt(0).toUpperCase()}
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

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
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

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen
      ? "hidden"
      : "";

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

  if (isLoading) {
    return <NavSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src={LOGO}
            alt="CS Root"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}

        <div className="hidden items-center gap-2 md:flex">

          <Link
            to="/"
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              isActive("/")
                ? "bg-zinc-900 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            Home
          </Link>

          {isAuthenticated && (
            <Link
              to="/problems"
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                isActive("/problems")
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              Problems
            </Link>
          )}

        </div>

        {/* Desktop Right Side */}

        <div className="hidden items-center gap-2 md:flex">

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
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
                className="flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-zinc-900"
              >
                <Avatar
                  username={user?.username ?? ""}
                  profilePicture={user?.profilePicture}
                />

                <span className="max-w-32 truncate text-sm font-medium text-zinc-300">
                  {user?.username}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-zinc-500 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-md border border-zinc-800 bg-black p-1 shadow-xl">

                  <div className="border-b border-zinc-900 px-3 py-3">
                    <p className="truncate text-sm font-medium text-white">
                      {user?.username}
                    </p>

                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="mt-1 block rounded-md px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          )}

        </div>

        {/* Mobile Menu Button */}

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() =>
            setMobileOpen((prev) => !prev)
          }
          className="rounded-md border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white md:hidden"
        >
          {mobileOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>

      </div>

      {/* Mobile Menu */}

      {mobileOpen && (
        <div className="border-t border-zinc-900 bg-black md:hidden">

          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">

            {isAuthenticated && (
              <div className="mb-5 flex items-center gap-3 border-b border-zinc-900 pb-5">

                <Avatar
                  username={user?.username ?? ""}
                  profilePicture={user?.profilePicture}
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.username}
                  </p>

                  <p className="truncate text-xs text-zinc-500">
                    {user?.email}
                  </p>
                </div>

              </div>
            )}

            <div className="flex flex-col">

              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`border-b border-zinc-900 py-3 text-sm font-medium transition ${
                  isActive("/")
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/problems"
                    onClick={() => setMobileOpen(false)}
                    className={`border-b border-zinc-900 py-3 text-sm font-medium transition ${
                      isActive("/problems")
                        ? "text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Problems
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-zinc-900 py-3 text-sm font-medium text-zinc-400 transition hover:text-white"
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-3 text-left text-sm font-medium text-zinc-400 transition hover:text-white"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="mt-5 flex gap-2">

                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-md border border-zinc-800 py-2.5 text-center text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-md bg-white py-2.5 text-center text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    Sign Up
                  </Link>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </header>
  );
});