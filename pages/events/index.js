import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";

export default function EventList() {
    const router = useRouter();

    const events = [
        {
            id: 1,
            title: "CLUB ENDURANCE",
            image: "/pc wallpaper.jpeg",
            slug: "endurance",
        },
        {
            id: 2,
            title: "CLUB DUEL",
            image: "/download (2).jpeg",
            slug: "dual-team",
        },
    ];

    // Arahkan ke halaman form/leaderboard sesuai slug
    const handleClick = (slug) => {
        router.push(`/events/${slug}`); // ✅ langsung ke /events/slug
    };

    return (
        <div className="min-h-screen bg-white text-black border-4 border-purple-700">
            <Navbar />

            <div className="container mx-auto px-4 py-16">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-4xl md:text-6xl font-extrabold text-center mb-12 text-purple-700"
                >
                    Club Events
                </motion.h1>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {events.map((event) => (
                        <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.03 }}
                            className="border-4 border-purple-700 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all"
                            onClick={() => handleClick(event.slug)}
                        >
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 bg-white">
                                <h3 className="text-xl font-bold text-purple-700 mb-2">{event.title}</h3>
                                <p className="text-gray-700">{event.date}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
