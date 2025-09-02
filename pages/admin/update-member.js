import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import AdminSidebar from "@/components/AdminSidebar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/config/firebase";

const auth = getAuth(app);

export default function MembersPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [newMember, setNewMember] = useState({ Username: "", ID: "", Status: "Good", Peringkat: "Vice Captain" });
    const [toast, setToast] = useState({ message: "", type: "" });
    const [authChecked, setAuthChecked] = useState(false);

    // Proteksi halaman
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = "/login"; // redirect ke login kalau belum login
            } else {
                setAuthChecked(true);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch members
    useEffect(() => {
        if (!authChecked) return;

        const fetchMembers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "members"));
                const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setMembers(data);
            } catch (error) {
                showToast("❌ Gagal mengambil data members", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [authChecked]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

    // Add member
    const handleAddMember = async () => {
        if (!newMember.Username || !newMember.ID) {
            showToast("❌ Username dan ID wajib diisi", "error");
            return;
        }
        try {
            const docRef = await addDoc(collection(db, "members"), newMember);
            setMembers((prev) => [...prev, { id: docRef.id, ...newMember }]);
            showToast("✅ Member berhasil ditambahkan");
            setNewMember({ Username: "", ID: "", Status: "Good", Peringkat: "Vice Captain" });
        } catch (error) {
            console.error(error);
            showToast("❌ Gagal menambahkan member", "error");
        }
    };

    // Update member
    // Update member
    const handleUpdate = async (id, updatedData) => {
        try {
            // Buang field yang undefined
            const cleanData = Object.fromEntries(
                Object.entries(updatedData).filter(([_, v]) => v !== undefined)
            );

            const memberRef = doc(db, "members", id);
            await updateDoc(memberRef, cleanData);

            // Update state di React
            setMembers((prev) =>
                prev.map((m) => (m.id === id ? { ...m, ...cleanData } : m))
            );

            showToast("✅ Member berhasil diupdate");
        } catch (error) {
            console.error("Error update:", error);
            showToast("❌ Gagal update member", "error");
        }
    };

    // Delete member
    const handleDelete = async (id) => {
        if (!confirm("⚠️ Yakin ingin menghapus member ini?")) return;
        try {
            const memberRef = doc(db, "members", id);
            await deleteDoc(memberRef);
            setMembers((prev) => prev.filter((m) => m.id !== id));
            showToast("🗑️ Member berhasil dihapus");
        } catch (error) {
            console.error(error);
            showToast("❌ Gagal menghapus member", "error");
        }
    };

    // Filter members
    const filteredMembers = members.filter(
        (m) =>
            m.Username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.ID?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Status color mapping
    const statusColor = (status) => {
        switch (status) {
            case "Good": return "bg-green-200 text-green-800";
            case "Warning": return "bg-yellow-200 text-yellow-800";
            default: return "";
        }
    };

    if (!authChecked || loading) return <div className="flex items-center justify-center min-h-screen text-white bg-purple-900">Loading...</div>;

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="ml-64 p-8 w-full min-h-screen bg-gradient-to-br from-gray-100 via-purple-200 to-indigo-300 text-black">
                {/* Toast */}
                {toast.message && (
                    <div className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-50 ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
                        {toast.message}
                    </div>
                )}

                <h1 className="text-3xl font-bold mb-6">Manage Members</h1>

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari Username atau ID Game..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="overflow-x-auto bg-gray-100/90 p-6 rounded-2xl shadow-xl text-black max-h-[70vh]">
                    <table className="w-full text-left border-collapse rounded-lg overflow-hidden">
                        <thead className="bg-gray-200 text-gray-700 sticky top-0">
                            <tr>
                                <th className="p-3">Username</th>
                                <th className="p-3">ID Game</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Peringkat</th>
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Row Add Member */}
                            <tr className="border-t bg-white hover:bg-purple-100 transition">
                                <td className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Masukkan Username"
                                        value={newMember.Username}
                                        onChange={(e) => setNewMember({ ...newMember, Username: e.target.value })}
                                        className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 w-full"
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Masukkan ID Game"
                                        value={newMember.ID}
                                        onChange={(e) => setNewMember({ ...newMember, ID: e.target.value })}
                                        className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 w-full"
                                    />
                                </td>
                                <td className="p-3">
                                    <select
                                        value={newMember.Status}
                                        onChange={(e) => setNewMember({ ...newMember, Status: e.target.value })}
                                        className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 w-full"
                                    >
                                        <option value="Good">Good</option>
                                        <option value="Warning">Warning</option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <select
                                        value={newMember.Peringkat || ""}
                                        onChange={(e) => setNewMember({ ...newMember, Peringkat: e.target.value })}
                                        className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 w-full"
                                    >
                                        <option value="">-- Pilih Peringkat --</option>
                                        <option value="Captain">Captain</option>
                                        <option value="Vice Captain">Vice Captain</option>
                                    </select>
                                </td>


                                <td className="p-3">
                                    <button
                                        onClick={handleAddMember}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
                                    >
                                        💾 Tambah
                                    </button>
                                </td>
                            </tr>

                            {/* Rows Update Members */}
                            {filteredMembers.map((member, index) => (
                                <tr key={member.id} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-purple-100 transition`}>
                                    <td className="p-3 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={member.isSelected || false}
                                            onChange={(e) =>
                                                setMembers((prev) =>
                                                    prev.map((m) =>
                                                        m.id === member.id ? { ...m, isSelected: e.target.checked } : m
                                                    )
                                                )
                                            }
                                        />
                                        <input
                                            type="text"
                                            value={member.Username || ""}
                                            onChange={(e) =>
                                                setMembers((prev) =>
                                                    prev.map((m) =>
                                                        m.id === member.id ? { ...m, Username: e.target.value } : m
                                                    )
                                                )
                                            }
                                            className="px-2 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={member.ID || ""}
                                            onChange={(e) =>
                                                setMembers((prev) =>
                                                    prev.map((m) =>
                                                        m.id === member.id ? { ...m, ID: e.target.value } : m
                                                    )
                                                )
                                            }
                                            className="px-2 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={member.Status || "Good"}
                                            onChange={(e) =>
                                                setMembers((prev) =>
                                                    prev.map((m) =>
                                                        m.id === member.id ? { ...m, Status: e.target.value } : m
                                                    )
                                                )
                                            }
                                            className={`px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 w-full ${statusColor(member.Status)}`}
                                        >
                                            <option value="Good">Good</option>
                                            <option value="Warning">Warning</option>
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        {member.isSelected ? (
                                            <select
                                                value={member.Peringkat || ""}
                                                onChange={(e) =>
                                                    setMembers((prev) =>
                                                        prev.map((m) =>
                                                            m.id === member.id ? { ...m, Peringkat: e.target.value } : m
                                                        )
                                                    )
                                                }
                                                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 w-full"
                                            >
                                                <option value="">-- Pilih Peringkat --</option>
                                                <option value="Captain">Captain</option>
                                                <option value="Vice Captain">Vice Captain</option>
                                            </select>
                                        ) : (
                                            member.Peringkat || ""
                                        )}
                                    </td>

                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() =>
                                                handleUpdate(member.id, {
                                                    Username: member.Username || "",
                                                    ID: member.ID || "",
                                                    Status: member.Status || "Good",
                                                    Peringkat: member.Peringkat || "",
                                                })
                                            }
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow transition"
                                        >
                                            💾 Simpan
                                        </button>

                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow transition"
                                        >
                                            🗑️ Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-500">
                                        ❌ Tidak ada member yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
