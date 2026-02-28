"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Types
type User = {
    id: string;
    name: string;
    tcNo: string;
};

type Registration = {
    id: string;
    user: User;
    createdAt: string;
};

type Conference = {
    id: string;
    title: string;
    date: string;
    category: string;
    location: string;
    registrations: Registration[];
};

export default function AdminDashboard() {
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [loading, setLoading] = useState(true);

    // Açık/Kapalı Kategorileri Tutma
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // Yeni Eğitmen Form Stateleri
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [newUserTc, setNewUserTc] = useState("");
    const [newUserPass, setNewUserPass] = useState("");
    const [addUserMsg, setAddUserMsg] = useState({ text: "", type: "" });
    const [addLoading, setAddLoading] = useState(false);

    const router = useRouter();

    // Basit Admin Kontrolü
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }

        const userData = JSON.parse(storedUser);

        // Uygulama gerçekte kimlerin Yetkili (ADMIN) olduğunu tespit etmelidir.
        // Şimdilik egitmen@losev.org.tr üzerinden deneme yapıyoruz.
        // İleride if(userData.role !== 'ADMIN') tarzı engellenecek.
    }, [router]);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await fetch("/api/admin/conferences");
                const data = await res.json();
                setConferences(data);
            } catch (err) {
                console.error("Veri çekilemedi", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddUserMsg({ text: "", type: "" });

        try {
            const res = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newUserName, tcNo: newUserTc, password: newUserPass }),
            });

            const data = await res.json();

            if (res.ok) {
                setAddUserMsg({ text: data.message, type: "success" });
                setNewUserName("");
                setNewUserTc("");
                setNewUserPass("");
                // Bir süre sonra mesajı temizle
                setTimeout(() => {
                    setShowAddUser(false);
                    setAddUserMsg({ text: "", type: "" });
                }, 2500);
            } else {
                setAddUserMsg({ text: data.message, type: "error" });
            }
        } catch (err) {
            setAddUserMsg({ text: "Bağlantı hatası oluştu.", type: "error" });
        } finally {
            setAddLoading(false);
        }
    };

    return (
        <div className="container fade-in">
            <div className="page-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                    <h1 className="page-title" style={{ textAlign: "left", marginBottom: "5px" }}>Yönetim Paneli (Yetkili)</h1>
                    <p className="page-desc" style={{ textAlign: "left" }}>
                        Tüm konferansları, katılımcıları yönetin ve yeni eğitmen ekleyin.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddUser(!showAddUser)}
                    className={showAddUser ? "btn-secondary" : "btn-primary"}
                >
                    {showAddUser ? "Kapat" : "+ Yeni Eğitmen Ekle"}
                </button>
            </div>

            {showAddUser && (
                <div style={{ background: "var(--white)", padding: "24px", borderRadius: "16px", marginBottom: "30px", boxShadow: "var(--shadow-lg)", border: "1px solid #e2e8f0" }} className="fade-in">
                    <h3 style={{ marginBottom: "15px", color: "var(--primary-color)" }}>Sisteme Eğitmen Tanımla</h3>

                    {addUserMsg.text && (
                        <div style={{ padding: "10px", marginBottom: "15px", borderRadius: "8px", background: addUserMsg.type === "success" ? "#dcfce3" : "#fee2e2", color: addUserMsg.type === "success" ? "#166534" : "#991b1b" }}>
                            {addUserMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleAddUser} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", alignItems: "end" }}>
                        <div>
                            <label className="form-label" htmlFor="newUserName">Ad Soyad</label>
                            <input
                                type="text" id="newUserName" className="form-input"
                                value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required
                            />
                        </div>
                        <div>
                            <label className="form-label" htmlFor="newUserTc">TC Kimlik No</label>
                            <input
                                type="text" id="newUserTc" className="form-input"
                                value={newUserTc} onChange={(e) => setNewUserTc(e.target.value)}
                                maxLength={11} pattern="\d{11}" title="11 haneli TC no giriniz" required
                            />
                        </div>
                        <div>
                            <label className="form-label" htmlFor="newUserPass">Geçici Şifre</label>
                            <input
                                type="text" id="newUserPass" className="form-input"
                                value={newUserPass} onChange={(e) => setNewUserPass(e.target.value)} required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={addLoading} style={{ height: "46px" }}>
                            {addLoading ? "Ekleniyor..." : "Kaydet"}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ padding: "10px 0" }}>
                {loading ? (
                    <p style={{ textAlign: "center" }}>Veriler Yükleniyor...</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {Array.from(new Set(conferences.map(c => c.category))).map(category => (
                            <div key={category} style={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                                <button
                                    onClick={() => {
                                        if (expandedCategories.includes(category)) {
                                            setExpandedCategories(expandedCategories.filter(c => c !== category));
                                        } else {
                                            setExpandedCategories([...expandedCategories, category]);
                                        }
                                    }}
                                    style={{
                                        width: "100%", padding: "18px 24px", background: "var(--white)", border: "none",
                                        display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                                        fontWeight: "600", fontSize: "18px", color: "var(--text-dark)", transition: "var(--transition)"
                                    }}
                                >
                                    <span>📂 {category} Kategorisi ({conferences.filter(c => c.category === category).length} Konferans)</span>
                                    <span>{expandedCategories.includes(category) ? "▲" : "▼"}</span>
                                </button>

                                {expandedCategories.includes(category) && (
                                    <div style={{ padding: "20px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "20px" }}>
                                        {conferences.filter(c => c.category === category).map((conf) => (
                                            <div key={conf.id} style={{ background: "var(--white)", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                                                    <div>
                                                        <h2 style={{ fontSize: "20px", color: "var(--primary-color)", marginBottom: "5px" }}>{conf.title}</h2>
                                                        <p style={{ color: "var(--text-light)", fontSize: "13px" }}>
                                                            📅 {new Date(conf.date).toLocaleDateString("tr-TR")} | 📍 {conf.location} | Katılımcı: <strong>{conf.registrations.length} kişi</strong>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: "15px" }}>
                                                    <h4 style={{ marginBottom: "10px", color: "var(--text-dark)", fontSize: "15px" }}>Katılımcı / Eğitmen Listesi</h4>
                                                    {conf.registrations.length === 0 ? (
                                                        <p style={{ fontSize: "14px", color: "var(--text-light)", fontStyle: "italic" }}>
                                                            Henüz bu konferansa kayıt olan eğitmen yok.
                                                        </p>
                                                    ) : (
                                                        <div style={{ overflowX: "auto" }}>
                                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                                                <thead>
                                                                    <tr style={{ background: "#f1f5f9", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>
                                                                        <th style={{ padding: "10px", borderTopLeftRadius: "6px" }}>Kayıt Tarihi</th>
                                                                        <th style={{ padding: "10px" }}>Ad Soyad</th>
                                                                        <th style={{ padding: "10px" }}>TC Kimlik No</th>
                                                                        <th style={{ padding: "10px", borderTopRightRadius: "6px" }}>Sertifika Durumu</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {conf.registrations.map((reg) => (
                                                                        <tr key={reg.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                                            <td style={{ padding: "10px", color: "var(--text-light)" }}>
                                                                                {new Date(reg.createdAt).toLocaleDateString("tr-TR")}
                                                                            </td>
                                                                            <td style={{ padding: "10px", fontWeight: "600" }}>{reg.user.name}</td>
                                                                            <td style={{ padding: "10px" }}>{reg.user.tcNo}</td>
                                                                            <td style={{ padding: "10px", color: "#16a34a", fontWeight: "600" }}>
                                                                                Katılım Sağlanacak
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
