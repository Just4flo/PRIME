
import { useEffect } from "react";
import { db } from "@/config/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ImportMembersBulk() {
    useEffect(() => {
        const membersData = [
            { Username: "PRIME•DrianBHY4", ID: "6963769718" },
            { Username: "PRIME•BeamSigma", ID: "6948363131" },
            { Username: "PRIME•klikli", ID: "6933213673" },
            { Username: "PRIME•Zharxkk", ID: "6910361719" },
            { Username: "PRIME•Void", ID: "6896100685" },
            { Username: "PRIME•NiA", ID: "6859400523" },
            { Username: "PRIME•LanaDReyy", ID: "6811692052" },
            { Username: "PRIME•DaddyKat", ID: "6787278656" },
            { Username: "PRIME•Kaelrin", ID: "6784386934" },
            { Username: "PRIME•EnvyMoon", ID: "6764514894" },
            { Username: "PRIME•ClonelCE", ID: "6669828091" },
            { Username: "PRIME•Smalmo", ID: "6663099755" },
            { Username: "PRIME•Nekciv", ID: "6635232227" },
            { Username: "PRIME•Edo", ID: "6577806674" },
            { Username: "PRIME•Chrownles", ID: "6568653275" },
            { Username: "PRIME•Meryn", ID: "6553973145" },
            { Username: "PRIME•BENKAI", ID: "6451151324" },
            { Username: "PRIME•Noox", ID: "6427397559" },
            { Username: "PRIME•zenn", ID: "6419329715" },
            { Username: "PRIME•Ferranzo", ID: "6411809529" },
            { Username: "PRIME•Brotozz", ID: "6396207093" },
            { Username: "PRIME•V A Y U", ID: "6336736832" },
            { Username: "PRIME•CrownZero", ID: "6309489440" },
            { Username: "PRIME•I Y O N", ID: "6291399328" },
            { Username: "PRIME•Mengg", ID: "6246010512" },
            { Username: "PRIME•OZORA", ID: "6238895215" },
            { Username: "PRIME•INSTHINX" },
            { Username: "PRIME•HanSoHee" },
            { Username: "PRIME•Younjung" },
            { Username: "PRIME•r4ceGOD" },
            { Username: "PRIME•Chiaa" },
            { Username: "PRIME•Fluffy" },
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
