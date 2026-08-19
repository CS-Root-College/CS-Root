import { useState } from "react";
import { Link } from "react-router-dom";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-white"
        >
          CS Root
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-zinc-300 hover:text-white"
          >
            Home
          </Link>

          <Link
            to="/login"
            className="text-zinc-300 hover:text-white"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-md bg-white px-4 py-2 text-black hover:bg-zinc-200"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xl text-white md:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-zinc-800 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-zinc-300 hover:text-white"
            >
              Home
            </Link>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-zinc-300 hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="text-zinc-300 hover:text-white"
            >
              Sign Up
            </Link>

          </div>
        </div>
      )}
    </nav>
  );
}