"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [tcNo, setTcNo] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tcNo, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Oturum yönetimini basit tutuyoruz, localStorage kullanıyoruz
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Bağlantı hatası.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <h2 className="auth-title">Eğitmen Girişi</h2>
                <p className="auth-subtitle">
                    LÖSEV Konferans Kayıt Sistemine Hoş Geldiniz
                </p>

                {error && (
                    <div style={{ color: "red", marginBottom: "15px", fontSize: "14px" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="tcNo">
                            TC Kimlik Numarası
                        </label>
                        <input
                            type="text"
                            id="tcNo"
                            className="form-input"
                            value={tcNo}
                            onChange={(e) => setTcNo(e.target.value)}
                            placeholder="11 haneli TC Numaranız"
                            maxLength={11}
                            pattern="\d{11}"
                            title="Lütfen 11 haneli TC Numaranızı giriniz"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Şifreniz"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full" style={{ marginTop: "10px" }}>
                        Giriş Yap
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-light)" }}>
                    Hesabınız yok mu? <Link href="/register" style={{ color: "var(--primary-color)", fontWeight: "600", textDecoration: "none" }}>Kayıt Olun</Link>
                </div>
            </div>
        </div>
    );
}
