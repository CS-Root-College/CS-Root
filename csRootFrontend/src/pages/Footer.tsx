import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#111522]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              to="/"
              className="text-2xl font-bold text-white transition hover:text-[#04AA6D]"
            >
              CS ROOT
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500">
              A Computer Science learning and practice platform built to help
              students learn, practice and improve.
            </p>

            <div className="mt-6 h-1 w-10 rounded-full bg-[#04AA6D]" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              Learn
            </h3>

            <div className="mt-5 space-y-3">
              <Link
                to="/tutorials/dsa"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                DSA
              </Link>

              <Link
                to="/tutorials/oops"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                OOPs
              </Link>

              <Link
                to="/tutorials/dbms"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                DBMS
              </Link>

              <Link
                to="/tutorials/computer-networks"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                Computer Networks
              </Link>

              <Link
                to="/tutorials/operating-systems"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                Operating System
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              Practice
            </h3>

            <div className="mt-5 space-y-3">
              <Link
                to="/practice"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                Problems
              </Link>

              <Link
                to="/practice/mcq"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                MCQs
              </Link>

              <Link
                to="/practice/quiz"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                Quizzes
              </Link>

              <Link
                to="/practice"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                Practice Dashboard
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              CS ROOT
            </h3>

            <div className="mt-5 space-y-3">
              <Link
                to="/about"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                About
              </Link>

              <Link
                to="/roadmap"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                Roadmap
              </Link>

              <Link
                to="/contact"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                Contact
              </Link>

              <Link
                to="/report"
                className="block text-sm text-zinc-500 transition hover:text-[#04AA6D]"
              >
                Report a Problem
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} CS ROOT. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-sm text-zinc-600 transition hover:text-white"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="text-sm text-zinc-600 transition hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}