import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FaInstagram, FaTwitter, FaDiscord, FaYoutube } from "react-icons/fa";

// Data Event Dummy
const events = [
  { id: 1, title: "CLUB ENDURANCE", image: "/pc wallpaper.jpeg", slug: "endurance" },
  { id: 2, title: "CLUB DUEL", image: "/download (2).jpeg", slug: "dual-team" },
];



export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Poppins] flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Carousel Fullscreen */}
      <main className="relative h-screen w-full overflow-hidden">
        {events.map((event, index) => (
          <Link
            key={event.id}
            href={`/events/${event.slug}`} // mengarah ke halaman form/leaderboard sesuai event
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/40 to-transparent"></div>
            <div className="absolute bottom-24 left-12 text-white animate-fadeIn">
              <h2 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">{event.title}</h2>
            </div>
          </Link>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-8 mt-auto">
        <div className="container mx-auto text-center space-y-3">
          <p>© 2025 PRIME. Semua hak cipta dilindungi.</p>
          <div className="flex justify-center items-center gap-6 text-2xl mt-2">
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors"><FaInstagram /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors"><FaTwitter /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors"><FaDiscord /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors"><FaYoutube /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
