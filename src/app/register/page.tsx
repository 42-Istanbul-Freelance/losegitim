"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        tcNo: "",
        name: "",
        surname: "",
        birthDate: "",
        phone: "",
        email: "",
        city: "",
        district: "",
        schoolName: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                // Kayıt başarılı olduğunda kullanıcıyı login'e veya doğrudan sisteme atabiliriz.
                // Biz doğrudan giriş yapmış gibi localStorage'a yazıp ana sayfaya yönlendiriyoruz.
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Sunucuya bağlanılırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "800px", margin: "40px auto" }}>
            <div className="auth-card fade-in" style={{ width: "100%", padding: "40px" }}>
                <h2 className="auth-title">Yeni Eğitmen Kaydı</h2>
                <p className="auth-subtitle">
                    LÖSEV Konferans Kayıt Sistemine katılmak için bilgilerinizi giriniz.
                </p>

                {error && (
                    <div style={{ color: "#991b1b", background: "#fee2e2", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {/* Kişisel Bilgiler */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Adınız</label>
                        <input type="text" id="name" className="form-input" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="surname">Soyadınız</label>
                        <input type="text" id="surname" className="form-input" value={formData.surname} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="tcNo">TC Kimlik Numarası</label>
                        <input type="text" id="tcNo" className="form-input" value={formData.tcNo} onChange={handleChange} maxLength={11} pattern="\d{11}" title="Lütfen 11 haneli TC Numaranızı giriniz" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="birthDate">Doğum Tarihi (Yıl Ay Gün)</label>
                        <input type="date" id="birthDate" className="form-input" value={formData.birthDate} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">Telefon Numarası</label>
                        <input type="tel" id="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="05XX XXX XX XX" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">E-posta Adresi</label>
                        <input type="email" id="email" className="form-input" value={formData.email} onChange={handleChange} required />
                    </div>

                    {/* Konum ve Kurum Bilgileri */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="city">İl</label>
                        <input type="text" id="city" className="form-input" value={formData.city} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="district">İlçe</label>
                        <input type="text" id="district" className="form-input" value={formData.district} onChange={handleChange} required />
                    </div>

                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label" htmlFor="schoolName">Okul İsmi (Görev Yaptığınız / Okuduğunuz)</label>
                        <input type="text" id="schoolName" className="form-input" value={formData.schoolName} onChange={handleChange} required />
                    </div>

                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label" htmlFor="password">Şifre Belirleyiniz</label>
                        <input type="password" id="password" className="form-input" value={formData.password} onChange={handleChange} minLength={6} required />
                    </div>

                    <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                        <button type="submit" className="btn-primary w-full" disabled={loading} style={{ height: "50px", fontSize: "16px" }}>
                            {loading ? "Kayıt Oluşturuluyor..." : "Kayıt Ol ve Giriş Yap"}
                        </button>
                    </div>

                </form>

                <div style={{ textAlign: "center", marginTop: "25px", fontSize: "14px", color: "var(--text-light)" }}>
                    Zaten bir hesabınız var mı? <Link href="/login" style={{ color: "var(--primary-color)", fontWeight: "600", textDecoration: "none" }}>Giriş Yapın</Link>
                </div>
            </div>
        </div>
    );
}
