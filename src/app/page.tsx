"use client";

import { useEffect, useState } from "react";
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
	email: string;
};

export default function Home() {
	const [conferences, setConferences] = useState<Conference[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeCategory, setActiveCategory] = useState("Tümü");

	// Örnek kategoriler, veritabanından dinamik de çekilebilir
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

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
			fetchConferences();
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
				// Başarılı işlem sonrası listeyi güncelleyelim
				fetchConferences(activeCategory);
			} else {
				const data = await res.json();
				alert(data.message);
			}
		} catch (err) {
			alert("Bir hata oluştu.");
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

	if (!user) return null; // Hydration hatalarını önlemek için

	return (
		<div className="container fade-in">
			<div className="page-header">
				<h1 className="page-title">Eğitmen Konferans Panosu</h1>
				<p className="page-desc">
					LÖSEV tarafından düzenlenen güncel eğitim ve konferanslara aşağıdan göz atabilir ve tek tıkla kaydınızı oluşturabilirsiniz.
				</p>
			</div>

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
								<div className={`card-img-placeholder ${getCategoryBg(conf.category)}`}>
									{/* Buraya sonrasında gerçek resimler konabilir */}
									✨
								</div>
								<div className="card-content">
									<span className="category-tag">{conf.category}</span>
									<h3 className="card-title">{conf.title}</h3>
									<p className="card-desc">
										{conf.description.length > 100
											? conf.description.substring(0, 100) + "..."
											: conf.description}
									</p>

									<div className="card-meta">
										<div className="meta-item">
											📅 {new Date(conf.date).toLocaleDateString("tr-TR")}
										</div>
										<div className="meta-item">
											📍 {conf.location}
										</div>
									</div>

									<button
										onClick={() => handleRegistration(conf.id, registered)}
										className={registered ? "btn-secondary" : "btn-primary"}
										style={{ marginTop: "auto", width: "100%" }}
									>
										{registered ? "Abonelikten Çık" : "Kayıt Ol"}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
