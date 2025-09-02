import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/config/firebase";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore";

export default function AdminDashboard() {
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ambil semua note terbaru dulu
    const fetchNotes = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setNotes(data);
        } catch (err) {
            console.error("Error fetch notes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // Tambah note baru dengan timestamp
    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!note.trim()) {
            alert("⚠️ Note tidak boleh kosong!");
            return;
        }

        try {
            await addDoc(collection(db, "notes"), {
                text: note,
                createdAt: serverTimestamp(),
            });
            setNote("");
            fetchNotes();
        } catch (err) {
            console.error("Error add note:", err);
        }
    };

    // Hapus note
    const handleDeleteNote = async (id) => {
        if (!confirm("Apakah yakin ingin menghapus note ini?")) return;

        try {
            await deleteDoc(doc(db, "notes", id));
            fetchNotes();
        } catch (err) {
            console.error("Error delete note:", err);
        }
    };

    // Format timestamp
    const formatDate = (ts) => {
        if (!ts?.toDate) return "-";
        const d = ts.toDate();
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    };

    return (
        <ProtectedRoute>
            <div className="flex">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Konten Dashboard */}
                <div className="ml-64 p-8 w-full min-h-screen bg-gradient-to-br from-gray-100 via-purple-200 to-indigo-300 text-black">
                    <h1 className="text-4xl font-bold mb-6">
                        Selamat Datang di Admin Dashboard
                    </h1>
                    <p className="text-lg mb-6">
                        Pilih menu di sidebar untuk mengelola data.
                    </p>

                    {/* Form Note */}
                    <form
                        onSubmit={handleAddNote}
                        className="bg-white/90 p-6 rounded-2xl shadow-xl mb-8"
                    >
                        <h2 className="text-2xl font-semibold mb-4">Tambah Note</h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Tulis note..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="p-3 border rounded-lg flex-1"
                            />
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow transition"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>

                    {/* Daftar Note */}
                    <div className="bg-white/90 p-6 rounded-2xl shadow-xl">
                        <h2 className="text-2xl font-semibold mb-4">Daftar Note</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : notes.length > 0 ? (
                            <ul className="space-y-3">
                                {notes.map((n) => (
                                    <li
                                        key={n.id}
                                        className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                                    >
                                        <div>
                                            <p>{n.text}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(n.createdAt)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteNote(n.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Hapus
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600">❌ Belum ada note</p>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
