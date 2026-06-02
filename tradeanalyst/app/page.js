"use client";
import { useState, useRef, useCallback } from "react";

// ─── HELPERS ───────────────────────────────────────────────────────────────────

const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });

const postJSON = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
};

const ImpactBadge = ({ score }) => {
  if (score >= 9) return <span style={{ color: "#ff4444", fontWeight: 700 }}>🔥 CRITICAL</span>;
  if (score >= 7) return <span style={{ color: "#ff8800", fontWeight: 700 }}>⚡ HIGH</span>;
  if (score >= 5) return <span style={{ color: "#ffcc00", fontWeight: 600 }}>📌 MEDIUM</span>;
  return <span style={{ color: "#8ab4d4", fontWeight: 500 }}>📄 LOW</span>;
};

const SentimentDot = ({ s }) => {
  const c = s === "Bullish" ? "#00ff99" : s === "Bearish" ? "#ff4444" : "#8ab4d4";
  return <span style={{ color: c, fontWeight: 700 }}>{s}</span>;
};

const RatingBadge = ({ rating }) => {
  const colors = { BUY: ["#00ff99", "#00331a"], WATCH: ["#ffcc00", "#332800"], AVOID: ["#ff4444", "#330a0a"] };
  const [fg, bg] = colors[rating] || ["#8ab4d4", "#0d1321"];
  return (
    <span style={{ background: bg, color: fg, border: `1px solid ${fg}44`, padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
      {rating}
    </span>
  );
};

const TABS = [
  { id: "analyze", label: "ANALYZE", icon: "◈" },
  { id: "news", label: "NEWS", icon: "⚡" },
  { id: "portfolio", label: "PORT", icon: "◎" },
];

// ─── STOCK RESULT ─────────────────────────────────────────────────────────────

function StockResult({ data }) {
  const [section, setSection] = useState("overview");
  const sections = ["overview", "thesis", "valuation", "technical", "trade", "rec"];
  const sectionLabels = { overview: "OVERVIEW", thesis: "THESIS", valuation: "VALUATION", technical: "TECHNICAL", trade: "TRADE PLAN", rec: "VERDICT" };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ background: "#0d1321", border: "1px solid #1e3a5f", borderRadius: 12, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
            {data.ticker} <span style={{ fontSize: 13, color: "#4a7fa5", fontWeight: 400 }}>{data.sector}</span>
          </div>
          <div style={{ fontSize: 11, color: "#4a7fa5", marginTop: 2 }}>{data.company} · {data.price_note}</div>
        </div>
        <RatingBadge rating={data.recommendation?.rating} />
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {sections.map((s) => (
          <button key={s} onClick={() => setSection(s)} style={{
            padding: "5px 10px", borderRadius: 6, border: `1px solid ${section === s ? "#00d4ff44" : "#1e3a5f"}`,
            background: section === s ? "#00d4ff15" : "transparent", color: section === s ? "#00d4ff" : "#4a7fa5",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5,
          }}>{sectionLabels[s]}</button>
        ))}
      </div>

      <div style={{ background: "#0d1321", border: "1px solid #1e3a5f", borderLeft: "3px solid #00d4ff", borderRadius: 12, padding: 16, fontSize: 12.5, lineHeight: 1.9, color: "#c8d9e8" }}>
        {section === "overview" && (
          <div>
            <p style={{ color: "#e2e8f0", marginBottom: 12 }}>{data.overview?.what}</p>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#4a7fa5", letterSpacing: 1, marginBottom: 6 }}>REVENUE SOURCES</div>
              {data.overview?.revenue_sources?.map((r, i) => <div key={i} style={{ color: "#8ab4d4" }}>→ {r}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <div style={{ background: "#00ff990d", border: "1px solid #00ff9922", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#00ff99", letterSpacing: 1, marginBottom: 6 }}>STRENGTHS</div>
                {data.overview?.strengths?.map((s, i) => <div key={i} style={{ color: "#8ab4d4", fontSize: 12 }}>✓ {s}</div>)}
              </div>
              <div style={{ background: "#ff44440d", border: "1px solid #ff444422", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#ff4444", letterSpacing: 1, marginBottom: 6 }}>WEAKNESSES</div>
                {data.overview?.weaknesses?.map((w, i) => <div key={i} style={{ color: "#8ab4d4", fontSize: 12 }}>✗ {w}</div>)}
              </div>
            </div>
            <div style={{ marginTop: 12, padding: "10px 12px", background: "#00d4ff08", border: "1px solid #00d4ff22", borderRadius: 8, fontStyle: "italic", color: "#8ab4d4" }}>
              "{data.overview?.narrative}"
            </div>
          </div>
        )}

        {section === "thesis" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ padding: 12, background: "#ffffff05", borderRadius: 8, color: "#e2e8f0" }}>{data.thesis?.why_people_buy}</div>
            {[["BULL CASE 🐂", data.thesis?.bull_case, "#00ff99"], ["BEAR CASE 🐻", data.thesis?.bear_case, "#ff4444"], ["BASE CASE ⚖️", data.thesis?.base_case, "#ffcc00"]].map(([label, text, color]) => (
              <div key={label} style={{ padding: 12, background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color, letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>{label}</div>
                <div>{text}</div>
              </div>
            ))}
          </div>
        )}

        {section === "valuation" && (
          <div>
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(data.valuation || {}).filter(([k]) => k !== "verdict").map(([k, v]) => (
                v?.value ? (
                  <div key={k} style={{ padding: "10px 12px", background: "#ffffff05", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#4a7fa5", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{k.toUpperCase().replace("_", " ")}</span>
                      <span style={{ color: "#00d4ff", fontWeight: 700 }}>{v.value}</span>
                    </div>
                    <div style={{ color: "#8ab4d4", fontSize: 12 }}>{v.explanation}</div>
                  </div>
                ) : null
              ))}
            </div>
            {data.valuation?.verdict && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#ffcc0010", border: "1px solid #ffcc0030", borderRadius: 8, color: "#ffcc00", fontWeight: 600 }}>
                ⚖️ {data.valuation.verdict}
              </div>
            )}
            {data.peers?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, color: "#4a7fa5", letterSpacing: 1, marginBottom: 8 }}>PEER COMPARISON</div>
                {data.peers.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", background: "#ffffff05", borderRadius: 6, marginBottom: 4 }}>
                    <span style={{ color: "#00d4ff", fontWeight: 700 }}>{p.ticker}</span>
                    <span style={{ color: "#4a7fa5" }}>P/S: {p.ps}</span>
                    <span style={{ color: "#4a7fa5" }}>Growth: {p.growth}</span>
                    <span style={{ color: "#8ab4d4", fontSize: 11 }}>{p.note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === "technical" && (
          <div style={{ display: "grid", gap: 8 }}>
            {[
              ["TREND", data.technical?.trend, data.technical?.trend === "Uptrend" ? "#00ff99" : data.technical?.trend === "Downtrend" ? "#ff4444" : "#ffcc00"],
              ["EMA STATUS", data.technical?.ema_status, "#8ab4d4"],
              ["SUPPORT", data.technical?.support, "#00ff99"],
              ["RESISTANCE", data.technical?.resistance, "#ff4444"],
              ["VOLUME", data.technical?.volume, "#8ab4d4"],
              ["MOMENTUM", data.technical?.momentum, "#00d4ff"],
              ["PATTERN", data.technical?.pattern, "#ffcc00"],
              ["BREAKOUT", data.technical?.breakout_status, "#00d4ff"],
            ].map(([label, value, color]) => value && (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#ffffff05", borderRadius: 8 }}>
                <span style={{ fontSize: 10, color: "#4a7fa5", letterSpacing: 1, fontWeight: 700 }}>{label}</span>
                <span style={{ color, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {section === "trade" && data.trade_plan && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div style={{ padding: 12, background: "#00ff9908", border: "1px solid #00ff9922", borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: "#00ff99", letterSpacing: 1, marginBottom: 4 }}>ENTRY ZONE</div>
                <div style={{ color: "#00ff99", fontWeight: 700, fontSize: 15 }}>{data.trade_plan.entry_zone}</div>
                <div style={{ color: "#8ab4d4", fontSize: 11, marginTop: 4 }}>{data.trade_plan.entry_reason}</div>
              </div>
              <div style={{ padding: 12, background: "#ff44440a", border: "1px solid #ff444422", borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: "#ff4444", letterSpacing: 1, marginBottom: 4 }}>STOP LOSS</div>
                <div style={{ color: "#ff4444", fontWeight: 700, fontSize: 15 }}>{data.trade_plan.stop_loss} <span style={{ fontSize: 12 }}>({data.trade_plan.stop_pct})</span></div>
                <div style={{ color: "#8ab4d4", fontSize: 11, marginTop: 4 }}>{data.trade_plan.stop_reason}</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
              {[data.trade_plan.tp1, data.trade_plan.tp2, data.trade_plan.tp3].filter(Boolean).map((tp, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#ffffff05", borderRadius: 8 }}>
                  <span style={{ color: "#4a7fa5", fontSize: 11, fontWeight: 700 }}>TP{i + 1}</span>
                  <span style={{ color: "#00ff99", fontWeight: 700 }}>{tp.price}</span>
                  <span style={{ color: "#00cc66" }}>{tp.pct}</span>
                  <span style={{ color: "#8ab4d4", fontSize: 11 }}>{tp.action}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, padding: 10, background: "#00d4ff0d", border: "1px solid #00d4ff22", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#4a7fa5", letterSpacing: 1 }}>R/R RATIO</div>
                <div style={{ color: "#00d4ff", fontWeight: 800, fontSize: 18, marginTop: 2 }}>{data.trade_plan.rr_ratio}</div>
              </div>
              <div style={{ flex: 2, padding: 10, background: "#ffffff05", borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: "#4a7fa5", letterSpacing: 1, marginBottom: 4 }}>POSITION SIZE</div>
                <div style={{ color: "#e2e8f0" }}>{data.trade_plan.position_size}</div>
                <div style={{ color: "#4a7fa5", fontSize: 11 }}>{data.trade_plan.shares_approx}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: 10, background: "#ff880010", border: "1px solid #ff880030", borderRadius: 8, fontSize: 12, color: "#ff8800" }}>
              ⚠️ INVALIDATION: {data.trade_plan.invalidation}
            </div>
          </div>
        )}

        {section === "rec" && data.recommendation && (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 16 }}><RatingBadge rating={data.recommendation.rating} /></div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
              <div><div style={{ fontSize: 10, color: "#4a7fa5", letterSpacing: 1 }}>CONVICTION</div><div style={{ color: "#e2e8f0", fontWeight: 700 }}>{data.recommendation.conviction}</div></div>
              <div><div style={{ fontSize: 10, color: "#4a7fa5", letterSpacing: 1 }}>TIMEFRAME</div><div style={{ color: "#e2e8f0", fontWeight: 700 }}>{data.recommendation.timeframe}</div></div>
            </div>
            <div style={{ padding: 14, background: "#ffffff05", borderRadius: 10, marginBottom: 10, color: "#c8d9e8", lineHeight: 1.8, textAlign: "left" }}>{data.recommendation.summary}</div>
            <div style={{ padding: 12, background: "#ff44440a", border: "1px solid #ff444422", borderRadius: 10, color: "#ff8888", textAlign: "left" }}>
              ⚠️ KEY RISK: {data.recommendation.key_risk}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NEWS RESULT ──────────────────────────────────────────────────────────────

function NewsResult({ data }) {
  const decayWeight = (hours) => {
    if (hours <= 24) return 100;
    if (hours <= 72) return 80;
    if (hours <= 168) return 60;
    if (hours <= 336) return 40;
    return 20;
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ background: "#0d1321", border: "1px solid #1e3a5f", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", fontSize: 16 }}>{data.ticker} · NEWS SENTIMENT</div>
          <SentimentDot s={data.sentiment?.overall} />
        </div>
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${data.sentiment?.bullish_pct}%`, background: "#00ff99" }} />
          <div style={{ width: `${data.sentiment?.neutral_pct}%`, background: "#4a7fa5" }} />
          <div style={{ width: `${data.sentiment?.bearish_pct}%`, background: "#ff4444" }} />
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
          <span style={{ color: "#00ff99" }}>🐂 {data.sentiment?.bullish_pct}%</span>
          <span style={{ color: "#4a7fa5" }}>⚖️ {data.sentiment?.neutral_pct}%</span>
          <span style={{ color: "#ff4444" }}>🐻 {data.sentiment?.bearish_pct}%</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#8ab4d4", fontStyle: "italic" }}>{data.sentiment?.summary}</div>
      </div>

      {data.news?.map((n, i) => {
        const decay = decayWeight(n.age_hours || 0);
        return (
          <div key={i} style={{ background: "#0d1321", border: "1px solid #1e3a5f", borderRadius: 10, padding: 14, marginBottom: 8, opacity: 0.6 + decay * 0.004 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <ImpactBadge score={n.impact_score} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <SentimentDot s={n.sentiment} />
                <span style={{ fontSize: 10, color: "#2d5a7a", background: "#0a1628", padding: "2px 6px", borderRadius: 4 }}>{decay}% weight</span>
              </div>
            </div>
            <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{n.headline}</div>
            <div style={{ fontSize: 11, color: "#2d5a7a", marginBottom: 8 }}>{n.date} · {n.source} · {n.category}</div>
            <div style={{ color: "#8ab4d4", fontSize: 12, marginBottom: 6 }}>{n.summary}</div>
            <div style={{ padding: "6px 10px", background: "#00d4ff08", borderLeft: "2px solid #00d4ff33", fontSize: 12, color: "#6bafd4" }}>💡 {n.why_matters}</div>
          </div>
        );
      })}

      {data.catalysts?.length > 0 && (
        <div style={{ background: "#0d1321", border: "1px solid #ffcc0030", borderRadius: 10, padding: 14, marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "#ffcc00", letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>📅 UPCOMING CATALYSTS</div>
          {data.catalysts.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < data.catalysts.length - 1 ? "1px solid #1e3a5f" : "none" }}>
              <span style={{ color: "#c8d9e8" }}>{c.event}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "#4a7fa5", fontSize: 11 }}>{c.date}</span>
                <span style={{ color: c.direction === "Bullish" ? "#00ff99" : c.direction === "Bearish" ? "#ff4444" : "#ffcc00", fontSize: 11 }}>{c.impact}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.key_takeaway && (
        <div style={{ padding: "12px 14px", background: "#00d4ff0a", border: "1px solid #00d4ff22", borderRadius: 10, color: "#6bafd4", fontSize: 13, lineHeight: 1.7 }}>
          🎯 {data.key_takeaway}
        </div>
      )}
    </div>
  );
}

// ─── PORTFOLIO RESULT ─────────────────────────────────────────────────────────

function PortfolioResult({ data }) {
  const scoreColor = data.health_score >= 75 ? "#00ff99" : data.health_score >= 50 ? "#ffcc00" : "#ff4444";
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ background: "#0d1321", border: "1px solid #1e3a5f", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#4a7fa5", letterSpacing: 1 }}>PORTFOLIO VALUE</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>${data.total_value?.toLocaleString()}</div>
            <div style={{ color: "#00ff99", fontWeight: 700 }}>+${data.total_pnl_usd} (+{data.total_pnl_pct}%)</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#4a7fa5", letterSpacing: 1, marginBottom: 4 }}>HEALTH SCORE</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: scoreColor, fontFamily: "'Syne', sans-serif" }}>{data.health_score}</div>
            <div style={{ fontSize: 11, color: scoreColor }}>{data.health_label}</div>
          </div>
        </div>
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4a7fa5", marginBottom: 4 }}>
            <span>INVESTED ${data.invested?.toLocaleString()}</span>
            <span>CASH ${data.cash?.toLocaleString()} ({data.cash_pct}%)</span>
          </div>
          <div style={{ height: 6, background: "#0a1628", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${100 - data.cash_pct}%`, background: "linear-gradient(90deg, #0055cc, #00d4ff)", borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {data.holdings?.map((h, i) => (
        <div key={i} style={{ background: "#0d1321", border: "1px solid #1e3a5f", borderRadius: 10, padding: 14, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>{h.ticker}</div>
              <div style={{ fontSize: 11, color: "#4a7fa5" }}>{h.shares} shares · avg ~${h.avg_cost_est}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, color: "#e2e8f0" }}>${h.market_value?.toLocaleString()}</div>
              <div style={{ color: h.pnl_pct >= 0 ? "#00ff99" : "#ff4444", fontWeight: 700 }}>{h.pnl_pct >= 0 ? "+" : ""}{h.pnl_pct}%</div>
              <div style={{ fontSize: 11, color: "#4a7fa5" }}>{h.allocation_pct}% of port</div>
            </div>
          </div>
        </div>
      ))}

      {data.risks?.length > 0 && (
        <div style={{ background: "#0d1321", border: "1px solid #1e3a5f", borderRadius: 10, padding: 14, marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "#ff8800", letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>⚠️ RISK ANALYSIS</div>
          {data.risks.map((r, i) => (
            <div key={i} style={{ padding: "7px 0", borderBottom: i < data.risks.length - 1 ? "1px solid #1e3a5f" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{r.type}</span>
                <span style={{ color: r.level === "High" ? "#ff4444" : r.level === "Medium" ? "#ffcc00" : "#00ff99", fontSize: 11, fontWeight: 700 }}>{r.level}</span>
              </div>
              <div style={{ color: "#8ab4d4", fontSize: 12 }}>{r.note}</div>
            </div>
          ))}
        </div>
      )}

      {data.recommendations?.map((r, i) => (
        <div key={i} style={{ padding: "10px 14px", background: r.priority === "High" ? "#00d4ff0a" : "#ffffff05", border: `1px solid ${r.priority === "High" ? "#00d4ff22" : "#1e3a5f"}`, borderRadius: 10, marginBottom: 8, display: "flex", gap: 12 }}>
          <div style={{ background: "#00d4ff22", color: "#00d4ff", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", height: "fit-content" }}>{r.action}</div>
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{r.target}</div>
            <div style={{ color: "#8ab4d4", fontSize: 12 }}>{r.reason}</div>
          </div>
        </div>
      ))}

      <div style={{ padding: "12px 14px", background: "#00ff9908", border: "1px solid #00ff9922", borderRadius: 10, color: "#8ab4d4", fontSize: 13, lineHeight: 1.7 }}>
        📊 {data.summary}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [tab, setTab] = useState("analyze");
  const [ticker, setTicker] = useState("");
  const [image, setImage] = useState(null);
  const [imageB64, setImageB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [stockData, setStockData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [portData, setPortData] = useState(null);
  const fileRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(file));
    setImageB64(await fileToBase64(file));
    setError("");
  }, []);

  const clearAll = () => {
    setImage(null); setImageB64(null); setError("");
    setStockData(null); setNewsData(null); setPortData(null);
  };

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;
    setLoading(true); setError(""); setStockData(null); setNewsData(null);
    const t = ticker.trim().toUpperCase();
    try {
      setLoadingMsg("🔍 Analyzing " + t + "...");
      const stock = await postJSON("/api/analyze", { ticker: t, imageB64 });
      setStockData(stock);
      setLoadingMsg("⚡ Fetching news for " + t + "...");
      const news = await postJSON("/api/news", { ticker: t });
      setNewsData(news);
    } catch (e) {
      setError("วิเคราะห์ไม่สำเร็จ: " + e.message);
    } finally {
      setLoading(false); setLoadingMsg("");
    }
  };

  const handleNewsOnly = async () => {
    if (!ticker.trim()) return;
    setLoading(true); setError(""); setNewsData(null);
    const t = ticker.trim().toUpperCase();
    try {
      setLoadingMsg("⚡ Fetching news for " + t + "...");
      const news = await postJSON("/api/news", { ticker: t });
      setNewsData(news);
    } catch (e) {
      setError("ดึงข่าวไม่สำเร็จ: " + e.message);
    } finally {
      setLoading(false); setLoadingMsg("");
    }
  };

  const handlePortfolio = async () => {
    if (!imageB64) return;
    setLoading(true); setError(""); setPortData(null);
    try {
      setLoadingMsg("💼 Analyzing portfolio...");
      const port = await postJSON("/api/portfolio", { imageB64 });
      setPortData(port);
    } catch (e) {
      setError("วิเคราะห์พอร์ตไม่สำเร็จ: " + e.message);
    } finally {
      setLoading(false); setLoadingMsg("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060b14", fontFamily: "'IBM Plex Mono', monospace", color: "#e2e8f0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #060b14; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ background: "linear-gradient(180deg, #0a1628 0%, #060b14 100%)", borderBottom: "1px solid #0d2040", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            <span style={{ color: "#00d4ff" }}>TRADE</span>ANALYST
            <span style={{ fontSize: 9, color: "#2d5a7a", letterSpacing: 2, marginLeft: 6 }}>PRO v3</span>
          </div>
          <div style={{ fontSize: 9, color: "#2d5a7a", letterSpacing: 1.5 }}>PERSONAL TRADING OS · NUEA</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); clearAll(); }} style={{
              padding: "6px 12px", borderRadius: 8, border: `1px solid ${tab === t.id ? "#00d4ff44" : "#0d2040"}`,
              background: tab === t.id ? "#00d4ff12" : "transparent", color: tab === t.id ? "#00d4ff" : "#2d5a7a",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5,
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px", maxWidth: 680, margin: "0 auto", animation: "slideUp .35s ease" }}>
        {tab === "analyze" && (
          <div>
            <div style={{ fontSize: 10, color: "#2d5a7a", letterSpacing: 2, marginBottom: 16 }}>STOCK ANALYSIS + VALUATION + REAL-TIME NEWS</div>
            <div style={{ background: "#0a1628", border: "1px solid #0d2040", borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: "#2d5a7a", fontSize: 14 }}>$</span>
              <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleAnalyze()} placeholder="TICKER (e.g. RKLB)" style={{ flex: 1, background: "transparent", border: "none", color: "#00d4ff", fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }} />
              {ticker && <button onClick={() => setTicker("")} style={{ background: "none", border: "none", color: "#2d5a7a", cursor: "pointer", fontSize: 14 }}>✕</button>}
            </div>
            <div onClick={() => fileRef.current?.click()} style={{ background: "#0a1628", border: `1px dashed ${image ? "#00d4ff44" : "#0d2040"}`, borderRadius: 10, padding: image ? 0 : "14px", marginBottom: 10, cursor: "pointer", overflow: "hidden", position: "relative" }}>
              {image ? (
                <>
                  <img src={image} alt="chart" style={{ width: "100%", maxHeight: 200, objectFit: "contain", display: "block", background: "#060b14" }} />
                  <button onClick={(e) => { e.stopPropagation(); setImage(null); setImageB64(null); }} style={{ position: "absolute", top: 8, right: 8, background: "#060b14cc", border: "1px solid #0d2040", color: "#8ab4d4", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>✕ ลบ</button>
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#2d5a7a", fontSize: 12 }}>📈 แนบ chart screenshot (optional)</div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
              <button onClick={handleAnalyze} disabled={!ticker.trim() || loading} style={{ padding: "13px", borderRadius: 10, border: "none", cursor: ticker.trim() && !loading ? "pointer" : "not-allowed", background: ticker.trim() && !loading ? "linear-gradient(135deg, #0044bb, #0099ff)" : "#0a1628", color: ticker.trim() && !loading ? "#fff" : "#2d5a7a", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                {loading && loadingMsg.includes("Analyzing") ? "⏳ ANALYZING..." : "⚡ FULL ANALYSIS"}
              </button>
              <button onClick={handleNewsOnly} disabled={!ticker.trim() || loading} style={{ padding: "13px", borderRadius: 10, border: "1px solid #0d2040", cursor: ticker.trim() && !loading ? "pointer" : "not-allowed", background: "transparent", color: ticker.trim() && !loading ? "#4a7fa5" : "#2d5a7a", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600 }}>📰 NEWS</button>
            </div>
            {loading && <div style={{ textAlign: "center", padding: 20, color: "#4a7fa5", fontSize: 12, animation: "pulse 1.5s ease infinite" }}>{loadingMsg}</div>}
            {error && <div style={{ padding: 12, background: "#1a0808", border: "1px solid #ff444433", borderLeft: "3px solid #ff4444", borderRadius: 10, color: "#ff8888", fontSize: 12, marginTop: 10 }}>⚠️ {error}</div>}
            {stockData && <StockResult data={stockData} />}
            {newsData && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, color: "#2d5a7a", letterSpacing: 2, marginBottom: 10 }}>REAL-TIME NEWS</div>
                <NewsResult data={newsData} />
              </div>
            )}
          </div>
        )}

        {tab === "news" && (
          <div>
            <div style={{ fontSize: 10, color: "#2d5a7a", letterSpacing: 2, marginBottom: 16 }}>REAL-TIME NEWS INTELLIGENCE</div>
            <div style={{ background: "#0a1628", border: "1px solid #0d2040", borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: "#2d5a7a", fontSize: 14 }}>$</span>
              <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleNewsOnly()} placeholder="TICKER" style={{ flex: 1, background: "transparent", border: "none", color: "#00d4ff", fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }} />
            </div>
            <button onClick={handleNewsOnly} disabled={!ticker.trim() || loading} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", cursor: ticker.trim() && !loading ? "pointer" : "not-allowed", background: ticker.trim() && !loading ? "linear-gradient(135deg, #331100, #ff6600)" : "#0a1628", color: ticker.trim() && !loading ? "#fff" : "#2d5a7a", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              {loading ? loadingMsg : "⚡ FETCH LATEST NEWS"}
            </button>
            {error && <div style={{ padding: 12, background: "#1a0808", border: "1px solid #ff444433", borderLeft: "3px solid #ff4444", borderRadius: 10, color: "#ff8888", fontSize: 12, marginTop: 10 }}>⚠️ {error}</div>}
            {newsData && <NewsResult data={newsData} />}
          </div>
        )}

        {tab === "portfolio" && (
          <div>
            <div style={{ fontSize: 10, color: "#2d5a7a", letterSpacing: 2, marginBottom: 16 }}>PORTFOLIO ANALYZER</div>
            <div onClick={() => fileRef.current?.click()} style={{ background: "#0a1628", border: `1px dashed ${image ? "#00ff9944" : "#0d2040"}`, borderRadius: 12, marginBottom: 12, cursor: "pointer", overflow: "hidden", position: "relative", minHeight: image ? 0 : 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {image ? (
                <>
                  <img src={image} alt="port" style={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block", background: "#060b14" }} />
                  <button onClick={(e) => { e.stopPropagation(); setImage(null); setImageB64(null); }} style={{ position: "absolute", top: 8, right: 8, background: "#060b14cc", border: "1px solid #0d2040", color: "#8ab4d4", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>✕ ลบ</button>
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#2d5a7a", fontSize: 12, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>💼</div>อัปโหลดรูปหน้าพอร์ต Webull
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
            <button onClick={handlePortfolio} disabled={!imageB64 || loading} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", cursor: imageB64 && !loading ? "pointer" : "not-allowed", background: imageB64 && !loading ? "linear-gradient(135deg, #003322, #00cc66)" : "#0a1628", color: imageB64 && !loading ? "#fff" : "#2d5a7a", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              {loading ? loadingMsg : "📊 ANALYZE PORTFOLIO"}
            </button>
            {error && <div style={{ padding: 12, background: "#1a0808", border: "1px solid #ff444433", borderLeft: "3px solid #ff4444", borderRadius: 10, color: "#ff8888", fontSize: 12, marginTop: 10 }}>⚠️ {error}</div>}
            {portData && <PortfolioResult data={portData} />}
          </div>
        )}
      </div>
    </div>
  );
}
