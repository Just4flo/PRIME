import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Users, Calendar, Clock, LogOut } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/config/firebase";

const auth = getAuth(app);

export default function AdminSidebar() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login"); // redirect to login after logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItemClass = "flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-purple-700 cursor-pointer";

    return (
        <div className="w-64 h-screen bg-purple-900 text-white flex flex-col p-4 fixed left-0 top-0 shadow-xl">
            <h2 className="text-2xl font-bold mb-8 text-center">Admin Panel</h2>

            <nav className="flex flex-col space-y-3">
                {/* Dashboard */}
                <Link href="/admin" className={navItemClass}>
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                {/* Manage Members */}
                <Link href="/admin/update-member" className={navItemClass}>
                    <Users size={20} />
                    Manage Members
                </Link>

                {/* Event Dropdown */}
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-700 transition-all cursor-pointer border border-purple-700">
                    <Calendar size={20} />
                    <select
                        onChange={(e) => router.push(`/admin/event-dashboard?type=${e.target.value}`)}
                        className="bg-white text-purple-900 font-semibold px-2 py-1 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full cursor-pointer"
                        defaultValue=""
                    >
                        <option value="" disabled className="text-gray-500 font-bold">
                            Event
                        </option>
                        <option value="endurance" className="font-bold hover:bg-purple-200">
                            Endurance
                        </option>
                        <option value="duel-team" className="font-bold hover:bg-purple-200">
                            Duel
                        </option>
                    </select>
                </div>

                {/* Time Attack */}
                <Link href="/admin/time-attack" className={navItemClass}>
                    <Clock size={20} />
                    Time Attack
                </Link>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-white mt-auto w-full text-left"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </nav>
        </div>
    );
}

