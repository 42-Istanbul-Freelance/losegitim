"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Types
type User = {
    id: string;
    name: string;
    tcNo: string;
};

type UserFull = {
    id: string;
    name: string;
    surname: string;
    tcNo: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    schoolName: string;
    role: string;
    createdAt: string;
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

type Tab = "conferences" | "users";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("conferences");
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [users, setUsers] = useState<UserFull[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const router = useRouter();

    // ADMIN kontrolü
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) { router.push("/login"); return; }
        const userData = JSON.parse(storedUser);
        if (userData.role !== "ADMIN") { router.push("/"); return; }
    }, [router]);

    // Konferansları yükle
    useEffect(() => {
        fetch("/api/admin/conferences")
            .then(r => r.json())
            .then(data => setConferences(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Kullanıcıları yükle (her sekme değişiminde + arama)
    useEffect(() => {
        if (activeTab !== "users") return;
        setUsersLoading(true);
        const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
        fetch(`/api/admin/users${query}`)
            .then(r => r.json())
            .then(data => setUsers(data))
            .catch(err => console.error(err))
            .finally(() => setUsersLoading(false));
    }, [activeTab, searchQuery]);

    const tabStyle = (tab: Tab) => ({
        padding: "12px 28px",
        fontWeight: "600",
        fontSize: "15px",
        border: "none",
        borderBottom: activeTab === tab ? "3px solid var(--primary-color)" : "3px solid transparent",
        background: "none",
        color: activeTab === tab ? "var(--primary-color)" : "var(--text-light)",
        cursor: "pointer",
        transition: "all 0.2s",
    } as React.CSSProperties);

    return (
        <div className="container fade-in">
            <div style={{ marginBottom: "20px" }}>
                <h1 className="page-title" style={{ textAlign: "left", marginBottom: "5px" }}>Yönetim Paneli</h1>
                <p className="page-desc" style={{ textAlign: "left" }}>Konferansları, katılımcıları ve kullanıcıları yönetin.</p>
            </div>

            {/* Sekmeler */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "28px", gap: "4px" }}>
                <button style={tabStyle("conferences")} onClick={() => setActiveTab("conferences")}>
                    📋 Konferanslar
                </button>
                <button style={tabStyle("users")} onClick={() => setActiveTab("users")}>
                    👥 Kullanıcılar
                </button>
            </div>

            {/* Konferanslar Sekmesi */}
            {activeTab === "conferences" && (
                <div>
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
                                        style={{ width: "100%", padding: "18px 24px", background: "var(--white)", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "600", fontSize: "18px", color: "var(--text-dark)", transition: "var(--transition)" }}
                                    >
                                        <span>📂 {category} Kategorisi ({conferences.filter(c => c.category === category).length} Konferans)</span>
                                        <span>{expandedCategories.includes(category) ? "▲" : "▼"}</span>
                                    </button>

                                    {expandedCategories.includes(category) && (
                                        <div style={{ padding: "20px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "20px" }}>
                                            {conferences.filter(c => c.category === category).map((conf) => (
                                                <div key={conf.id} style={{ background: "var(--white)", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                                                    <h2 style={{ fontSize: "20px", color: "var(--primary-color)", marginBottom: "5px" }}>{conf.title}</h2>
                                                    <p style={{ color: "var(--text-light)", fontSize: "13px", marginBottom: "15px" }}>
                                                        📅 {new Date(conf.date).toLocaleDateString("tr-TR")} | 📍 {conf.location} | Katılımcı: <strong>{conf.registrations.length} kişi</strong>
                                                    </p>
                                                    <h4 style={{ marginBottom: "10px", color: "var(--text-dark)", fontSize: "15px" }}>Katılımcı Listesi</h4>
                                                    {conf.registrations.length === 0 ? (
                                                        <p style={{ fontSize: "14px", color: "var(--text-light)", fontStyle: "italic" }}>Henüz kayıt yok.</p>
                                                    ) : (
                                                        <div style={{ overflowX: "auto" }}>
                                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                                                <thead>
                                                                    <tr style={{ background: "#f1f5f9", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>
                                                                        <th style={{ padding: "10px" }}>Kayıt Tarihi</th>
                                                                        <th style={{ padding: "10px" }}>Ad Soyad</th>
                                                                        <th style={{ padding: "10px" }}>TC Kimlik No</th>
                                                                        <th style={{ padding: "10px" }}>Durum</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {conf.registrations.map((reg) => (
                                                                        <tr key={reg.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                                            <td style={{ padding: "10px", color: "var(--text-light)" }}>{new Date(reg.createdAt).toLocaleDateString("tr-TR")}</td>
                                                                            <td style={{ padding: "10px", fontWeight: "600" }}>{reg.user.name}</td>
                                                                            <td style={{ padding: "10px" }}>{reg.user.tcNo}</td>
                                                                            <td style={{ padding: "10px", color: "#16a34a", fontWeight: "600" }}>Katılım Sağlanacak</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Kullanıcılar Sekmesi */}
            {activeTab === "users" && (
                <div>
                    {/* Arama Çubuğu */}
                    <div style={{ marginBottom: "20px", position: "relative" }}>
                        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", pointerEvents: "none" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Ad, soyad, TC, e-posta, okul veya şehir ile ara..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "14px 16px 14px 48px",
                                fontSize: "15px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "12px",
                                outline: "none",
                                boxSizing: "border-box",
                                background: "var(--white)",
                                boxShadow: "var(--shadow-sm)",
                            }}
                        />
                    </div>

                    {usersLoading ? (
                        <p style={{ textAlign: "center" }}>Kullanıcılar Yükleniyor...</p>
                    ) : users.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-light)", fontStyle: "italic" }}>Kullanıcı bulunamadı.</p>
                    ) : (
                        <div style={{ background: "var(--white)", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: "600", color: "var(--text-dark)" }}>Toplam: {users.length} kullanıcı</span>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                    <thead>
                                        <tr style={{ background: "#f1f5f9", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>
                                            <th style={{ padding: "12px 14px" }}>Ad Soyad</th>
                                            <th style={{ padding: "12px 14px" }}>TC Kimlik</th>
                                            <th style={{ padding: "12px 14px" }}>E-posta</th>
                                            <th style={{ padding: "12px 14px" }}>Telefon</th>
                                            <th style={{ padding: "12px 14px" }}>Okul</th>
                                            <th style={{ padding: "12px 14px" }}>Şehir</th>
                                            <th style={{ padding: "12px 14px" }}>Rol</th>
                                            <th style={{ padding: "12px 14px" }}>Kayıt Tarihi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} style={{ borderBottom: "1px solid #e2e8f0", transition: "background 0.15s" }}
                                                onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                                onMouseLeave={e => (e.currentTarget.style.background = "")}>
                                                <td style={{ padding: "12px 14px", fontWeight: "600", whiteSpace: "nowrap" }}>{u.name} {u.surname}</td>
                                                <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>{u.tcNo}</td>
                                                <td style={{ padding: "12px 14px", color: "var(--text-light)" }}>{u.email}</td>
                                                <td style={{ padding: "12px 14px", color: "var(--text-light)" }}>{u.phone}</td>
                                                <td style={{ padding: "12px 14px" }}>{u.schoolName}</td>
                                                <td style={{ padding: "12px 14px" }}>{u.city}</td>
                                                <td style={{ padding: "12px 14px" }}>
                                                    <span style={{
                                                        background: u.role === "ADMIN" ? "#fef3c7" : "#f0fdf4",
                                                        color: u.role === "ADMIN" ? "#b45309" : "#15803d",
                                                        border: `1px solid ${u.role === "ADMIN" ? "#fcd34d" : "#bbf7d0"}`,
                                                        borderRadius: "999px",
                                                        padding: "3px 10px",
                                                        fontWeight: "700",
                                                        fontSize: "12px",
                                                    }}>
                                                        {u.role === "ADMIN" ? "YETKİLİ" : "ÖĞRENCİ"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px 14px", color: "var(--text-light)", whiteSpace: "nowrap" }}>
                                                    {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
