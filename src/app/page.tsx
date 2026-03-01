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
	const [activeTab, setActiveTab] = useState<"egitimler" | "sosyal">("egitimler");
	const [activeCategory, setActiveCategory] = useState("Tümü");

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
					onClick={() => setActiveTab("sosyal")}
					style={{
						padding: "12px 28px", border: "none", background: "none", cursor: "pointer",
						fontWeight: "700", fontSize: "16px",
						color: activeTab === "sosyal" ? "var(--primary-color)" : "var(--text-light)",
						borderBottom: activeTab === "sosyal" ? "3px solid var(--primary-color)" : "3px solid transparent",
						marginBottom: "-2px", transition: "all 0.2s"
					}}
				>
					🌟 Sosyal
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
									<div key={conf.id} className="conference-card fade-in">
										<div className={`card-img-placeholder ${getCategoryBg(conf.category)}`}>✨</div>
										<div className="card-content">
											<span className="category-tag">{conf.category}</span>
											<h3 className="card-title">{conf.title}</h3>
											<p className="card-desc">
												{conf.description.length > 100 ? conf.description.substring(0, 100) + "..." : conf.description}
											</p>
											<div className="card-meta">
												<div className="meta-item">📅 {formatDate(conf.date)}</div>
												<div className="meta-item">📍 {conf.location}</div>
											</div>
											<button
												onClick={() => handleRegistration(conf.id, registered)}
												className={registered ? "btn-secondary" : "btn-primary"}
												style={{ marginTop: "auto", width: "100%" }}
											>
												{registered ? "Kaydı İptal Et" : "Kayıt Ol"}
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* SOSYAL SEKMESİ */}
			{activeTab === "sosyal" && (
				<div style={{ maxWidth: "720px", margin: "0 auto" }}>
					{/* Yeni Paylaşım Formu */}
					<div style={{ background: "var(--white)", borderRadius: "16px", padding: "24px", marginBottom: "28px", boxShadow: "var(--shadow-md)", border: "1px solid #e2e8f0" }}>
						<h3 style={{ marginBottom: "16px", color: "var(--text-dark)", fontSize: "16px", fontWeight: "700" }}>
							✍️ Etkinlik Paylaşımı Yap
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

					{/* Paylaşım Listesi */}
					{posts.length === 0 ? (
						<div style={{ textAlign: "center", padding: "50px", color: "var(--text-light)" }}>
							<div style={{ fontSize: "48px", marginBottom: "12px" }}>🌟</div>
							<p style={{ fontSize: "16px" }}>Henüz paylaşım yok. İlk paylaşımı siz yapın!</p>
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
		</div>
	);
}
