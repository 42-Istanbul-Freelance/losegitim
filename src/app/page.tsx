"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Types
type Conference = {
	id: string;
	title: string;
	description: string;
	category: string;
	date: string;
	location: string;
	registrations: any[];
};

type User = {
	id: string;
	name: string;
	surname?: string;
	email: string;
	role?: string;
};

type Post = {
	id: string;
	content: string;
	eventType: string;
	imageUrl?: string;
	createdAt: string;
	user: { id: string; name: string; surname: string };
};

export default function Home() {
	const [conferences, setConferences] = useState<Conference[]>([]);
	const [posts, setPosts] = useState<Post[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"egitimler" | "duyurular">("egitimler");
	const [activeCategory, setActiveCategory] = useState("Tümü");
	const [selectedConf, setSelectedConf] = useState<Conference | null>(null);
	const [regLoading, setRegLoading] = useState(false);

	// Yeni paylaşım form state
	const [postContent, setPostContent] = useState("");
	const [postEventType, setPostEventType] = useState("");
	const [postImage, setPostImage] = useState<string | null>(null);
	const [postLoading, setPostLoading] = useState(false);
	const [postError, setPostError] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const categories = ["Tümü", "Sağlık", "Psikoloji", "İletişim", "Eğitim"];
	const router = useRouter();

	const fetchConferences = async (category = "Tümü") => {
		try {
			setLoading(true);
			const url = category === "Tümü" ? "/api/conferences" : `/api/conferences?category=${category}`;
			const res = await fetch(url);
			const data = await res.json();
			setConferences(data);
		} catch (error) {
			console.error("Konferanslar yüklenemedi", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchPosts = async () => {
		try {
			const res = await fetch("/api/posts");
			const data = await res.json();
			setPosts(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Paylaşımlar yüklenemedi", error);
		}
	};

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
			fetchConferences();
			fetchPosts();
		} else {
			router.push("/login");
		}
	}, [router]);

	const handleCategoryChange = (category: string) => {
		setActiveCategory(category);
		fetchConferences(category);
	};

	const isUserRegistered = (conf: Conference) => {
		if (!user) return false;
		return conf.registrations?.some((reg) => reg.userId === user.id);
	};

	const handleRegistration = async (conferenceId: string, isRegistered: boolean) => {
		if (!user) return;
		try {
			const endpoint = isRegistered ? "/api/unregister-conf" : "/api/register-conf";
			const res = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user.id, conferenceId }),
			});
			if (res.ok) {
				fetchConferences(activeCategory);
			} else {
				const data = await res.json();
				alert(data.message);
			}
		} catch (err) {
			alert("Bir hata oluştu.");
		}
	};

	// Fotoğraf seçilince Base64'e çevir
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			setPostError("Dosya boyutu 5MB'dan küçük olmalıdır.");
			return;
		}
		const reader = new FileReader();
		reader.onloadend = () => {
			setPostImage(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleCreatePost = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;
		if (!postContent.trim() || !postEventType.trim()) {
			setPostError("İçerik ve etkinlik türü zorunludur.");
			return;
		}
		setPostLoading(true);
		setPostError("");
		try {
			const res = await fetch("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user.id,
					content: postContent,
					eventType: postEventType,
					imageUrl: postImage || undefined,
				}),
			});
			if (res.ok) {
				setPostContent("");
				setPostEventType("");
				setPostImage(null);
				if (fileInputRef.current) fileInputRef.current.value = "";
				fetchPosts();
			} else {
				const d = await res.json();
				setPostError(d.message);
			}
		} catch {
			setPostError("Paylaşım gönderilemedi.");
		} finally {
			setPostLoading(false);
		}
	};

	const getCategoryBg = (cat: string) => {
		switch (cat) {
			case "Sağlık": return "health-bg";
			case "İletişim": return "comm-bg";
			case "Eğitim": return "edu-bg";
			case "Psikoloji": return "psy-bg";
			default: return "";
		}
	};

	const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

	if (!user) return null;

	return (
		<div className="container fade-in">
			<div className="page-header">
				<h1 className="page-title">Eğitmen Paneli</h1>
				<p className="page-desc">LÖSEV konferanslarına kayıt olun ve toplulukla deneyimlerinizi paylaşın.</p>
			</div>

			{/* Sekme Başlıkları */}
			<div style={{ display: "flex", gap: "8px", marginBottom: "32px", borderBottom: "2px solid #e2e8f0" }}>
				<button
					onClick={() => setActiveTab("egitimler")}
					style={{
						padding: "12px 28px", border: "none", background: "none", cursor: "pointer",
						fontWeight: "700", fontSize: "16px",
						color: activeTab === "egitimler" ? "var(--primary-color)" : "var(--text-light)",
						borderBottom: activeTab === "egitimler" ? "3px solid var(--primary-color)" : "3px solid transparent",
						marginBottom: "-2px", transition: "all 0.2s"
					}}
				>
					🎓 Eğitimler
				</button>
				<button
					onClick={() => setActiveTab("duyurular")}
					style={{
						padding: "12px 28px", border: "none", background: "none", cursor: "pointer",
						fontWeight: "700", fontSize: "16px",
						color: activeTab === "duyurular" ? "var(--primary-color)" : "var(--text-light)",
						borderBottom: activeTab === "duyurular" ? "3px solid var(--primary-color)" : "3px solid transparent",
						marginBottom: "-2px", transition: "all 0.2s"
					}}
				>
					📢 Duyurular
				</button>
			</div>

			{/* EĞİTİMLER SEKMESİ */}
			{activeTab === "egitimler" && (
				<div>
					<div className="filters">
						{categories.map((cat) => (
							<button
								key={cat}
								className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
								onClick={() => handleCategoryChange(cat)}
							>
								{cat}
							</button>
						))}
					</div>

					{loading ? (
						<div style={{ textAlign: "center", padding: "40px" }}>Yükleniyor...</div>
					) : conferences.length === 0 ? (
						<div style={{ textAlign: "center", padding: "40px", color: "var(--text-light)" }}>
							Bu kategoride henüz konferans bulunmuyor.
						</div>
					) : (
						<div className="conferences-grid">
							{conferences.map((conf) => {
								const registered = isUserRegistered(conf);
								return (
									<div
										key={conf.id}
										className="conference-card fade-in"
										style={{ display: "flex", flexDirection: "column", height: "100%" }}
									>
										<div className={`card-img-placeholder ${getCategoryBg(conf.category)}`}>✨</div>
										<div className="card-content" style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "24px" }}>
											<span className="category-tag">{conf.category}</span>
											<h3 className="card-title">{conf.title}</h3>
											
											{/* Tam Açıklama */}
											<p className="card-desc" style={{ whiteSpace: "pre-wrap", marginBottom: "20px" }}>
												{conf.description}
											</p>
											
											{/* Detaylar Kılavuzu Grid */}
											<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
												<div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
													<div style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600", textTransform: "uppercase" }}>Tarih</div>
													<div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)", marginTop: "4px" }}>📅 {formatDate(conf.date)}</div>
												</div>
												<div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
													<div style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600", textTransform: "uppercase" }}>Konum</div>
													<div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)", marginTop: "4px" }}>📍 {conf.location}</div>
												</div>
												<div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #f1f5f9", gridColumn: "span 2" }}>
													<div style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600", textTransform: "uppercase" }}>Katılımcı Durumu</div>
													<div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)", marginTop: "4px" }}>👥 {conf.registrations?.length ?? 0} kişi kayıtlı</div>
												</div>
											</div>

											{/* Kayıt Ol Butonu */}
											<div style={{ marginTop: "auto" }}>
												<button
													disabled={regLoading && selectedConf?.id === conf.id}
													onClick={async (e) => {
														e.stopPropagation();
														setSelectedConf(conf); // geçici olarak loading state için kullanıyoruz
														setRegLoading(true);
														await handleRegistration(conf.id, registered);
														await fetchConferences(); // Refresh list to update count/status
														setRegLoading(false);
														setSelectedConf(null);
													}}
													className={registered ? "btn-secondary" : "btn-primary"}
													style={{ 
														width: "100%", 
														padding: "14px", 
														fontSize: "15px", 
														opacity: (regLoading && selectedConf?.id === conf.id) ? 0.7 : 1,
														borderRadius: "12px",
														fontWeight: "700"
													}}
												>
													{regLoading && selectedConf?.id === conf.id 
														? "İşleniyor..." 
														: registered ? "❌ Kaydı İptal Et" : "✅ Konferansa Kayıt Ol"}
												</button>
											</div>
										</div>
									</div>
								);
							}}
						</div>
					)}
				</div>
			)}

			{/* DUYURULAR SEKMESİ */}
			{activeTab === "duyurular" && (
				<div style={{ maxWidth: "720px", margin: "0 auto" }}>
					{/* Duyuru Formu - Yalnızca ADMIN */}
					{user?.role === 'ADMIN' && (
						<div style={{ background: "var(--white)", borderRadius: "16px", padding: "24px", marginBottom: "28px", boxShadow: "var(--shadow-md)", border: "1px solid #e2e8f0" }}>
							<h3 style={{ marginBottom: "16px", color: "var(--text-dark)", fontSize: "16px", fontWeight: "700" }}>
								📣 Yeni Duyuru Yayınla
							</h3>

							{postError && (
								<div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "14px" }}>
									{postError}
								</div>
							)}

							<form onSubmit={handleCreatePost}>
								<div style={{ marginBottom: "14px" }}>
									<input
										type="text"
										className="form-input"
										placeholder="Etkinlik türü (örn: Kermes, Bağış, Konser, Spor...)"
										value={postEventType}
										onChange={(e) => setPostEventType(e.target.value)}
										required
										style={{ marginBottom: "10px" }}
									/>
									<textarea
										className="form-input"
										placeholder="Katıldığınız etkinliği paylaşın... Emoji de kullanabilirsiniz 🎉"
										value={postContent}
										onChange={(e) => setPostContent(e.target.value)}
										required
										rows={4}
										style={{ resize: "vertical", fontFamily: "inherit" }}
									/>
								</div>

								{/* Fotoğraf Önizleme */}
								{postImage && (
									<div style={{ marginBottom: "14px", position: "relative", display: "inline-block" }}>
										<img src={postImage} alt="Önizleme" style={{ maxHeight: "200px", borderRadius: "10px", maxWidth: "100%" }} />
										<button
											type="button"
											onClick={() => { setPostImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
											style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
										>×</button>
									</div>
								)}

								<div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }}>
									<label htmlFor="post-image" style={{ cursor: "pointer", padding: "8px 14px", background: "#f1f5f9", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "var(--text-dark)", whiteSpace: "nowrap" }}>
										📷 Fotoğraf Ekle
									</label>
									<input
										id="post-image"
										type="file"
										accept="image/*"
										style={{ display: "none" }}
										ref={fileInputRef}
										onChange={handleImageChange}
									/>
									<button type="submit" className="btn-primary" disabled={postLoading} style={{ marginLeft: "auto", minWidth: "140px" }}>
										{postLoading ? "Paylaşılıyor..." : "🚀 Paylaş"}
									</button>
								</div>
							</form>
						</div>
					)}

					{/* Duyuru Listesi */}
					{posts.length === 0 ? (
						<div style={{ textAlign: "center", padding: "50px", color: "var(--text-light)" }}>
							<div style={{ fontSize: "48px", marginBottom: "12px" }}>📢</div>
							<p style={{ fontSize: "16px" }}>Henüz duyuru yok.</p>
						</div>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
							{posts.map((post) => (
								<div key={post.id} style={{ background: "var(--white)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid #e2e8f0" }} className="fade-in">
									<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
										<div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary-color), #f97316)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px", flexShrink: 0 }}>
											{post.user?.name?.charAt(0)?.toUpperCase() || "?"}
										</div>
										<div>
											<p style={{ fontWeight: "700", color: "var(--text-dark)", margin: 0, fontSize: "15px" }}>
												{post.user?.name} {post.user?.surname}
											</p>
											<p style={{ color: "var(--text-light)", margin: 0, fontSize: "12px" }}>
												{formatDate(post.createdAt)}
											</p>
										</div>
										<span style={{ marginLeft: "auto", background: "#f1f5f9", color: "var(--primary-color)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
											{post.eventType}
										</span>
									</div>

									<p style={{ color: "var(--text-dark)", lineHeight: "1.6", margin: "0 0 12px 0", fontSize: "15px", whiteSpace: "pre-wrap" }}>
										{post.content}
									</p>

									{post.imageUrl && (
										<img
											src={post.imageUrl}
											alt="Paylaşım görseli"
											style={{ width: "100%", borderRadius: "12px", maxHeight: "400px", objectFit: "cover" }}
										/>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			)}
							
			)}
		</div>
	);
}


function ConferenceModal({ conf, registered, regLoading, onClose, onRegister, formatDate }: {
	conf: Conference;
	registered: boolean;
	regLoading: boolean;
	onClose: () => void;
	onRegister: () => void;
	formatDate: (d: string) => string;
}) {
	const gradient =
		conf.category === "Psikoloji" ? "linear-gradient(135deg,#667eea,#764ba2)" :
		conf.category === "Sa\u011fl\u0131k" ? "linear-gradient(135deg,#f093fb,#f5576c)" :
		conf.category === "\u0130leti\u015fim" ? "linear-gradient(135deg,#4facfe,#00f2fe)" :
		"linear-gradient(135deg,#43e97b,#38f9d7)";

	return (
		<div
			onClick={onClose}
			style={{
				position: "fixed", inset: 0,
				background: "rgba(15,23,42,0.65)",
				backdropFilter: "blur(8px)",
				display: "flex", alignItems: "center", justifyContent: "center",
				zIndex: 9999, padding: "16px",
			}}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					width: "100%", maxWidth: "380px",
					background: "#fff", borderRadius: "20px",
					boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
					overflow: "hidden",
					position: "relative",
				}}
			>
				{/* Gradient Header */}
				<div style={{
					background: gradient,
					padding: "22px 20px 18px",
					position: "relative",
				}}>
					{/* Kapat butonu */}
					<button onClick={onClose} style={{
						position: "absolute", top: "12px", right: "12px",
						background: "rgba(255,255,255,0.25)", border: "none",
						borderRadius: "50%", width: "28px", height: "28px",
						fontSize: "16px", color: "#fff", cursor: "pointer",
						display: "flex", alignItems: "center", justifyContent: "center",
						fontWeight: "700",
					}}>\u00d7</button>

					{/* Kategori badge */}
					<div style={{
						display: "inline-block",
						background: "rgba(255,255,255,0.25)",
						color: "#fff", borderRadius: "20px",
						padding: "3px 10px", fontSize: "11px",
						fontWeight: "700", textTransform: "uppercase",
						letterSpacing: "0.8px", marginBottom: "8px",
					}}>{conf.category}</div>

					{/* Ba\u015fl\u0131k */}
					<div style={{
						color: "#fff", fontSize: "18px",
						fontWeight: "800", lineHeight: "1.3",
						paddingRight: "30px",
						textShadow: "0 1px 3px rgba(0,0,0,0.2)",
					}}>{conf.title}</div>
				</div>

				{/* \u0130\u00e7erik */}
				<div style={{ padding: "16px 20px 0" }}>
					{/* A\u00e7\u0131klama */}
					<p style={{
						color: "#475569", fontSize: "13px",
						lineHeight: "1.6", margin: "0 0 14px",
					}}>{conf.description}</p>

					{/* Detay pill\u2019lar\u0131 */}
					<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
						{[
							{ icon: "\ud83d\udcc5", text: formatDate(conf.date) },
							{ icon: "\ud83d\udccd", text: conf.location },
							{ icon: "\ud83d\udc65", text: `${conf.registrations?.length ?? 0} ki\u015fi` },
						].map(({ icon, text }) => (
							<div key={text} style={{
								display: "flex", alignItems: "center", gap: "5px",
								background: "#f1f5f9", borderRadius: "20px",
								padding: "5px 12px", fontSize: "12px",
								fontWeight: "600", color: "#334155",
							}}>
								<span style={{ fontSize: "13px" }}>{icon}</span> {text}
							</div>
						))}
					</div>
				</div>

				{/* Buton */}
				<div style={{ padding: "0 20px 20px" }}>
					<button
						disabled={regLoading}
						onClick={onRegister}
						style={{
							width: "100%", padding: "12px",
							background: registered ? "#64748b" : gradient,
							color: "#fff", border: "none",
							borderRadius: "12px", fontSize: "14px",
							fontWeight: "700", cursor: regLoading ? "not-allowed" : "pointer",
							opacity: regLoading ? 0.7 : 1,
							transition: "opacity 0.2s",
						}}
					>
						{regLoading ? "\u0130\u015fleniyor..." : registered ? "\u274c Kay\u0131t\u0131 \u0130ptal Et" : "\u2705 Kay\u0131t Ol"}
					</button>
				</div>
			</div>
		</div>
	);
}
