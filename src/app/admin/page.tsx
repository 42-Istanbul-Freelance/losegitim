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

    return (
        <div className="container fade-in">
            <div className="page-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                    <h1 className="page-title" style={{ textAlign: "left", marginBottom: "5px" }}>Yönetim Paneli (Yetkili)</h1>
                    <p className="page-desc" style={{ textAlign: "left" }}>
                        Tüm konferansları ve katılımcıları yönetin.
                    </p>
                </div>
            </div>

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
