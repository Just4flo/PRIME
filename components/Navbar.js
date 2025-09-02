import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Home, Menu, Users, Calendar, Clock, LogIn, Info } from "lucide-react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-purple-900 via-purple-700 to-purple-600 bg-opacity-95 backdrop-blur-md shadow-xl flex justify-between items-center px-8 py-4 h-23">
                {/* Logo + Nama */}
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="object-cover"
                    />
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide drop-shadow-lg animate-pulse">
                        <span className="text-purple-300">PRIME</span>
                    </h1>
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:flex gap-8 text-white font-semibold text-lg">
                    <Link href="/" className="flex items-center gap-2 hover:text-purple-300 transition">
                        <Home size={20} /> HomePage
                    </Link>
                    <Link href="/about" className="flex items-center gap-2 hover:text-purple-300 transition">
                        <Info size={20} /> About us
                    </Link>
                    <Link href="/member" className="flex items-center gap-2 hover:text-purple-300 transition">
                        <Users size={20} /> Members
                    </Link>
                    <Link href="/events" className="flex items-center gap-2 hover:text-purple-300 transition">
                        <Calendar size={20} /> Events
                    </Link>
                    <Link href="/time-attack" className="flex items-center gap-2 hover:text-purple-300 transition">
                        <Clock size={20} /> Time Attack
                    </Link>
                    <Link href="/login" className="flex items-center gap-2 hover:text-purple-300 transition">
                        <LogIn size={20} /> Login
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden bg-purple-700 px-4 py-2 rounded-lg text-white hover:bg-purple-500 transition"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <Menu size={24} />
                </button>
            </header>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <nav className="absolute top-20 left-0 w-full bg-purple-900 bg-opacity-95 flex flex-col gap-5 px-6 py-6 md:hidden z-40 text-white text-lg font-medium animate-slideDown">
                    <Link href="/" className="flex items-center gap-3 hover:text-purple-300" onClick={() => setMenuOpen(false)}><Home /> HomePage</Link>
                    <Link href="/about" className="flex items-center gap-3 hover:text-purple-300" onClick={() => setMenuOpen(false)}><Info /> About us</Link>
                    <Link href="/member" className="flex items-center gap-3 hover:text-purple-300" onClick={() => setMenuOpen(false)}><Users /> Members</Link>
                    <Link href="/events" className="flex items-center gap-3 hover:text-purple-300" onClick={() => setMenuOpen(false)}><Calendar /> Event</Link>
                    <Link href="/time-attack" className="flex items-center gap-3 hover:text-purple-300" onClick={() => setMenuOpen(false)}><Clock /> Time Attack</Link>
                    <Link href="/login" className="flex items-center gap-3 hover:text-purple-300" onClick={() => setMenuOpen(false)}><LogIn /> Login</Link>
                </nav>
            )}
        </>
    );
}
