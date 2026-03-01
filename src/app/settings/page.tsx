"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { router.push("/login"); return; }
        const usr = JSON.parse(stored);
        setUser(usr);

        // fetch latest details from API in case stored data is partial
        (async () => {
            try {
                const res = await fetch(`/api/user?id=${usr.id}`);
                if (res.ok) {
                    const full = await res.json();
                    if (full) {
                        setUser(full);
                        localStorage.setItem("user", JSON.stringify(full));
                        setForm({
                            name: full.name || "",
                            surname: full.surname || "",
                            tcNo: full.tcNo || "",
                            email: full.email || "",
                            phone: full.phone || "",
                            birthDate: full.birthDate ? full.birthDate.split("T")[0] : "",
                            city: full.city || "",
                            district: full.district || "",
                            schoolName: full.schoolName || "",
                        });
                    }
                }
            } catch (e) {
                console.error("fetch user error", e);
            }
            setLoading(false);
        })();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // call API to update maybe
        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                // prevent name/surname change by removing them from payload
                body: JSON.stringify({ id: user.id, ...(({ name, surname, ...rest }) => rest)(form) }),
            });
            if (res.ok) {
                const updated = await res.json();
                localStorage.setItem("user", JSON.stringify(updated));
                setUser(updated);
                setMsg({ type: "success", text: "Bilgiler güncellendi." });
            } else {
                const data = await res.json();
                setMsg({ type: "error", text: data.message || "Hata" });
            }
        } catch {
            setMsg({ type: "error", text: "Sunucu hatası." });
        }
    };

    if (loading) return <p>Yükleniyor...</p>;

    return (
        <div className="container fade-in" style={{ maxWidth: "600px", margin: "40px auto" }}>
            <h2 style={{ marginBottom: "20px" }}>Kullanıcı Ayarları</h2>
            {msg && (
                <div style={{ padding: "10px", marginBottom: "20px", background: msg.type === "success" ? "#f0fdf4" : "#fef2f2", color: msg.type === "success" ? "#15803d" : "#991b1b", borderRadius: "8px" }}>
                    {msg.text}
                </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>Ad</label>
                    <input className="form-input" value={form.name} disabled />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>Soyad</label>
                    <input className="form-input" value={form.surname} disabled />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>TC Kimlik Numarası</label>
                    <input className="form-input" value={form.tcNo} disabled />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>E-posta</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>Doğum Tarihi</label>
                    <input className="form-input" type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>Telefon</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>Şehir</label>
                    <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>İlçe</label>
                    <input className="form-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>Okul / Kurum</label>
                    <input className="form-input" value={form.schoolName} onChange={e => setForm({ ...form, schoolName: e.target.value })} />
                </div>
                <button className="btn-primary" type="submit" style={{ padding: "12px" }}>Güncelle</button>
            </form>
        </div>
    );
}
