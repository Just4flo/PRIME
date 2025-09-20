import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navbar from "@/components/Navbar";

export default function EventLeaderboard() {
    const router = useRouter();
    const { group, event_slug } = router.query;

    const [members, setMembers] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- PERUBAHAN UTAMA DI SINI ---
    // Tentukan nama koleksi event secara dinamis berdasarkan 'group' dan 'event_slug'
    const eventType = event_slug === 'dual-team' ? 'dual_team' : 'endurance';
    const eventCollectionName = group === 'prime_id'
        ? `prime_id_event_${eventType}` // Koleksi untuk PRIME ID
        : `event_${eventType}`;         // Koleksi untuk PRIME

    // Tentukan koleksi member berdasarkan group (logika ini sudah benar)
    const memberCollectionName = group === "prime_id" ? "prime_id" : "members";

    // Fetch semua members dari koleksi yang benar (prime atau prime_id)
    useEffect(() => {
        // Jangan jalankan jika parameter 'group' belum ada
        if (!group) return;
        const fetchMembers = async () => {
            try {
                const snapshot = await getDocs(collection(db, memberCollectionName));
                setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching members:", err);
            }
        };
        fetchMembers();
    }, [group, memberCollectionName]); // Tambahkan group sebagai dependency

    // Fetch participants sesuai event dari koleksi yang benar
    useEffect(() => {
        if (!event_slug || !eventCollectionName) return;
        const fetchParticipants = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, eventCollectionName), orderBy("score", "desc"));
                const snapshot = await getDocs(q);
                setParticipants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error(`Error fetching participants from ${eventCollectionName}:`, err);
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, [event_slug, eventCollectionName]);


    if (!event_slug || !group || loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                Loading leaderboard...
            </div>
        );
    }

    // Logika penggabungan dan sorting data tetap sama
    const memberWithScores = members.map((m) => {
        const p = participants.find((p) => p.Username === m.Username);
        return { ...m, score: p ? p.score : 0 };
    });

    const sortedMembers = memberWithScores.sort((a, b) => {
        if ((b.score ?? 0) !== (a.score ?? 0)) {
            return (b.score ?? 0) - (a.score ?? 0);
        }
        return a.Username.localeCompare(b.Username);
    });

    const formatNumber = (num) => {
        if (!num && num !== 0) return "0";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <div className="min-h-screen bg-white text-black border-4 border-purple-700">
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold text-purple-700 mb-12 text-center uppercase">
                    {group.replace('_', ' ')} - {event_slug === "dual-team" ? "CLUB DUEL" : "ENDURANCE"} LEADERBOARD
                </h1>
                <div className="max-w-3xl mx-auto border-4 border-purple-700 rounded-xl p-6 shadow-lg">
                    <table className="w-full border-collapse rounded-lg table-auto">
                        <thead>
                            <tr className="bg-purple-100 text-purple-700">
                                <th className="border border-purple-300 px-2 py-2">#</th>
                                <th className="border border-purple-300 px-2 py-2 text-left">USERNAME</th>
                                <th className="border border-purple-300 px-2 py-2 text-right">SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMembers.map((m, idx) => (
                                <tr key={m.id} className="text-center even:bg-purple-50">
                                    <td className={`border border-purple-300 px-2 py-2 font-bold ${idx === 0 ? "text-yellow-500" : idx === 1 ? "text-gray-500" : idx === 2 ? "text-orange-500" : ""}`} >
                                        {idx + 1}
                                    </td>
                                    <td className="border border-purple-300 px-2 py-2 text-left">{m.Username}</td>
                                    <td className="border border-purple-300 px-2 py-2 text-right">{formatNumber(m.score)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}