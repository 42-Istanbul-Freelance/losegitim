"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";

type StoredUser = { name: string; role: string };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<StoredUser | null>(null);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		} else if (pathname !== '/login' && pathname !== '/register') {
			router.push('/login');
		}
	}, [pathname, router]);

	const handleLogout = () => {
		localStorage.removeItem("user");
		setUser(null);
		router.push('/login');
	};

	return (
		<html lang="tr">
			<body>
				<nav className="navbar">
					<div className="container nav-content">
						<h1 className="logo" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>LÖSEV <span>Eğitim</span></h1>

						<div className="nav-links">
							{user ? (
								<div className="user-greeting">
									{user.role === 'ADMIN' && (
										<a href="/admin" className="btn-primary-outline" style={{ border: 'none', textDecoration: 'underline', marginRight: '10px' }}>Yönetim Paneli</a>
									)}
									<span>Merhaba, <strong>{user.name}</strong></span>
									<button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
								</div>
							) : (
								<a href="/login" className="btn-primary-outline">Giriş Yap</a>
							)}
						</div>
					</div>
				</nav>

				<main className="main-content">
					{children}
				</main>

				<footer className="footer">
					<p>&copy; {new Date().getFullYear()} LÖSEV Konferans Sistemi - Eğitmen Arayüzü <span style={{ opacity: 0.7, fontSize: "0.9em", marginLeft: "10px" }}>| Sürüm: v3.1.0 (Gelişmiş Yönetim Paneli)</span></p>
				</footer>
			</body>
		</html>
	);
}
