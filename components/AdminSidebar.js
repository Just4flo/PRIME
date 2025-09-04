import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Users, Calendar, Clock, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/config/firebase";

const auth = getAuth(app);

export default function AdminSidebar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItemClass =
        "flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-purple-700 cursor-pointer";

    return (
        <>
            {/* Top Navbar (mobile only) */}
            <div className="lg:hidden flex items-center justify-between bg-purple-900 text-white p-4 shadow-md fixed top-0 left-0 right-0 z-50">
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <button onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-screen w-64 bg-purple-900 text-white flex flex-col p-4 shadow-xl transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <h2 className="text-2xl font-bold mb-8 text-center hidden lg:block">
                    Admin Panel
                </h2>

                <nav className="flex flex-col space-y-3 mt-12 lg:mt-0">
                    <Link href="/admin" className={navItemClass} onClick={() => setIsOpen(false)}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <Link
                        href="/admin/update-member"
                        className={navItemClass}
                        onClick={() => setIsOpen(false)}
                    >
                        <Users size={20} />
                        Manage Members
                    </Link>

                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-700 transition-all cursor-pointer border border-purple-700">
                        <Calendar size={20} />
                        <select
                            onChange={(e) => {
                                router.push(`/admin/event-dashboard?type=${e.target.value}`);
                                setIsOpen(false);
                            }}
                            className="bg-white text-purple-900 font-semibold px-2 py-1 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full cursor-pointer"
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Event
                            </option>
                            <option value="endurance">Endurance</option>
                            <option value="duel-team">Duel</option>
                        </select>
                    </div>

                    <Link
                        href="/admin/time-attack"
                        className={navItemClass}
                        onClick={() => setIsOpen(false)}
                    >
                        <Clock size={20} />
                        Time Attack
                    </Link>

                    <button
                        onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-white mt-auto w-full text-left"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </nav>
            </div>

            {/* Overlay (mobile only when sidebar open) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

        </>
    );
}
