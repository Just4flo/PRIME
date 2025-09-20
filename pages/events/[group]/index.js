import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function EventGroupPage() {
    const router = useRouter();
    const { group } = router.query; // Akan berisi "prime" atau "prime_id"

    // Data event spesifik (Endurance & Duel)
    const specificEvents = [
        {
            id: 1,
            title: "CLUB ENDURANCE",
            image: "/3.jpeg",
            slug: "endurance",
        },
        {
            id: 2,
            title: "CLUB DUEL",
            image: "/download (3).jpeg",
            slug: "dual-team",
        },
    ];

    if (!group) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white text-black border-4 border-purple-700">
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-4xl md:text-6xl font-extrabold text-center mb-12 text-purple-700 uppercase"
                >
                    {group.replace('_', ' ')} Events
                </motion.h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {specificEvents.map((event) => (
                        // Arahkan ke halaman leaderboard final
                        // contoh: /events/prime/endurance
                        <Link key={event.id} href={`/events/${group}/${event.slug}`} passHref>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="border-4 border-purple-700 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all"
                            >
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4 bg-white">
                                    <h3 className="text-xl font-bold text-purple-700 mb-2">{event.title}</h3>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}