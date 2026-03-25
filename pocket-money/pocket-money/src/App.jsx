import { useState, useEffect } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "./firebase.js";

// ─── Config ────────────────────────────────────────────────────────────────
const USERS = [
  { id: "ima",   label: "אמא",   emoji: "👩", color: "#f9a8d4", accent: "#ec4899" },
  { id: "marom", label: "מרום",  emoji: "🚀", color: "#86efac", accent: "#22c55e" },
  { id: "matar", label: "מטר",   emoji: "⚽", color: "#93c5fd", accent: "#3b82f6" },
];
const KIDS = ["marom", "matar"];

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt      = (n) => `₪${Math.abs(n).toFixed(2)}`;
const fmtSigned = (n) => (n >= 0 ? `+₪${n.toFixed(2)}` : `-₪${Math.abs(n).toFixed(2)}`);
const fmtDate  = (ts) =>
  new Date(ts).toLocaleString("he-IL", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });

function emptyAccount() { return { balance: 0, transactions: {} }; }

// ─── Components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:60 }}>
      <div style={{
        width:44, height:44, borderRadius:"50%",
        border:"3px solid rgba(255,255,255,0.1)",
        borderTop:"3px solid #86efac",
        animation:"spin 0.8s linear infinite",
      }}/>
      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.85rem" }}>טוען נתונים…</span>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32, padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🐷</div>
        <h1 style={{
          fontSize:"2rem", fontWeight:900, margin:0,
          background:"linear-gradient(90deg,#86efac,#93c5fd,#f9a8d4)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>קופת דמי הכיס</h1>
        <p style={{ color:"rgba(255,255,255,0.35)", marginTop:6, fontSize:"0.9rem" }}>מי את/ה?</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:280 }}>
        {USERS.map((u) => (
          <button key={u.id} onClick={() => onLogin(u.id)} style={{
            padding:"18px 20px", borderRadius:18,
            border:`2px solid ${u.color}55`,
            background:`linear-gradient(135deg,${u.color}18,${u.color}08)`,
            color:"#fff", display:"flex", alignItems:"center", gap:14,
            cursor:"pointer", transition:"all 0.2s",
            fontSize:"1.15rem", fontWeight:700,
          }}
          onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.03)"; e.currentTarget.style.borderColor=u.color; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.borderColor=`${u.color}55`; }}
          >
            <span style={{ fontSize:"1.8rem" }}>{u.emoji}</span>
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BalanceCard({ kidId, acct, color }) {
  const user = USERS.find(u => u.id === kidId);
  const positive = acct.balance >= 0;
  const txCount = Object.keys(acct.transactions || {}).length;
  return (
    <div style={{
      background:`linear-gradient(135deg,${color}20,${color}08)`,
      border:`1px solid ${color}44`, borderRadius:20, padding:"18px 20px",
      boxShadow:`0 6px 24px ${color}22`, position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:-30, left:-20, width:100, height:100, borderRadius:"50%", background:`${color}10` }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.45)", marginBottom:4 }}>
            {user.emoji} החשבון שלי
          </div>
          <div style={{
            fontSize:"2.4rem", fontWeight:900,
            color: positive ? "#4ade80" : "#f87171",
            textShadow: positive ? "0 0 24px #4ade8066" : "0 0 24px #f8717166",
            letterSpacing:-1,
          }}>
            {fmt(acct.balance)}
          </div>
        </div>
        <div style={{
          background: positive ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
          borderRadius:12, padding:"6px 10px",
          fontSize:"0.78rem", fontWeight:700,
          color: positive ? "#4ade80" : "#f87171",
        }}>
          {txCount} פעולות
        </div>
      </div>
    </div>
  );
}

function ActionForm({ onSubmit }) {
  const [type, setType]     = useState("add");
  const [amount, setAmount] = useState("");
  const [note, setNote]     = useState("");
  const [busy, setBusy]     = useState(false);

  async function handleSubmit() {
    const val = parseFloat(amount);
    if (!val || val <= 0 || busy) return;
    setBusy(true);
    await onSubmit({ delta: type === "add" ? val : -val, note: note.trim() || (type === "add" ? "הפקדה" : "משיכה") });
    setAmount(""); setNote(""); setBusy(false);
  }

  return (
    <div style={{
      background:"rgba(255,255,255,0.05)", backdropFilter:"blur(10px)",
      border:"1px solid rgba(255,255,255,0.10)", borderRadius:20, padding:18, marginTop:16,
    }}>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[{val:"add",label:"➕ הפקדה",c:"#4ade80"},{val:"remove",label:"➖ משיכה",c:"#f87171"}].map(t=>(
          <button key={t.val} onClick={()=>setType(t.val)} style={{
            flex:1, padding:"9px 0", borderRadius:12,
            border: type===t.val ? `2px solid ${t.c}` : "2px solid rgba(255,255,255,0.08)",
            background: type===t.val ? `${t.c}22` : "transparent",
            color: type===t.val ? t.c : "rgba(255,255,255,0.35)",
            fontWeight:700, fontSize:"0.9rem", cursor:"pointer", transition:"all 0.18s",
          }}>{t.label}</button>
        ))}
      </div>
      <input type="number" min="0" step="0.5" value={amount}
        onChange={e=>setAmount(e.target.value)} placeholder="סכום (₪)"
        style={{
          width:"100%", padding:"11px 14px", borderRadius:12, marginBottom:10,
          background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
          color:"#fff", fontSize:"1.1rem", fontWeight:700, boxSizing:"border-box", outline:"none",
        }}
      />
      <input type="text" value={note}
        onChange={e=>setNote(e.target.value)} placeholder="הערה (אופציונלי)"
        style={{
          width:"100%", padding:"10px 14px", borderRadius:12, marginBottom:14,
          background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
          color:"#fff", fontSize:"0.9rem", boxSizing:"border-box", outline:"none",
        }}
      />
      <button onClick={handleSubmit} disabled={!amount||parseFloat(amount)<=0||busy} style={{
        width:"100%", padding:"13px 0", borderRadius:14,
        background: type==="add" ? "linear-gradient(135deg,#4ade80,#22c55e)" : "linear-gradient(135deg,#f87171,#ef4444)",
        border:"none", color:"#fff", fontWeight:800, fontSize:"1rem", cursor:"pointer",
        opacity:(!amount||parseFloat(amount)<=0||busy)?0.4:1, transition:"all 0.18s",
        boxShadow: type==="add" ? "0 4px 16px #22c55e44" : "0 4px 16px #ef444444",
      }}>
        {busy ? "שומר…" : type==="add" ? "הוסף לחשבון" : "הורד מחשבון"}
      </button>
    </div>
  );
}

function TxList({ transactions, onClear, isOwn }) {
  const txArray = Object.entries(transactions || {})
    .map(([,v]) => v)
    .sort((a,b) => b.ts - a.ts)
    .slice(0, 50);

  if (txArray.length === 0)
    return (
      <div style={{ textAlign:"center", padding:"28px 0", color:"rgba(255,255,255,0.25)", fontSize:"0.88rem" }}>
        <div style={{ fontSize:"2rem", marginBottom:6 }}>📭</div>
        אין עדיין פעולות
      </div>
    );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.4)", fontWeight:600 }}>היסטוריה</span>
        {isOwn && (
          <button onClick={onClear} style={{
            background:"rgba(248,113,113,0.12)", border:"1px solid rgba(248,113,113,0.25)",
            color:"#f87171", borderRadius:8, padding:"3px 10px", fontSize:"0.73rem", cursor:"pointer",
          }}>איפוס</button>
        )}
      </div>
      {txArray.map((tx, i) => {
        const byUser = USERS.find(u => u.id === tx.by);
        return (
          <div key={tx.ts} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"10px 0",
            borderBottom: i < txArray.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background: tx.delta>0 ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem",
              }}>
                {tx.delta > 0 ? "💚" : "🔴"}
              </div>
              <div>
                <div style={{ fontSize:"0.88rem", fontWeight:600 }}>{tx.note}</div>
                <div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.3)" }}>
                  {byUser ? `${byUser.emoji} ` : ""}{fmtDate(tx.ts)}
                </div>
              </div>
            </div>
            <div style={{ fontWeight:800, fontSize:"0.95rem", color: tx.delta>0?"#4ade80":"#f87171" }}>
              {fmtSigned(tx.delta)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function App() {
  const [userId, setUserId]       = useState(null);
  const [data, setData]           = useState(null);
  const [flash, setFlash]         = useState(null);
  const [activeKid, setActiveKid] = useState(KIDS[0]); // for parent tab

  // Real-time listener
  useEffect(() => {
    const dbRef = ref(db, "accounts");
    const unsub = onValue(dbRef, (snap) => {
      const val = snap.val();
      setData(val || { marom: emptyAccount(), matar: emptyAccount() });
    });
    return () => unsub();
  }, []);

  const user     = USERS.find(u => u.id === userId);
  const isParent = userId === "ima";

  async function handleTransaction(kidId, { delta, note }) {
    const now    = Date.now();
    const txKey  = `tx_${now}`;
    const kidRef = ref(db, `accounts/${kidId}`);

    // Read current value, then write updated value
    const snap = await get(kidRef);
    const acct = snap.val() || emptyAccount();
    const updated = {
      balance: (acct.balance || 0) + delta,
      transactions: {
        ...(acct.transactions || {}),
        [txKey]: { delta, note, ts: now, by: userId },
      },
    };
    await set(kidRef, updated);

    setFlash({ type: delta > 0 ? "add" : "remove" });
    setTimeout(() => setFlash(null), 1100);
  }

  async function handleClear(kidId) {
    if (!window.confirm(`למחוק את כל ההיסטוריה של ${USERS.find(u=>u.id===kidId).label}?`)) return;
    await set(ref(db, `accounts/${kidId}`), emptyAccount());
  }

  return (
    <div dir="rtl" style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#0a0e1a 0%,#0d1a12 50%,#0a0e1a 100%)",
      fontFamily:"'Segoe UI','Arial Hebrew',Tahoma,sans-serif",
      color:"#fff", position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes pop       { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeFlash { 0%{opacity:1} 100%{opacity:0;transform:scale(1.08)} }
        button, input { font-family: inherit; }
      `}</style>

      {/* Ambient blobs */}
      <div style={{ position:"fixed", top:"-10%", right:"-10%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,#22c55e18,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:"-10%", left:"-10%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,#3b82f618,transparent 70%)", pointerEvents:"none" }}/>

      {flash && (
        <div style={{
          position:"fixed", inset:0, zIndex:50, pointerEvents:"none",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"fadeFlash 1.1s ease forwards",
          background: flash.type==="add" ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
        }}>
          <span style={{ fontSize:"4rem", animation:"pop 0.4s cubic-bezier(.4,0,.2,1)" }}>
            {flash.type==="add" ? "💰" : "💸"}
          </span>
        </div>
      )}

      {!userId && <LoginScreen onLogin={setUserId} />}

      {userId && (
        <div style={{ maxWidth:460, margin:"0 auto", padding:"20px 16px 48px" }}>

          {/* Top bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
            <button onClick={()=>setUserId(null)} style={{
              background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
              color:"rgba(255,255,255,0.6)", borderRadius:10, padding:"6px 12px", fontSize:"0.8rem", cursor:"pointer",
            }}>← יציאה</button>
            <div>
              <span style={{ fontSize:"1.4rem" }}>{user.emoji}</span>
              <span style={{ fontWeight:800, marginRight:6, fontSize:"1.05rem", color:user.color }}>{user.label}</span>
            </div>
            <div style={{ width:60 }}/>
          </div>

          {!data ? <Spinner /> : (
            <>
              {/* ── Parent ── */}
              {isParent && (() => {
                const u    = USERS.find(u=>u.id===activeKid);
                const acct = data[activeKid] || emptyAccount();
                return (
                  <>
                    {/* Summary bar — both kids */}
                    <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                      {KIDS.map(k => {
                        const ku = USERS.find(u=>u.id===k);
                        const isActive = k === activeKid;
                        return (
                          <button key={k} onClick={()=>setActiveKid(k)} style={{
                            flex:1, borderRadius:16, padding:"14px 12px", textAlign:"center",
                            background: isActive
                              ? `linear-gradient(135deg,${ku.color}30,${ku.color}10)`
                              : "rgba(255,255,255,0.04)",
                            border: isActive ? `2px solid ${ku.color}` : "2px solid rgba(255,255,255,0.08)",
                            color:"#fff", cursor:"pointer", transition:"all 0.2s",
                            boxShadow: isActive ? `0 4px 16px ${ku.color}33` : "none",
                          }}>
                            <div style={{ fontSize:"1.4rem" }}>{ku.emoji}</div>
                            <div style={{ fontSize:"0.82rem", color: isActive ? ku.color : "rgba(255,255,255,0.45)", fontWeight:700 }}>{ku.label}</div>
                            <div style={{ fontSize:"1.3rem", fontWeight:900, marginTop:2, color: data[k]?.balance>=0?"#4ade80":"#f87171" }}>
                              {fmt(data[k]?.balance||0)}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active kid detail */}
                    <div style={{
                      background:"rgba(255,255,255,0.03)",
                      border:`1px solid ${u.color}33`, borderRadius:22, padding:18,
                    }}>
                      <ActionForm onSubmit={tx=>handleTransaction(activeKid,tx)} />
                      <div style={{ marginTop:16 }}>
                        <TxList transactions={acct.transactions} onClear={()=>handleClear(activeKid)} isOwn={true}/>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* ── Kid ── */}
              {!isParent && (() => {
                const acct = data[userId] || emptyAccount();
                return (
                  <>
                    <BalanceCard kidId={userId} acct={acct} color={user.color} />
                    <ActionForm onSubmit={tx=>handleTransaction(userId,tx)} />
                    <div style={{ marginTop:20 }}>
                      <TxList transactions={acct.transactions} onClear={()=>handleClear(userId)} isOwn={true}/>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
