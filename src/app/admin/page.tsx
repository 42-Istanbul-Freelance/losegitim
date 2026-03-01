"use client";

import { useEffect, useState, Fragment } from "react";
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
    birthDate: string;
    city: string;
    district: string;
    schoolName: string;
    role: string;
    createdAt: string;
    _count: { registrations: number };
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

type Tab = "conferences" | "users" | "create-conference" | "statistics";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("conferences");
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [users, setUsers] = useState<UserFull[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    // User management state
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [deleteUserLoading, setDeleteUserLoading] = useState(false);
    const [userMsg, setUserMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [userSortBy, setUserSortBy] = useState<"createdAt" | "name" | "city" | "registrations">("createdAt");
    const [userSortDir, setUserSortDir] = useState<"asc" | "desc">("desc");
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
    const [statsLoading, setStatsLoading] = useState(false);
    // Kategori yönetimi
    const [categories, setCategories] = useState<string[]>(["Sağlık", "Psikoloji", "İletişim", "Eğitim"]);
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [catMsg, setCatMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    // Konferans silme
    const [deleteConfId, setDeleteConfId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    // Kategorileri localStorage'dan yükle
    useEffect(() => {
        const saved = localStorage.getItem("conf_categories");
        if (saved) {
            try { setCategories(JSON.parse(saved)); } catch { /* ignore */ }
        }
    }, []);

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

    // İstatistikler için veri yükle
    useEffect(() => {
        if (activeTab !== "statistics") return;
        setStatsLoading(true);
        Promise.all([
            fetch("/api/admin/conferences").then(r => r.json()),
            fetch("/api/admin/users").then(r => r.json()),
        ]).then(([confsData, usersData]) => {
            setConferences(confsData);
            setUsers(usersData);
        }).catch(err => console.error(err)).finally(() => setStatsLoading(false));
    }, [activeTab]);

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

    const handleAddCategory = () => {
        const val = newCategoryInput.trim();
        if (!val) { setCatMsg({ type: "error", text: "Kategori adı boş olamaz." }); return; }
        if (categories.includes(val)) { setCatMsg({ type: "error", text: "Bu kategori zaten var." }); return; }
        const updated = [...categories, val];
        setCategories(updated);
        localStorage.setItem("conf_categories", JSON.stringify(updated));
        setNewCategoryInput("");
        setCatMsg({ type: "success", text: `"${val}" kategorisi eklendi.` });
        setTimeout(() => setCatMsg(null), 3000);
    };

    const handleDeleteCategory = (cat: string) => {
        const updated = categories.filter(c => c !== cat);
        setCategories(updated);
        localStorage.setItem("conf_categories", JSON.stringify(updated));
        if (confCategory === cat) setConfCategory(updated[0] || "");
        setCatMsg({ type: "error", text: `"${cat}" kategorisi silindi.` });
        setTimeout(() => setCatMsg(null), 3000);
    };

    const handleDeleteConference = async (id: string) => {
        setDeleteLoading(true);
        setDeleteMsg(null);
        try {
            const res = await fetch(`/api/admin/conferences/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                setConferences(prev => prev.filter(c => c.id !== id));
                setDeleteMsg({ type: "success", text: "Konferans başarıyla silindi." });
            } else {
                setDeleteMsg({ type: "error", text: data.message || "Silme işlemi başarısız." });
            }
        } catch {
            setDeleteMsg({ type: "error", text: "Sunucu hatası." });
        } finally {
            setDeleteLoading(false);
            setDeleteConfId(null);
            setTimeout(() => setDeleteMsg(null), 4000);
        }
    };

    const handleDeleteUser = async (id: string) => {
        setDeleteUserLoading(true);
        setUserMsg(null);
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
                setUserMsg({ type: "success", text: "Kullanıcı başarıyla silindi." });
            } else {
                setUserMsg({ type: "error", text: data.message || "Silme başarısız." });
            }
        } catch {
            setUserMsg({ type: "error", text: "Sunucu hatası." });
        } finally {
            setDeleteUserLoading(false);
            setDeleteUserId(null);
            setTimeout(() => setUserMsg(null), 4000);
        }
    };

    const handleRoleChange = async (id: string, currentRole: string) => {
        const newRole = currentRole === "ADMIN" ? "STUDENT" : "ADMIN";
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
                setUserMsg({ type: "success", text: `Rol "${newRole === "ADMIN" ? "Yetkili" : "Öğrenci"}" olarak güncellendi.` });
                setTimeout(() => setUserMsg(null), 3000);
            }
        } catch {
            setUserMsg({ type: "error", text: "Rol güncellenemedi." });
        }
    };

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
                    ⚙️ Konferans Yönetimi
                </button>
                <button style={tabStyle("statistics")} onClick={() => setActiveTab("statistics")}>
                    📊 İstatistikler
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
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* Özet Kartlar */}
                    {!usersLoading && users.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px" }}>
                            {[
                                { label: "Toplam Kullanıcı", value: users.length, icon: "👥", color: "#6366f1" },
                                { label: "Öğrenci", value: users.filter(u => u.role === "STUDENT").length, icon: "🎓", color: "#0ea5e9" },
                                { label: "Yetkili", value: users.filter(u => u.role === "ADMIN").length, icon: "🛡️", color: "#f59e0b" },
                                { label: "Toplam Kayıt", value: users.reduce((s, u) => s + u._count.registrations, 0), icon: "✅", color: "#16a34a" },
                                { label: "Ort. Kayıt/Kullanıcı", value: users.length > 0 ? (users.reduce((s, u) => s + u._count.registrations, 0) / users.length).toFixed(1) : "0", icon: "📈", color: "#ec4899" },
                            ].map(stat => (
                                <div key={stat.label} style={{ background: "var(--white)", borderRadius: "14px", padding: "16px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
                                    <div style={{ fontSize: "22px", marginBottom: "6px" }}>{stat.icon}</div>
                                    <div style={{ fontSize: "26px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600", marginTop: "2px" }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Mesaj */}
                    {userMsg && (
                        <div style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", background: userMsg.type === "success" ? "#f0fdf4" : "#fef2f2", color: userMsg.type === "success" ? "#15803d" : "#dc2626", border: `1px solid ${userMsg.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
                            {userMsg.text}
                        </div>
                    )}

                    {/* Arama + Sıralama */}
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Ad, soyad, TC, e-posta, okul veya şehir ile ara..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: "100%", padding: "12px 16px 12px 44px", fontSize: "14px", border: "1px solid #cbd5e1", borderRadius: "10px", outline: "none", boxSizing: "border-box", background: "var(--white)", boxShadow: "var(--shadow-sm)" }}
                            />
                        </div>
                        <select
                            value={`${userSortBy}-${userSortDir}`}
                            onChange={e => {
                                const [field, dir] = e.target.value.split("-") as [typeof userSortBy, typeof userSortDir];
                                setUserSortBy(field); setUserSortDir(dir);
                            }}
                            style={{ padding: "12px 14px", fontSize: "14px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "var(--white)", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}
                        >
                            <option value="createdAt-desc">🕐 Son kayıt önce</option>
                            <option value="createdAt-asc">🕐 İlk kayıt önce</option>
                            <option value="name-asc">🔤 Ad A→Z</option>
                            <option value="name-desc">🔤 Ad Z→A</option>
                            <option value="city-asc">📍 Şehir A→Z</option>
                            <option value="registrations-desc">✅ En fazla kayıt</option>
                        </select>
                    </div>

                    {/* Tablo */}
                    {usersLoading ? (
                        <p style={{ textAlign: "center" }}>Kullanıcılar Yükleniyor...</p>
                    ) : users.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-light)", fontStyle: "italic" }}>Kullanıcı bulunamadı.</p>
                    ) : (() => {
                        const sorted = [...users].sort((a, b) => {
                            if (userSortBy === "name") return userSortDir === "asc" ? (a.name + a.surname).localeCompare(b.name + b.surname) : (b.name + b.surname).localeCompare(a.name + a.surname);
                            if (userSortBy === "city") return userSortDir === "asc" ? a.city.localeCompare(b.city) : b.city.localeCompare(a.city);
                            if (userSortBy === "registrations") return userSortDir === "desc" ? b._count.registrations - a._count.registrations : a._count.registrations - b._count.registrations;
                            return userSortDir === "desc" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        });
                        return (
                            <div style={{ background: "var(--white)", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "600", color: "var(--text-dark)", fontSize: "14px" }}>Toplam: {users.length} kullanıcı</span>
                                    <span style={{ fontSize: "12px", color: "var(--text-light)" }}>Satıra tıkla → detay</span>
                                </div>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                        <thead>
                                            <tr style={{ background: "#f1f5f9", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>
                                                <th style={{ padding: "11px 14px" }}>Ad Soyad</th>
                                                <th style={{ padding: "11px 14px" }}>TC Kimlik</th>
                                                <th style={{ padding: "11px 14px" }}>E-posta</th>
                                                <th style={{ padding: "11px 14px" }}>Şehir</th>
                                                <th style={{ padding: "11px 14px", textAlign: "center" }}>Kayıt</th>
                                                <th style={{ padding: "11px 14px" }}>Kayıt Tarihi</th>
                                                <th style={{ padding: "11px 14px" }}>Rol</th>
                                                <th style={{ padding: "11px 14px" }}>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sorted.map((u) => (
                                                <Fragment key={u.id}>
                                                    <tr
                                                        onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                                                        style={{ borderBottom: expandedUserId === u.id ? "none" : "1px solid #e2e8f0", transition: "background 0.15s", cursor: "pointer", background: expandedUserId === u.id ? "#f0f9ff" : deleteUserId === u.id ? "#fff5f5" : "" }}
                                                        onMouseEnter={e => { if (expandedUserId !== u.id) e.currentTarget.style.background = "#f8fafc"; }}
                                                        onMouseLeave={e => { if (expandedUserId !== u.id) e.currentTarget.style.background = ""; }}
                                                    >
                                                        <td style={{ padding: "11px 14px", fontWeight: "600", whiteSpace: "nowrap" }}>{u.name} {u.surname}</td>
                                                        <td style={{ padding: "11px 14px", fontFamily: "monospace", fontSize: "12px" }}>{u.tcNo}</td>
                                                        <td style={{ padding: "11px 14px", color: "var(--text-light)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</td>
                                                        <td style={{ padding: "11px 14px" }}>{u.city}</td>
                                                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                                                            <span style={{ background: u._count.registrations > 0 ? "#ede9fe" : "#f1f5f9", color: u._count.registrations > 0 ? "#6d28d9" : "#94a3b8", borderRadius: "999px", padding: "2px 10px", fontWeight: "700", fontSize: "12px" }}>
                                                                {u._count.registrations}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: "11px 14px", color: "var(--text-light)", whiteSpace: "nowrap" }}>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
                                                        <td style={{ padding: "11px 14px" }}>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); handleRoleChange(u.id, u.role); }}
                                                                title="Role tıkla değiştir"
                                                                style={{ background: u.role === "ADMIN" ? "#fef3c7" : "#f0fdf4", color: u.role === "ADMIN" ? "#b45309" : "#15803d", border: `1px solid ${u.role === "ADMIN" ? "#fcd34d" : "#bbf7d0"}`, borderRadius: "999px", padding: "3px 10px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
                                                                {u.role === "ADMIN" ? "YETKİLİ" : "ÖĞRENCİ"}
                                                            </button>
                                                        </td>
                                                        <td style={{ padding: "11px 14px" }} onClick={e => e.stopPropagation()}>
                                                            {deleteUserId === u.id ? (
                                                                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                                    <button onClick={() => handleDeleteUser(u.id)} disabled={deleteUserLoading}
                                                                        style={{ padding: "4px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}>
                                                                        {deleteUserLoading ? "..." : "Sil"}
                                                                    </button>
                                                                    <button onClick={() => setDeleteUserId(null)}
                                                                        style={{ padding: "4px 10px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "11px", cursor: "pointer" }}>
                                                                        İptal
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => { setDeleteUserId(u.id); setExpandedUserId(null); }}
                                                                    style={{ padding: "4px 10px", background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
                                                                    🗑️
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    {expandedUserId === u.id && (
                                                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                            <td colSpan={8} style={{ padding: "0" }}>
                                                                <div style={{ background: "#f0f9ff", padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", borderTop: "1px solid #bae6fd" }}>
                                                                    {[
                                                                        { label: "Telefon", value: u.phone, icon: "📞" },
                                                                        { label: "Doğum Tarihi", value: u.birthDate, icon: "🎂" },
                                                                        { label: "İlçe", value: u.district, icon: "📍" },
                                                                        { label: "Okul / Kurum", value: u.schoolName, icon: "🏫" },
                                                                        { label: "Konferansa Katılım", value: `${u._count.registrations} kayıt`, icon: "✅" },
                                                                        { label: "TC Kimlik", value: u.tcNo, icon: "🪪" },
                                                                    ].map(item => (
                                                                        <div key={item.label} style={{ background: "var(--white)", borderRadius: "10px", padding: "10px 14px", border: "1px solid #bae6fd" }}>
                                                                            <div style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "600", marginBottom: "3px" }}>{item.icon} {item.label}</div>
                                                                            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dark)" }}>{item.value || "—"}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
            {/* KONFERANS YÖNETİMİ SEKMESİ */}
            {activeTab === "create-conference" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "780px", margin: "0 auto" }}>

                    {/* Yeni Konferans Formu */}
                    <div style={{ background: "var(--white)", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--text-dark)" }}>➕ Yeni Konferans Oluştur</h2>
                        {confMsg && (
                            <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600", background: confMsg.type === "success" ? "#f0fdf4" : "#fef2f2", color: confMsg.type === "success" ? "#15803d" : "#dc2626", border: `1px solid ${confMsg.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
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
                                    <select className="form-input" value={confCategory} onChange={e => setConfCategory(e.target.value)} style={{ background: "white", cursor: "pointer" }}>
                                        {categories.map(cat => <option key={cat}>{cat}</option>)}
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
                            <button type="submit" className="btn-primary" disabled={confLoading} style={{ marginTop: "8px", padding: "14px", fontSize: "16px", fontWeight: "700" }}>
                                {confLoading ? "Oluşturuluyor..." : "✅ Konferansı Oluştur"}
                            </button>
                        </form>
                    </div>

                    {/* Kategori Yönetimi */}
                    <div style={{ background: "var(--white)", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: "var(--text-dark)" }}>🗂️ Kategori Yönetimi</h2>
                        <p style={{ fontSize: "13px", color: "var(--text-light)", marginBottom: "20px" }}>Konferans formunda görünecek kategorileri ekleyip silebilirsiniz.</p>

                        {catMsg && (
                            <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", background: catMsg.type === "success" ? "#f0fdf4" : "#fef2f2", color: catMsg.type === "success" ? "#15803d" : "#dc2626", border: `1px solid ${catMsg.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
                                {catMsg.text}
                            </div>
                        )}

                        {/* Yeni kategori ekle */}
                        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                            <input
                                className="form-input"
                                value={newCategoryInput}
                                onChange={e => setNewCategoryInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                                placeholder="Yeni kategori adı..."
                                style={{ flex: 1 }}
                            />
                            <button
                                onClick={handleAddCategory}
                                style={{ padding: "10px 20px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                                + Ekle
                            </button>
                        </div>

                        {/* Mevcut kategoriler */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {categories.map(cat => (
                                <div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "999px", padding: "6px 14px" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-dark)" }}>{cat}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat)}
                                        title="Sil"
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "16px", lineHeight: 1, padding: "0 2px" }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && <p style={{ fontSize: "13px", color: "var(--text-light)", fontStyle: "italic" }}>Henüz kategori yok.</p>}
                        </div>
                    </div>

                    {/* Konferans Sil */}
                    <div style={{ background: "var(--white)", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: "var(--text-dark)" }}>🗑️ Konferans Sil</h2>
                        <p style={{ fontSize: "13px", color: "var(--text-light)", marginBottom: "20px" }}>Silinen konferansın tüm kayıtları da kalıcı olarak silinir.</p>

                        {deleteMsg && (
                            <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                                {deleteMsg.text}
                            </div>
                        )}

                        {loading ? (
                            <p style={{ color: "var(--text-light)", fontSize: "14px" }}>Konferanslar yükleniyor...</p>
                        ) : conferences.length === 0 ? (
                            <p style={{ color: "var(--text-light)", fontStyle: "italic", fontSize: "14px" }}>Silinecek konferans yok.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {Array.from(new Set(conferences.map(c => c.category))).sort().map(cat => (
                                    <div key={cat}>
                                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid #e2e8f0" }}>
                                            📂 {cat} <span style={{ fontWeight: "400" }}>({conferences.filter(c => c.category === cat).length})</span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {conferences.filter(c => c.category === cat).map(conf => (
                                                <div key={conf.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: "12px", background: deleteConfId === conf.id ? "#fff5f5" : "#f8fafc" }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: "600", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conf.title}</div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-light)", marginTop: "2px" }}>
                                                            {new Date(conf.date).toLocaleDateString("tr-TR")} · {conf.registrations.length} kayıt
                                                        </div>
                                                    </div>
                                                    {deleteConfId === conf.id ? (
                                                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                                                            <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600" }}>Emin misiniz?</span>
                                                            <button onClick={() => handleDeleteConference(conf.id)} disabled={deleteLoading}
                                                                style={{ padding: "6px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
                                                                {deleteLoading ? "..." : "Evet, Sil"}
                                                            </button>
                                                            <button onClick={() => setDeleteConfId(null)}
                                                                style={{ padding: "6px 14px", background: "#e2e8f0", color: "var(--text-dark)", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>
                                                                İptal
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setDeleteConfId(conf.id)}
                                                            style={{ padding: "6px 14px", background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", flexShrink: 0 }}>
                                                            🗑️ Sil
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* İSTATİSTİKLER SEKMESİ */}
            {activeTab === "statistics" && (
                <div>
                    {statsLoading ? (
                        <p style={{ textAlign: "center" }}>İstatistikler Yükleniyor...</p>
                    ) : (() => {
                        const totalUsers = users.length;
                        const totalConferences = conferences.length;
                        const totalRegistrations = conferences.reduce((sum, c) => sum + c.registrations.length, 0);
                        const avgRegistrations = totalConferences > 0 ? (totalRegistrations / totalConferences).toFixed(1) : "0";
                        const mostPopular = [...conferences].sort((a, b) => b.registrations.length - a.registrations.length).slice(0, 5);
                        const categoryStats = Array.from(new Set(conferences.map(c => c.category))).map(cat => ({
                            category: cat,
                            count: conferences.filter(c => c.category === cat).length,
                            registrations: conferences.filter(c => c.category === cat).reduce((s, c) => s + c.registrations.length, 0),
                        })).sort((a, b) => b.registrations - a.registrations);
                        const cityStats = users.reduce((acc: Record<string, number>, u) => {
                            acc[u.city] = (acc[u.city] || 0) + 1; return acc;
                        }, {});
                        const topCities = Object.entries(cityStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
                        const recentRegistrations = conferences
                            .flatMap(c => c.registrations.map(r => ({ ...r, conferenceTitle: c.title })))
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 8);
                        const cardStyle: React.CSSProperties = { background: "var(--white)", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)", textAlign: "center" };
                        return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                                {/* Özet Kartlar */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                                    {[
                                        { label: "Toplam Kullanıcı", value: totalUsers, icon: "👥", color: "#6366f1" },
                                        { label: "Toplam Konferans", value: totalConferences, icon: "📋", color: "#0ea5e9" },
                                        { label: "Toplam Kayıt", value: totalRegistrations, icon: "✅", color: "#16a34a" },
                                        { label: "Ort. Katılımcı/Konf.", value: avgRegistrations, icon: "📈", color: "#f59e0b" },
                                        { label: "Kategori Sayısı", value: categoryStats.length, icon: "🗂️", color: "#ec4899" },
                                    ].map(stat => (
                                        <div key={stat.label} style={cardStyle}>
                                            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
                                            <div style={{ fontSize: "32px", fontWeight: "800", color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
                                            <div style={{ fontSize: "13px", color: "var(--text-light)", fontWeight: "600" }}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    {/* Kategori Dağılımı */}
                                    <div style={{ background: "var(--white)", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                                        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", fontSize: "16px", color: "var(--text-dark)" }}>🗂️ Kategori Dağılımı</div>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                            <thead>
                                                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                                    <th style={{ padding: "10px 16px", textAlign: "left", color: "var(--text-light)" }}>Kategori</th>
                                                    <th style={{ padding: "10px 16px", textAlign: "center", color: "var(--text-light)" }}>Konferans</th>
                                                    <th style={{ padding: "10px 16px", textAlign: "center", color: "var(--text-light)" }}>Toplam Kayıt</th>
                                                    <th style={{ padding: "10px 16px", textAlign: "center", color: "var(--text-light)" }}>Ort.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categoryStats.map(cat => (
                                                    <tr key={cat.category} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                        <td style={{ padding: "10px 16px", fontWeight: "600" }}>{cat.category}</td>
                                                        <td style={{ padding: "10px 16px", textAlign: "center" }}>{cat.count}</td>
                                                        <td style={{ padding: "10px 16px", textAlign: "center", fontWeight: "700", color: "#6366f1" }}>{cat.registrations}</td>
                                                        <td style={{ padding: "10px 16px", textAlign: "center", color: "var(--text-light)" }}>{cat.count > 0 ? (cat.registrations / cat.count).toFixed(1) : "0"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* En Popüler Konferanslar */}
                                    <div style={{ background: "var(--white)", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                                        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", fontSize: "16px", color: "var(--text-dark)" }}>🏆 En Popüler Konferanslar</div>
                                        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {mostPopular.map((conf, i) => (
                                                <div key={conf.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <span style={{ fontSize: "18px", minWidth: "28px", textAlign: "center" }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: "600", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conf.title}</div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-light)" }}>{conf.category}</div>
                                                    </div>
                                                    <span style={{ background: "#ede9fe", color: "#6d28d9", borderRadius: "999px", padding: "3px 10px", fontWeight: "700", fontSize: "13px", whiteSpace: "nowrap" }}>{conf.registrations.length} kayıt</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    {/* Şehir Dağılımı */}
                                    <div style={{ background: "var(--white)", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                                        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", fontSize: "16px", color: "var(--text-dark)" }}>🏙️ En Çok Kullanıcı — Şehirler</div>
                                        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {topCities.map(([city, count]) => {
                                                const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                                                return (
                                                    <div key={city}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                                                            <span style={{ fontWeight: "600" }}>📍 {city}</span>
                                                            <span style={{ color: "var(--text-light)" }}>{count} kişi ({pct}%)</span>
                                                        </div>
                                                        <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                                                            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: "999px", transition: "width 0.5s" }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Son Kayıtlar */}
                                    <div style={{ background: "var(--white)", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                                        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", fontSize: "16px", color: "var(--text-dark)" }}>🕐 Son Kayıtlar</div>
                                        <div style={{ padding: "4px 0" }}>
                                            {recentRegistrations.length === 0 ? (
                                                <p style={{ padding: "16px", color: "var(--text-light)", fontStyle: "italic", fontSize: "13px" }}>Henüz kayıt yok.</p>
                                            ) : recentRegistrations.map(reg => (
                                                <div key={reg.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                                    <span style={{ fontSize: "20px", lineHeight: 1 }}>👤</span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: "600", fontSize: "13px" }}>{reg.user.name}</div>
                                                        <div style={{ fontSize: "11px", color: "var(--text-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reg.conferenceTitle}</div>
                                                    </div>
                                                    <span style={{ fontSize: "11px", color: "var(--text-light)", whiteSpace: "nowrap" }}>{new Date(reg.createdAt).toLocaleDateString("tr-TR")}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
