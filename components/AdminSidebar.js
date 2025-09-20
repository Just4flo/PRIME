import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Bell, Users, Calendar, Clock, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/config/firebase";
import { motion, AnimatePresence } from "framer-motion";

const auth = getAuth(app);

export default function AdminSidebar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // State untuk setiap dropdown
    const [isMembersOpen, setIsMembersOpen] = useState(false); // <-- State BARU untuk Members
    const [isEventOpen, setIsEventOpen] = useState(false);
    const [isTimeAttackOpen, setIsTimeAttackOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const navItemClass = "flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-purple-700 cursor-pointer";

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
                    <Link href="/admin/announcement" className={navItemClass} onClick={() => setIsOpen(false)}>
                        <Bell size={20} />
                        Announcements
                    </Link>

                    <div className="relative">
                        <button
                            onClick={() => setIsMembersOpen(!isMembersOpen)}
                            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-purple-700 transition-all border border-purple-700 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Users size={20} />
                                <span className="font-semibold">Manage Members</span>
                            </div>
                            <motion.div animate={{ rotate: isMembersOpen ? 180 : 0 }}>
                                <ChevronDown size={20} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isMembersOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 flex flex-col gap-2 pl-6 text-sm"
                                >
                                    <Link href="/admin/update-member" onClick={() => setIsOpen(false)} className="pl-4 py-1 rounded hover:bg-purple-700">- PRIME</Link>
                                    <Link href="/admin/prime_id" onClick={() => setIsOpen(false)} className="pl-4 py-1 rounded hover:bg-purple-700">- PRIME ID</Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        {/* Tombol Pemicu Dropdown */}
                        <button
                            onClick={() => setIsEventOpen(!isEventOpen)}
                            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-purple-700 transition-all border border-purple-700 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={20} />
                                <span className="font-semibold">Event Dashboard</span>
                            </div>
                            <motion.div animate={{ rotate: isEventOpen ? 180 : 0 }}>
                                <ChevronDown size={20} />
                            </motion.div>
                        </button>

                        {/* Menu Dropdown Bertingkat */}
                        <AnimatePresence>
                            {isEventOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 flex flex-col gap-2 pl-6 text-sm" // Diberi indentasi
                                >
                                    {/* Sub-menu PRIME */}
                                    <div className="font-medium text-purple-300">PRIME</div>
                                    <Link href="/admin/event-dashboard?group=prime&type=endurance" onClick={() => setIsOpen(false)} className="pl-4 py-1 rounded hover:bg-purple-700">- Endurance</Link>
                                    <Link href="/admin/event-dashboard?group=prime&type=duel-team" onClick={() => setIsOpen(false)} className="pl-4 py-1 rounded hover:bg-purple-700">- Duel Team</Link>

                                    {/* Sub-menu PRIME ID */}
                                    <div className="font-medium text-purple-300 mt-2">PRIME ID</div>
                                    <Link href="/admin/event-dashboard?group=prime_id&type=endurance" onClick={() => setIsOpen(false)} className="pl-4 py-1 rounded hover:bg-purple-700">- Endurance</Link>
                                    <Link href="/admin/event-dashboard?group=prime_id&type=duel-team" onClick={() => setIsOpen(false)} className="pl-4 py-1 rounded hover:bg-purple-700">- Duel Team</Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsTimeAttackOpen(!isTimeAttackOpen)}
                            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-purple-700 transition-all border border-purple-700 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Clock size={20} />
                                <span className="font-semibold">Time Attack</span>
                            </div>
                            <motion.div animate={{ rotate: isTimeAttackOpen ? 180 : 0 }}>
                                <ChevronDown size={20} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isTimeAttackOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 flex flex-col gap-2 pl-6 text-sm"
                                >
                                    <Link href="/admin/time-attack?group=prime" onClick={() => setIsOpen(false)} className="pl-4 py-1 rounded hover:bg-purple-700">- PRIME</Link>
                                    <Link href="/admin/time-attack?group=prime_id" onClick={() => setIsOpen(false)} className="pl-4 py-1 rounded hover:bg-purple-700">- PRIME ID</Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Tombol Logout */}
                    <button
                        onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-white mt-auto w-full text-left"
                    >
                        <LogOut size={20} />
                        <span className="font-semibold">Logout</span>
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
