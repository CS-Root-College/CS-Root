
import { useNavigate } from "react-router-dom";
import { BookOpen, LockKeyhole, ArrowUpRight } from "lucide-react";

type AdminPageProps = {
    isAdmin: boolean;
};

export default function AdminPage({ isAdmin }: AdminPageProps) {
    const navigate = useNavigate();

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#030712] px-4">
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center">
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                        <LockKeyhole size={22} />
                    </div>

                    <h1 className="text-xl font-semibold text-white">
                        Access Denied
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        You don't have permission to access this page.
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] px-5 py-12 text-white sm:px-8">
            <main className="mx-auto max-w-5xl">
                <div className="mb-12">
                    <p className="text-sm font-medium text-violet-400">
                        CS ROOT / ADMIN
                    </p>

                    <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Manage and organize your platform.
                    </p>
                </div>

                <div>
                    <h2 className="mb-4 text-sm font-medium text-zinc-400">
                        Management
                    </h2>

                    <button
                        onClick={() => navigate("/admin/resources")}
                        className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-left transition hover:border-violet-500/40 hover:bg-zinc-900 sm:p-8"
                    >
                        <div className="flex items-center gap-5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                                <BookOpen size={23} />
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Resource Management
                                </h3>

                                <p className="mt-1 text-sm text-zinc-400">
                                    Create, edit and publish learning resources.
                                </p>
                            </div>
                        </div>

                        <ArrowUpRight
                            size={20}
                            className="shrink-0 text-zinc-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-violet-400"
                        />
                    </button>
                </div>
            </main>
        </div>
    );
}
