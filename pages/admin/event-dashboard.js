import { useEffect, useState } from "react";
import { db, app } from "@/config/firebase";
import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import AdminSidebar from "@/components/AdminSidebar";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth(app);

// 🔢 Format angka pakai titik (1.000.000)
const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function AdminEventDashboard() {
    const router = useRouter();
    const { type } = router.query; // "endurance" atau "duel-team"

    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({ Username: "", score: "" });
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    // 📂 pilih collection sesuai type
    const collectionName =
        type === "duel-team" ? "event_dual_team" : "event_endurance";

    // 🔒 Proteksi halaman
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login");
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    // 📌 Ambil daftar member
    useEffect(() => {
        const fetchMembers = async () => {
            const snapshot = await getDocs(collection(db, "members"));
            setMembers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };
        fetchMembers();
    }, []);

    // 📌 Ambil daftar peserta sesuai event
    useEffect(() => {
        if (!type) return;
        const fetchParticipants = async () => {
            const q = query(
                collection(db, collectionName),
                orderBy("score", "desc") // urutkan berdasarkan skor tertinggi
            );
            const snapshot = await getDocs(q);
            setParticipants(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };
        fetchParticipants();
    }, [type]);

    // 📌 Submit skor
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.Username || !formData.score) return;

        const scoreValue = parseInt(formData.score.replace(/\./g, ""), 10); // hapus titik sebelum simpan
        if (isNaN(scoreValue)) {
            alert("Skor harus berupa angka valid!");
            return;
        }

        if (participants.find((p) => p.Username === formData.Username)) {
            alert("Username ini sudah memiliki skor, tidak bisa diinput lagi!");
            return;
        }

        try {
            await addDoc(collection(db, collectionName), {
                Username: formData.Username,
                score: scoreValue,
                createdAt: new Date(),
            });
            setFormData({ Username: "", score: "" });

            const snapshot = await getDocs(
                query(collection(db, collectionName), orderBy("score", "desc"))
            );
            setParticipants(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error adding participant:", error);
        }
    };

    // 📌 Hapus semua peserta
    const handleDeleteAll = async () => {
        if (!confirm("Apakah yakin ingin menghapus semua peserta untuk event ini?"))
            return;
        try {
            const snapshot = await getDocs(collection(db, collectionName));
            const batchDelete = snapshot.docs.map((d) =>
                deleteDoc(doc(db, collectionName, d.id))
            );
            await Promise.all(batchDelete);

            setParticipants([]);
            alert("Semua peserta telah dihapus!");
        } catch (error) {
            console.error("Error deleting all participants:", error);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center">Loading...</div>
        );
    if (!type)
        return (
            <div className="min-h-screen flex items-center justify-center">
                Pilih event terlebih dahulu dari sidebar
            </div>
        );

    return (
        <div className="flex min-h-screen bg-white text-black">
            <AdminSidebar />

            <div className="flex-1 px-8 py-16">
                <h1 className="text-4xl font-bold text-purple-700 mb-12 text-center">
                    {type === "duel-team" ? "Duel Team" : "Endurance"} Dashboard
                </h1>

                <div className="border-4 border-purple-700 rounded-xl p-6 shadow-lg max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-purple-700 mb-4">
                        Form Input {type === "duel-team" ? "Duel Team" : "Endurance"}
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <select
                            required
                            value={formData.Username}
                            onChange={(e) =>
                                setFormData({ ...formData, Username: e.target.value })
                            }
                            className="border-2 border-purple-700 rounded-lg p-3"
                        >
                            <option value="">Pilih Username</option>
                            {members.map((m) => (
                                <option
                                    key={m.id}
                                    value={m.Username}
                                    disabled={participants.some((p) => p.Username === m.Username)}
                                >
                                    {m.Username}{" "}
                                    {participants.some((p) => p.Username === m.Username)
                                        ? "(Sudah input)"
                                        : ""}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Masukkan Skor (contoh: 1.000.000)"
                            value={formData.score}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\./g, "");
                                if (!isNaN(raw)) {
                                    setFormData({
                                        ...formData,
                                        score: formatNumber(raw),
                                    });
                                }
                            }}
                            className="border-2 border-purple-700 rounded-lg p-3"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-purple-700 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Submit
                        </button>
                    </form>

                    {participants.length > 0 && (
                        <div className="mt-6">
                            <button
                                onClick={handleDeleteAll}
                                className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg mb-4"
                            >
                                Reset Skor Event (Hapus Semua Peserta)
                            </button>

                            <h3 className="text-xl font-bold text-purple-700 mb-2">
                                Peringkat Peserta
                            </h3>
                            <table className="w-full border border-purple-300 rounded-lg table-auto">
                                <thead>
                                    <tr className="bg-purple-100 text-purple-700">
                                        <th className="border border-purple-300 px-2 py-1">#</th>
                                        <th className="border border-purple-300 px-2 py-1">
                                            Username
                                        </th>
                                        <th className="border border-purple-300 px-2 py-1">
                                            Skor
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((p, idx) => (
                                        <tr key={p.id} className="text-center">
                                            <td className="border border-purple-300 px-2 py-1">
                                                {idx + 1}
                                            </td>
                                            <td className="border border-purple-300 px-2 py-1">
                                                {p.Username}
                                            </td>
                                            <td className="border border-purple-300 px-2 py-1">
                                                {formatNumber(p.score)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
