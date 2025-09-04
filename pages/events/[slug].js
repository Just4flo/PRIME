import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navbar from "@/components/Navbar";

export default function EventLeaderboard() {
    const router = useRouter();
    const { slug } = router.query; // "endurance" atau "dual-team"

    const [members, setMembers] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    const collectionName = slug === "dual-team" ? "event_dual_team" : "event_endurance";

    // Fetch semua members
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const snapshot = await getDocs(collection(db, "members"));
                setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching members:", err);
            }
        };
        fetchMembers();
    }, []);

    // Fetch participants sesuai event
    useEffect(() => {
        if (!slug) return;
        const fetchParticipants = async () => {
            try {
                // ambil data berdasarkan score terbesar
                const q = query(collection(db, collectionName), orderBy("score", "desc"));
                const snapshot = await getDocs(q);
                setParticipants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching participants:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, [slug]);

    if (!slug) return <div>Loading...</div>;
    if (loading) return <div>Loading leaderboard...</div>;

    // Gabungkan semua member dengan score peserta (jika ada)
    const memberWithScores = members.map((m) => {
        const p = participants.find((p) => p.Username === m.Username);
        return {
            ...m,
            score: p ? p.score : 0, // default 0 kalau belum ada score
        };
    });

    // Urutkan berdasarkan score terbesar
       const sortedMembers = memberWithScores.sort((a, b) => {
        if ((b.score ?? 0) !== (a.score ?? 0)) {
            return (b.score ?? 0) - (a.score ?? 0);
        }
        return a.Username.localeCompare(b.Username);
    });

    return (
        <div className="min-h-screen bg-white text-black border-4 border-purple-700">
            <Navbar />

            <div className="container mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold text-purple-700 mb-12 text-center">
                    {slug === "dual-team" ? "CLUB DUEL TEAM" : "ENDURANCE"} LEADERBOARD
                </h1>


                <div className="max-w-3xl mx-auto border-4 border-purple-700 rounded-xl p-6 shadow-lg">
                    <table className="w-full border border-purple-300 rounded-lg table-auto">
                        <thead>
                            <tr className="bg-purple-100 text-purple-700">
                                <th className="border border-purple-300 px-2 py-1">#</th>
                                <th className="border border-purple-300 px-2 py-1">USERNAME</th>
                                <th className="border border-purple-300 px-2 py-1">SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMembers.map((m, idx) => (
                                <tr key={m.id} className="text-center">
                                    <td
                                        className={`border border-purple-300 px-2 py-1 font-bold ${idx === 0
                                                ? "text-yellow-500"
                                                : idx === 1
                                                    ? "text-gray-500"
                                                    : idx === 2
                                                        ? "text-orange-500"
                                                        : ""
                                            }`}
                                    >
                                        {idx + 1}
                                    </td>
                                    <td className="border border-purple-300 px-2 py-1">{m.Username}</td>
                                    <td className="border border-purple-300 px-2 py-1">{m.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

