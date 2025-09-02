import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    writeBatch,
} from "firebase/firestore";
import AdminSidebar from "@/components/AdminSidebar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/config/firebase";
import * as XLSX from "xlsx";
import Image from "next/image";

const auth = getAuth(app);

export default function AdminTimeAttackSessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [times, setTimes] = useState({});

    // form state
    const [mapName, setMapName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // 🔒 Proteksi login
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = "/login";
            } else {
                setAuthChecked(true);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch semua sesi
    const fetchSessions = async () => {
        setLoading(true);
        try {
            // Ambil semua sesi
            const snapshot = await getDocs(collection(db, "team_attack_sessions"));
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setSessions(data);

            // Ambil semua members
            const membersSnap = await getDocs(collection(db, "members"));
            const membersData = membersSnap.docs.map((m) => ({
                id: m.id,
                ...m.data(),
            }));

            // Ambil semua time_attack
            const attackSnap = await getDocs(collection(db, "team_attack"));
            const attackData = attackSnap.docs.map((t) => ({
                id: t.id,
                ...t.data(),
            }));

            // Merge per sesi
            const timesData = {};
            for (let s of data) {
                const merged = membersData.map((m) => {
                    const attack = attackData.find((a) => a.Username === m.Username);
                    return {
                        Username: m.Username,
                        time: attack ? attack.time : null,
                        imageUrl: attack ? attack.imageUrl : null, // ✅ tambahkan ini
                    };
                });


                // urutkan berdasarkan waktu (null di bawah)
                merged.sort((a, b) => {
                    if (a.time === null) return 1;
                    if (b.time === null) return -1;
                    return a.time - b.time;
                });

                timesData[s.id] = merged;
            }

            setTimes(timesData);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authChecked) fetchSessions();
    }, [authChecked]);

    // Tambah sesi baru
    const handleAddSession = async (e) => {
        e.preventDefault();
        if (!mapName || !startDate || !endDate) {
            alert("Lengkapi semua field!");
            return;
        }

        try {
            await addDoc(collection(db, "team_attack_sessions"), {
                mapName,
                startDate,
                endDate,
            });
            alert("✅ Sesi baru berhasil ditambahkan!");
            setMapName("");
            setStartDate("");
            setEndDate("");
            fetchSessions();
        } catch (error) {
            console.error(error);
            alert("❌ Gagal menambahkan sesi.");
        }
    };

    // Hapus sesi + semua time_attack yang terkait
    const handleDeleteSession = async (id) => {
        if (!confirm("⚠️ Apakah kamu yakin ingin menghapus sesi ini?")) return;

        try {
            await deleteDoc(doc(db, "team_attack_sessions", id));
            alert("✅ Sesi berhasil dihapus!");
            fetchSessions();
        } catch (error) {
            console.error(error);
            alert("❌ Gagal menghapus sesi.");
        }
    };

    // Hapus semua data di team_attack
    const handleDeleteAllTimeAttack = async () => {
        if (!confirm("⚠️ Apakah kamu yakin ingin menghapus semua data Time Attack?")) return;

        try {
            const snap = await getDocs(collection(db, "team_attack"));
            const batch = writeBatch(db);

            for (let d of snap.docs) {
                const { public_id } = d.data();

                // 🔑 Hapus gambar di Cloudinary kalau ada
                if (public_id) {
                    try {
                        await fetch("/api/deleteImage", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ public_id }),
                        });
                    } catch (err) {
                        console.error("❌ Gagal hapus gambar Cloudinary:", err);
                    }
                }
                batch.delete(d.ref);
            }
            await batch.commit();
            alert("✅ Semua data & gambar Time Attack berhasil dihapus!");
            fetchSessions();
        } catch (error) {
            console.error(error);
            alert("❌ Gagal menghapus Time Attack.");
        }
    };

    // Export ke Excel
    const handleExportExcel = (sessionId) => {
        const session = sessions.find((s) => s.id === sessionId);
        const data = times[sessionId] || [];

        const worksheet = XLSX.utils.json_to_sheet(
            data.map((t, index) => ({
                Rank: t.time ? index + 1 : "-",
                Username: t.Username,
                Time: t.time ? formatTime(t.time) : "-",
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TimeAttack");

        XLSX.writeFile(
            workbook,
            `TimeAttack_${session.mapName}_${session.startDate}-${session.endDate}.xlsx`
        );
    };

    // Format waktu → menit:detik:milidetik
    const formatTime = (ms) => {
        if (!ms) return "-";
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const millis = ms % 1000;
        return `${minutes}:${seconds.toString().padStart(2, "0")}.${millis
            .toString()
            .padStart(3, "0")}`;
    };

    if (!authChecked)
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Konten Dashboard */}
            <div className="ml-64 p-8 w-full min-h-screen bg-gradient-to-br from-gray-100 via-purple-200 to-indigo-300 text-black">
                <h1 className="text-4xl font-bold mb-6">🗂️ Kelola Sesi Time Attack</h1>

                {/* Form tambah sesi */}
                <form onSubmit={handleAddSession} className="bg-white/90 p-6 rounded-2xl shadow-xl mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Tambah Sesi Baru</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Nama Map"
                            value={mapName}
                            onChange={(e) => setMapName(e.target.value)}
                            className="p-3 border rounded-lg w-full"
                        />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-3 border rounded-lg w-full"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-3 border rounded-lg w-full"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow transition"
                    >
                        Tambah Sesi
                    </button>
                </form>

                {/* Daftar sesi */}
                {loading ? (
                    <p>Loading data...</p>
                ) : sessions.length > 0 ? (
                    sessions.map((item) => (
                        <div key={item.id} className="mb-8">
                            {/* Border Map */}
                            <div className="overflow-x-auto bg-white/90 p-6 rounded-2xl shadow-xl mb-4">
                                <h2 className="text-xl font-bold mb-3">🗺️ {item.mapName}</h2>
                                <table className="w-full text-left border-collapse rounded-lg overflow-hidden">
                                    <thead className="bg-purple-700 text-white">
                                        <tr>
                                            <th className="p-3">Tanggal Mulai</th>
                                            <th className="p-3">Tanggal Selesai</th>
                                            <th className="p-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t border-purple-600 hover:bg-purple-100 transition">
                                            <td className="p-3">{item.startDate}</td>
                                            <td className="p-3">{item.endDate}</td>
                                            <td className="p-3 space-x-2">
                                                <button
                                                    onClick={() => handleDeleteSession(item.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                                >
                                                    Hapus Sesi
                                                </button>

                                                <button
                                                    onClick={() => handleExportExcel(item.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                                >
                                                    Export Excel
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Border Time Attack */}
                            {/* Border Time Attack */}
                            <div className="overflow-x-auto bg-gray-50 border border-gray-400 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">⏱️ Time Attack</h3>

                                <button
                                    onClick={handleDeleteAllTimeAttack}
                                    className="mb-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Hapus Semua Time Attack
                                </button>

                                <table className="w-full text-left border-collapse rounded-lg overflow-hidden">
                                    <thead className="bg-indigo-600 text-white">
                                        <tr>
                                            <th className="p-3">Rank</th>
                                            <th className="p-3">Username</th>
                                            <th className="p-3">Time</th>
                                            <th className="p-3">Gambar</th> {/* Tambah kolom */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {times[item.id] && times[item.id].length > 0 ? (
                                            times[item.id].map((t, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-t border-gray-300 hover:bg-indigo-50 transition"
                                                >
                                                    <td className="p-3">{t.time ? i + 1 : "-"}</td>
                                                    <td className="p-3">{t.Username}</td>
                                                    <td className="p-3">{formatTime(t.time)}</td>
                                                    <td className="p-3">
                                                        {t.imageUrl ? (
                                                            <Image
                                                                src={t.imageUrl}
                                                                alt={t.Username}
                                                                width={64}
                                                                height={64}
                                                                className="rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <span>Belum upload</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-3 text-gray-500">
                                                    ❌ Belum ada data member
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>


                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">❌ Belum ada sesi</p>
                )}
            </div>
        </div>
    );
}
