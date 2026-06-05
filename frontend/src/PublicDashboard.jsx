import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

// ─── Yardımcı sabit & konfigürasyon (Veritabanımıza uygun hale getirildi) ───
const STATUS_CONFIG = {
  TAMAMLANDI: {
    label: "Akredite Programlar",
    statusText: "Tamamlandı",
    dot: "#22c55e",
    badge: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
    section: { accent: "#22c55e", headerBg: "linear-gradient(135deg,#f0fdf4,#dcfce7)" },
    icon: "✅",
  },
  SURECTE: {
    label: "Başvuru Sürecindekiler",
    statusText: "Başvuru Sürecinde",
    dot: "#f59e0b",
    badge: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
    section: { accent: "#f59e0b", headerBg: "linear-gradient(135deg,#fffbeb,#fef3c7)" },
    icon: "🔄",
  },
  YENI_BASVURU: {
    label: "Yeni Başvurular",
    statusText: "Başvuru Yapıldı",
    dot: "#6366f1",
    badge: { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
    section: { accent: "#6366f1", headerBg: "linear-gradient(135deg,#f5f3ff,#ede9fe)" },
    icon: "📝",
  },
};

// ─── Alt bileşenler ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "#fff", border: `1.5px solid ${color}22`,
      borderRadius: 14, padding: "14px 20px",
      boxShadow: `0 2px 12px ${color}18`,
      flex: "1 1 160px", minWidth: 140,
      transition: "transform .18s,box-shadow .18s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${color}28`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 2px 12px ${color}18`; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

function ProgramCard({ program }) {
  const cfg = STATUS_CONFIG[program.status];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1.5px solid ${hovered ? cfg.dot + "55" : "#e2e8f0"}`,
        padding: "18px 20px",
        boxShadow: hovered ? `0 8px 28px ${cfg.dot}20` : "0 2px 8px #0000000a",
        transition: "all .2s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex", flexDirection: "column", gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🎓</span> {/* Veritabanında her bölüm için ayrı ikon tutmadığımız için standart ikon */}
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", lineHeight: 1.4 }}>
          {program.program_name}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 32 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          <span style={{ color: "#94a3b8" }}>Akreditasyon: </span>
          <span style={{ fontWeight: 600, color: "#475569" }}>{program.accreditation_type}</span>
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          <span style={{ color: "#94a3b8" }}>Tarih: </span>
          <span style={{ fontWeight: 500 }}>{program.date_info}</span>
        </div>
      </div>

      <div style={{ paddingLeft: 32 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11, fontWeight: 700,
          padding: "4px 10px", borderRadius: 20,
          background: cfg.badge.bg, color: cfg.badge.text,
          border: `1px solid ${cfg.badge.border}`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: cfg.dot, display: "inline-block",
          }} />
          {cfg.statusText}
        </span>
      </div>
    </div>
  );
}

function SectionGroup({ statusKey, programs }) {
  const cfg = STATUS_CONFIG[statusKey];
  const filtered = programs.filter(p => p.status === statusKey);
  if (!filtered.length) return null;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: `1.5px solid ${cfg.dot}33`,
      overflow: "hidden",
      boxShadow: "0 4px 20px #0000000d",
    }}>
      <div style={{
        background: cfg.section.headerBg,
        borderBottom: `2px solid ${cfg.dot}33`,
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: "50%",
          background: cfg.dot, display: "inline-block",
          boxShadow: `0 0 0 3px ${cfg.dot}33`,
        }} />
        <h2 style={{
          margin: 0, fontSize: 16, fontWeight: 800,
          color: "#1e293b", letterSpacing: "-0.3px",
        }}>
          {cfg.icon} {cfg.label}
        </h2>
        <span style={{
          marginLeft: "auto",
          background: cfg.dot, color: "#fff",
          fontSize: 11, fontWeight: 800,
          padding: "3px 10px", borderRadius: 20,
        }}>
          {filtered.length}
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16, padding: 20,
      }}>
        {filtered.map(p => <ProgramCard key={p.id} program={p} />)}
      </div>
    </div>
  );
}

// ─── Ana bileşen ────────────────────────────────────────────────────────────────
export default function AkreditasyonPage() {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // VERİTABANINDAN GERÇEK VERİLERİ ÇEKİYORUZ
  useEffect(() => {
    const fetchVerileri = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accreditations`);
        const data = await response.json();
        setPrograms(data);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      }
    };
    fetchVerileri();
  }, []);

  // İSTATİSTİKLERİ GERÇEK VERİLERDEN DİNAMİK HESAPLIYORUZ
  const dynamicStats = [
    { icon: "📋", label: "Toplam Program", value: programs.length, color: "#3b82f6" },
    { icon: "✅", label: "Akredite", value: programs.filter(p => p.status === 'TAMAMLANDI').length, color: "#22c55e" },
    { icon: "🔄", label: "Başvuru Sürecinde", value: programs.filter(p => p.status === 'SURECTE').length, color: "#f59e0b" },
    { icon: "📝", label: "Başvuru Yapılan", value: programs.filter(p => p.status === 'YENI_BASVURU').length, color: "#6366f1" },
  ];

  const filtered = programs.filter(p => {
    // Veritabanı sütunumuz 'program_name' olduğu için oradan filtreliyoruz
    const matchSearch = p.program_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      background: "linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)",
      minHeight: "100vh",
      padding: "32px 20px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ── Üst bar: İstatistikler (Gösterim kısmı kaldırıldı) ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "stretch" }}>
          {dynamicStats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── Arama & Filtre ── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Program ara..."
            style={{
              flex: "1 1 240px",
              padding: "12px 18px",
              borderRadius: 12,
              border: "1.5px solid #e2e8f0",
              fontSize: 14,
              background: "#fff",
              outline: "none",
              boxShadow: "0 2px 8px #0000000a",
              fontFamily: "inherit",
            }}
          />
          {[
            { key: "all", label: "Hepsi" },
            { key: "TAMAMLANDI", label: "✅ Akredite" },
            { key: "SURECTE", label: "🔄 Süreçte" },
            { key: "YENI_BASVURU", label: "📝 Başvurulan" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: `1.5px solid ${statusFilter === f.key ? "#3b82f6" : "#e2e8f0"}`,
                background: statusFilter === f.key ? "#3b82f6" : "#fff",
                color: statusFilter === f.key ? "#fff" : "#475569",
                fontSize: 13, fontWeight: 700,
                cursor: "pointer",
                transition: "all .15s",
                fontFamily: "inherit",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Bölümler (Veritabanındaki anahtarlarla çalışıyor) ── */}
        {["TAMAMLANDI", "SURECTE", "YENI_BASVURU"].map(key => (
          <SectionGroup key={key} statusKey={key} programs={filtered} />
        ))}

        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            color: "#94a3b8", fontSize: 16, fontWeight: 600,
          }}>
            🔍 Aramanıza uygun program bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}