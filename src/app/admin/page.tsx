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

type Tab = "conferences" | "users" | "create-conference";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("conferences");
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [users, setUsers] = useState<UserFull[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    // Conference form state
    const [confTitle, setConfTitle] = useState("");
    const [confDesc, setConfDesc] = useState("");
    const [confCategory, setConfCategory] = useState("Sağlık");
    const [confDate, setConfDate] = useState("");
    const [confLocation, setConfLocation] = useState("");
    const [confLoading, setConfLoading] = useState(false);
    const [confMsg, setConfMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [adminUserId, setAdminUserId] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const router = useRouter();

    // ADMIN kontrolü
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) { router.push("/login"); return; }
        const userData = JSON.parse(storedUser);
        if (userData.role !== "ADMIN") { router.push("/"); return; }
        setAdminUserId(userData.id);
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

    const handleCreateConference = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminUserId) return;
        setConfLoading(true);
        setConfMsg(null);
        try {
            const res = await fetch("/api/admin/create-conference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: confTitle,
                    description: confDesc,
                    category: confCategory,
                    date: confDate,
                    location: confLocation,
                    userId: adminUserId,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setConfMsg({ type: "success", text: `"${data.title}" konferansı başarıyla oluşturuldu!` });
                setConfTitle(""); setConfDesc(""); setConfDate(""); setConfLocation("");
                // Konferans listesini de yenile
                fetch("/api/admin/conferences").then(r => r.json()).then(setConferences);
            } else {
                setConfMsg({ type: "error", text: data.message || "Hata oluştu." });
            }
        } catch {
            setConfMsg({ type: "error", text: "Sunucu hatası." });
        } finally {
            setConfLoading(false);
        }
    };

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
                <button style={tabStyle("create-conference")} onClick={() => setActiveTab("create-conference")}>
                    ➕ Konferans Oluştur
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
            {/* KONFERANS OLUŞTUR SEKMESİ */}
            {activeTab === "create-conference" && (
                <div style={{ maxWidth: "680px", margin: "0 auto" }}>
                    <div style={{ background: "var(--white)", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--text-dark)" }}>+ Yeni Konferans Oluştur</h2>

                        {confMsg && (
                            <div style={{
                                padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600",
                                background: confMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                                color: confMsg.type === "success" ? "#15803d" : "#dc2626",
                                border: `1px solid ${confMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`
                            }}>
                                {confMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleCreateConference} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", fontSize: "14px", color: "var(--text-dark)" }}>Başlık *</label>
                                <input className="form-input" required value={confTitle} onChange={e => setConfTitle(e.target.value)} placeholder="Konferans başlığı" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", fontSize: "14px", color: "var(--text-dark)" }}>Açıklama *</label>
                                <textarea className="form-input" required rows={4} value={confDesc} onChange={e => setConfDesc(e.target.value)} placeholder="Konferans hakkında kısa açıklama..." style={{ resize: "vertical", fontFamily: "inherit" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", fontSize: "14px", color: "var(--text-dark)" }}>Kategori *</label>
                                    <select className="form-input" value={confCategory} onChange={e => setConfCategory(e.target.value)}
                                        style={{ background: "white", cursor: "pointer" }}>
                                        <option>Sağlık</option>
                                        <option>Psikoloji</option>
                                        <option>İletişim</option>
                                        <option>Eğitim</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", fontSize: "14px", color: "var(--text-dark)" }}>Tarih &amp; Saat *</label>
                                    <input className="form-input" type="datetime-local" required value={confDate} onChange={e => setConfDate(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", fontSize: "14px", color: "var(--text-dark)" }}>Konum *</label>
                                <input className="form-input" required value={confLocation} onChange={e => setConfLocation(e.target.value)} placeholder="Ör. Ankara LÖSANTE Hastanesi" />
                            </div>
                            <button type="submit" className="btn-primary" disabled={confLoading}
                                style={{ marginTop: "8px", padding: "14px", fontSize: "16px", fontWeight: "700" }}>
                                {confLoading ? "Oluşturuluyor..." : "✅ Konferansı Oluştur"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
