import { Link } from "react-router-dom";
import { X } from "lucide-react";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function LoginRequiredModal({
  open,
  onClose,
  title = "Login required",
  description = "You need to be logged in to use the compiler.",
}: LoginRequiredModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#04AA6D]/10 text-sm font-bold text-[#04AA6D]">
              CS
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {description}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#04AA6D] px-5 text-sm font-bold text-white transition hover:bg-[#038c5a]"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-zinc-700 px-5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}