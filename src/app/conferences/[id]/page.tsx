"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Registration = {
    id: string;
    userId: string;
    createdAt: string;
    user: { id: string; name: string; surname: string; city: string };
};

type Conference = {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    registrations: Registration[];
};

type StoredUser = { id: string; name: string; role: string };

const categoryGradient: Record<string, string> = {
    "Sağlık":    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    "Psikoloji": "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    "İletişim":  "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    "Eğitim":    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
};
const defaultGradient = "linear-gradient(135deg, var(--primary-color) 0%, #f97316 100%)";

export default function ConferenceDetail() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [conf, setConf] = useState<Conference | null>(null);
    const [user, setUser] = useState<StoredUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [regLoading, setRegLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { router.push("/login"); return; }
        setUser(JSON.parse(stored));
    }, [router]);

    const fetchConf = async () => {
        try {
            const res = await fetch(`/api/conferences/${id}`, { cache: "no-store" });
            if (res.status === 404) { setNotFound(true); return; }
            const data = await res.json();
            setConf(data);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchConf();
    }, [id]);

    const isRegistered = () =>
        !!user && !!conf?.registrations?.some((r) => r.userId === user.id);

    const handleRegistration = async () => {
        if (!user || !conf) return;
        setRegLoading(true);
        const registered = isRegistered();
        const endpoint = registered ? "/api/unregister-conf" : "/api/register-conf";
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, conferenceId: conf.id }),
            });
            if (res.ok) {
                if (!registered) window.dispatchEvent(new CustomEvent("newNotif", { detail: `✅ "${conf.title}" eğitimine abone olundu.` }));
                await fetchConf();
            } else {
                const d = await res.json();
                alert(d.message);
            }
        } catch {
            alert("Bir hata oluştu.");
        } finally {
            setRegLoading(false);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });

    const formatTime = (d: string) =>
        new Date(d).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <div style={{ fontSize: "16px", color: "var(--text-light)" }}>Yükleniyor...</div>
        </div>
    );

    if (notFound || !conf) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
            <div style={{ fontSize: "48px" }}>🔍</div>
            <h2 style={{ color: "var(--text-dark)" }}>Konferans bulunamadı</h2>
            <button className="btn-primary" onClick={() => router.push("/")}>Ana Sayfaya Dön</button>
        </div>
    );

    const registered = isRegistered();
    const gradient = categoryGradient[conf.category] ?? defaultGradient;

    return (
        <div className="container fade-in" style={{ maxWidth: "780px", margin: "0 auto", paddingBottom: "48px" }}>

            {/* Back */}
            <button
                onClick={() => router.back()}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-light)", cursor: "pointer", fontSize: "14px", fontWeight: "600", padding: "16px 0", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--primary-color)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-light)"}
            >
                ← Geri Dön
            </button>

            {/* Hero */}
            <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                <div style={{ background: gradient, padding: "48px 40px", position: "relative" }}>
                    <span style={{ display: "inline-block", background: "rgba(255,255,255,0.22)", color: "#fff", borderRadius: "999px", padding: "4px 14px", fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "14px" }}>
                        {conf.category}
                    </span>
                    <h1 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: "800", lineHeight: 1.25, margin: "0 0 8px" }}>
                        {conf.title}
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", margin: 0 }}>
                        {formatDate(conf.date)} — {formatTime(conf.date)}
                    </p>
                </div>

                {/* Info bar */}
                <div style={{ background: "var(--white)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid #e2e8f0" }}>
                    {[
                        { icon: "📅", label: "Tarih", value: new Date(conf.date).toLocaleDateString("tr-TR") },
                        { icon: "📍", label: "Konum", value: conf.location },
                        { icon: "👥", label: "Kayıtlı", value: `${conf.registrations.length} katılımcı` },
                    ].map((item, i) => (
                        <div key={i} style={{ padding: "18px 20px", borderRight: i < 2 ? "1px solid #e2e8f0" : "none", textAlign: "center" }}>
                            <div style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)", marginTop: "2px" }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div style={{ background: "var(--white)", borderRadius: "16px", padding: "28px 32px", marginBottom: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <h2 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "14px" }}>Konferans Hakkında</h2>
                <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--text-dark)", whiteSpace: "pre-wrap", margin: 0 }}>{conf.description}</p>
            </div>

            {/* Registration CTA */}
            <div style={{ background: "var(--white)", borderRadius: "16px", padding: "24px 32px", marginBottom: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div>
                    <div style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-dark)" }}>
                        {registered ? "✅ Bu konferansa kayıtlısınız" : "Bu konferansa katılmak ister misiniz?"}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-light)", marginTop: "4px" }}>
                        {registered ? "Katılımınızı iptal etmek için butona tıklayın." : "Hemen kayıt olun, yerinizi ayırtın."}
                    </div>
                </div>
                <button
                    onClick={handleRegistration}
                    disabled={regLoading}
                    className={registered ? "btn-secondary" : "btn-primary"}
                    style={{ minWidth: "200px", padding: "14px 24px", fontWeight: "700", fontSize: "15px", opacity: regLoading ? 0.7 : 1, flexShrink: 0 }}
                >
                    {regLoading ? "İşleniyor..." : registered ? "❌ Kaydı İptal Et" : "✅ Konferansa Kayıt Ol"}
                </button>
            </div>

            {/* Participants — only visible to admins */}
            {user?.role === "ADMIN" && conf.registrations.length > 0 && (
                <div style={{ background: "var(--white)", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-dark)", margin: 0 }}>Kayıtlı Katılımcılar</h2>
                        <span style={{ fontSize: "13px", color: "var(--text-light)" }}>{conf.registrations.length} kişi</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={{ padding: "10px 16px", fontWeight: "600", color: "var(--text-light)" }}>#</th>
                                    <th style={{ padding: "10px 16px", fontWeight: "600", color: "var(--text-light)" }}>Ad Soyad</th>
                                    <th style={{ padding: "10px 16px", fontWeight: "600", color: "var(--text-light)" }}>Şehir</th>
                                    <th style={{ padding: "10px 16px", fontWeight: "600", color: "var(--text-light)" }}>Kayıt Tarihi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conf.registrations.map((reg, i) => (
                                    <tr key={reg.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                                    >
                                        <td style={{ padding: "10px 16px", color: "var(--text-light)" }}>{i + 1}</td>
                                        <td style={{ padding: "10px 16px", fontWeight: "600", color: "var(--text-dark)" }}>{reg.user.name} {reg.user.surname}</td>
                                        <td style={{ padding: "10px 16px", color: "var(--text-light)" }}>{reg.user.city || "—"}</td>
                                        <td style={{ padding: "10px 16px", color: "var(--text-light)" }}>{new Date(reg.createdAt).toLocaleDateString("tr-TR")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
