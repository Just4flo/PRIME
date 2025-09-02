export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-800 via-purple-900 to-black text-white">
            {/* Header/Navbar */}
            <header className="p-4 text-2xl font-bold">Team Profile</header>

            {/* Konten halaman */}
            <main>{children}</main>
        </div>
    );
}
