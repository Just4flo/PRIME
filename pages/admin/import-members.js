
import { useEffect } from "react";
import { db } from "@/config/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ImportMembersBulk() {
    useEffect(() => {
        const membersData = [
            { Username: "PRIMEID • ASEP", ID: "6963769718" },
            { Username: "PRIME ID • UKAR", ID: "6948363131" },
            { Username: "PRIME ID • KIPLI", ID: "6933213673" },
            { Username: "PRIME ID • SUSANTO", ID: "6910361719" },
        ];

        const importMembers = async () => {
            try {
                // Buat array promise untuk semua member
                const promises = membersData.map((member) => {
                    return addDoc(collection(db, "members"), {
                        Username: member.Username,
                        ID: member.ID || Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                        Status: "Good",
                    });
                });

                await Promise.all(promises); // Tunggu semua selesai
                console.log("✅ Semua member berhasil ditambahkan sekaligus!");
            } catch (error) {
                console.error("❌ Error saat import members:", error);
            }
        };

        importMembers();
    }, []);

    return <div className="p-8 text-white">Mengimpor member ke Firestore (bulk)...</div>;
}
