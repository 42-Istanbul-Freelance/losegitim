"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";

type StoredUser = { name: string; role: string };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<StoredUser | null>(null);
	const router = useRouter();
	const pathname = usePathname();

	// notifications
	const [notifications, setNotifications] = useState<{id:number;message:string}[]>([]);
	const [unread, setUnread] = useState(0);
	const [showNotifs, setShowNotifs] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	// close menu when clicked outside
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			const menu = document.querySelector('.user-menu');
			if (menu && !menu.contains(e.target as Node)) {
				setShowUserMenu(false);
			}
			const notif = document.querySelector('.notif-menu');
			if (showNotifs && notif && !notif.contains(e.target as Node) && !(e.target as HTMLElement).closest('[data-notif-bell]')) {
				setShowNotifs(false);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [showNotifs]);
	const nextNotifId = useRef(1);

	const addNotification = (msg: string) => {
		setNotifications(prev => [{id: nextNotifId.current++, message: msg}, ...prev]);
		setUnread(c => c + 1);
	};

	useEffect(() => {
		const handler = (e: any) => {
			if (e.detail) addNotification(e.detail);
		};
		window.addEventListener("newNotif", handler as EventListener);
		return () => window.removeEventListener("newNotif", handler as EventListener);
	}, []);


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

					<div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						{user ? (
							<>
								{user.role === 'ADMIN' && (
									<a href="/admin" className="btn-primary-outline" style={{ border: 'none', textDecoration: 'underline', marginRight: '10px' }}>Yönetim Paneli</a>
								)}
						<div style={{ position: 'relative', display: 'inline-block' }}>
						<span
					style={{ fontWeight: '700', cursor: 'pointer', transition: 'color 0.2s', fontSize:'1.1em' }}
					onClick={() => setShowUserMenu(s=>!s)}
					onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-color)')}
					onMouseLeave={e => (e.currentTarget.style.color = '')}
				>
				<strong>{user.name}</strong>
				</span>
							
						{showUserMenu && (
							<div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--white)', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: 'var(--shadow-md)', minWidth:'140px', opacity: showUserMenu ? 1 : 0, transform: showUserMenu ? 'scale(1)' : 'scale(0.95)', transformOrigin: 'top right', transition: 'opacity 0.15s ease, transform 0.15s ease' }} className="user-menu">
								<a href="/settings" style={{ display:'block', padding:'10px 14px', textDecoration:'none', color:'var(--text-dark)', transition:'background 0.2s', fontFamily:'inherit' }}
									onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'}
									onMouseLeave={e=>e.currentTarget.style.background=''}
								>Kullanıcı Bilgileri</a>
<button onClick={handleLogout} style={{ display:'block', padding:'10px 14px', width:'100%', textAlign:'left', background:'transparent', border:'none', cursor:'pointer', color:'#ef4444', transition:'background 0.2s, color 0.2s', fontFamily:'inherit' }}
								onMouseEnter={e=>{e.currentTarget.style.background='#ef4444';e.currentTarget.style.color='#fff';}}
								onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#ef4444';}}
								>Çıkış Yap</button>
							</div>
						)}
						</div>
								{/* notification bell next to logout */}
								<div style={{ position: 'relative' }}>
<span data-notif-bell style={{ cursor: 'pointer', fontSize: '0', marginLeft: '8px', display:'inline-block', position:'relative' }} onClick={() => { setShowNotifs(s => !s); setUnread(0); }}>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
								<path d="M12 2a6 6 0 0 0-6 6v3.586l-1.707 1.707A1 1 0 0 0 4 15h16a1 1 0 0 0 .707-1.707L18 11.586V8a6 6 0 0 0-6-6zm0 20a3 3 0 0 0 2.995-2.824L15 19h-6a3 3 0 0 0 2.824 2.995L12 22z" />
							</svg>
										{unread > 0 && (
											<span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
										)}
									</span>
									{showNotifs && (
										<div className="notif-menu" style={{ position: 'absolute', top: '24px', right: 0, width: '260px', maxHeight: '320px', overflowY: 'auto', background: 'var(--white)', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: 'var(--shadow-md)', zIndex: 100, opacity: showNotifs ? 1 : 0, transform: showNotifs ? 'scale(1)' : 'scale(0.95)', transformOrigin: 'top right', transition: 'opacity 0.15s ease, transform 0.15s ease' }}>
											{notifications.length === 0 ? (
												<div style={{ padding: '12px', color: 'var(--text-light)', fontSize: '14px' }}>Bildirim yok</div>
											) : notifications.map(n => (
												<div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>{n.message}</div>
											))}
										</div>
									)}
								</div>
							</>
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
					<p>&copy; {new Date().getFullYear()} LÖSEV Konferans Sistemi - Eğitmen Arayüzü <span style={{ opacity: 0.7, fontSize: "0.9em", marginLeft: "10px" }}>| Sürüm: v4.0.0 (Detaylı eğitim sayfası &amp; Detaylı yönetim paneli)</span></p>
				</footer>
			</body>
		</html>
	);
}
