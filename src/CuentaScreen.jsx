import { useState } from 'react'
import { C, NIVELES, fmt, DEMO_USER } from './constants.js'

export default function CuentaScreen({ user }) {
  const [tab, setTab] = useState('resumen')
  const cuenta = { ...DEMO_USER, ...user }
  const nivel = cuenta.nivel || 'base'
  const nv = NIVELES.find(n => n.id === nivel) || NIVELES[0]
  const siguiente = NIVELES[NIVELES.findIndex(n => n.id === nivel) + 1]
  const refActivos = (cuenta.referidos || []).filter(r => r.activo && r.meses >= 3 && r.promedio >= 50000).length
  const promedio3 = cuenta.promedioUlt3 || 0
  const cumpleMin = promedio3 >= 50000

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"36px 20px 80px" }}>
      {/* Header */}
      <div style={{ background:C.noir, padding:"28px 28px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:4, color:C.or, textTransform:"uppercase", marginBottom:8, fontWeight:500 }}>Mi cuenta</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:C.creme, fontWeight:500 }}>{cuenta.name || cuenta.nombre}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.55)", marginTop:4, fontWeight:400 }}>{cuenta.edificio} · Depto {cuenta.depto || cuenta.apt}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ background:nv.bg, padding:"8px 16px", display:"inline-block", marginBottom:6 }}>
            <span style={{ fontSize:16 }}>{nv.icon}</span>
            <span style={{ fontSize:13, fontWeight:700, color:nv.color, marginLeft:6 }}>{nv.nombre}</span>
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontWeight:400 }}>
            Miembro desde {new Date(cuenta.miembroDesde).toLocaleDateString("es-CL", { month:"long", year:"numeric" })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1.5px solid ${C.warmMid}`, marginBottom:28 }}>
        {[["resumen","Resumen"],["fidelizacion","Fidelización"],["referidos","Referidos"],["historial","Historial"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding:"10px 20px", border:"none", background:"transparent",
            fontSize:11, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer",
            color: tab === k ? C.text : C.textLight, fontWeight: tab === k ? 600 : 400,
            borderBottom: tab === k ? `2px solid ${C.noir}` : "2px solid transparent",
          }}>{l}</button>
        ))}
      </div>

      {/* RESUMEN */}
      {tab === 'resumen' && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:C.warmMid, marginBottom:24 }}>
            {[
              { l:"Meses activo",    v:`${cuenta.mesesActivo} meses` },
              { l:"Promedio 3 meses", v:fmt(promedio3) },
              { l:"Referidos activos",v:`${refActivos} personas` },
            ].map(k => (
              <div key={k.l} style={{ background:C.bgLight, padding:"20px 18px" }}>
                <div style={{ fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:C.textLight, marginBottom:6, fontWeight:600 }}>{k.l}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:C.rouge, fontWeight:500 }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background:C.bgLight, border:`1.5px solid ${C.warmMid}`, padding:22 }}>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:C.or, marginBottom:10, fontWeight:600 }}>Tu código de referido</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <div style={{ fontFamily:"monospace", fontSize:20, fontWeight:700, color:C.text, background:C.warm, padding:"10px 20px", border:`1.5px solid ${C.warmMid}`, letterSpacing:2 }}>
                {cuenta.codigoReferido}
              </div>
              <button onClick={() => navigator.clipboard?.writeText(cuenta.codigoReferido)} style={{
                background:C.noir, color:C.creme, border:"none", padding:"10px 20px",
                fontSize:11, cursor:"pointer", fontWeight:500, letterSpacing:1.5, textTransform:"uppercase",
              }}>Copiar</button>
            </div>
            <p style={{ fontSize:12, color:C.textMid, marginTop:10, lineHeight:1.7, fontWeight:400 }}>
              Comparte este código. Cuando se registren y mantengan suscripción activa 3 meses con promedio {fmt(50000)}/mes, cuenta como referido válido.
            </p>
          </div>
        </div>
      )}

      {/* FIDELIZACIÓN */}
      {tab === 'fidelizacion' && (
        <div>
          <div style={{ background:nv.bg, border:`1.5px solid ${nv.color}`, padding:20, marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <span style={{ fontSize:24 }}>{nv.icon}</span>
              <span style={{ fontSize:18, fontWeight:700, color:nv.color, fontFamily:"'Cormorant Garamond',serif" }}>{nv.nombre}</span>
            </div>
            <div style={{ fontSize:14, color:C.textMid, marginBottom:8, fontWeight:500 }}>{nv.descripcion}</div>
            <div style={{ fontSize:12, color:C.textLight, fontWeight:400 }}>{nv.requisito}</div>
          </div>

          {siguiente && (
            <div style={{ background:C.bgLight, border:`1.5px solid ${C.warmMid}`, padding:20, marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:C.textMid, marginBottom:12, fontWeight:600 }}>
                Próximo nivel: {siguiente.icon} {siguiente.nombre}
              </div>
              <ProgRow label="Promedio últimos 3 meses" val={promedio3} max={50000} ok={cumpleMin}/>
              {siguiente.id !== 'referidos' && (
                <ProgRow label="Antigüedad" val={cuenta.mesesActivo} max={siguiente.id === 'gold' ? 6 : 12} suffix="meses"/>
              )}
              {siguiente.id === 'referidos' && (
                <ProgRow label="Referidos válidos" val={refActivos} max={30}/>
              )}
            </div>
          )}

          <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:C.textLight, marginBottom:12, fontWeight:600 }}>Todos los niveles</div>
          {NIVELES.map(n => (
            <div key={n.id} style={{ background:n.id === nivel ? n.bg : C.bgLight, border:`1.5px solid ${n.id === nivel ? n.color : C.warmMid}`, padding:"15px 17px", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:3 }}>
                <span style={{ fontSize:17 }}>{n.icon}</span>
                <span style={{ fontWeight:700, fontSize:14, color:n.id === nivel ? n.color : C.text }}>{n.nombre}</span>
                {n.id === nivel && <span style={{ fontSize:10, background:n.color, color:"#fff", padding:"2px 8px", fontWeight:600 }}>Tu nivel</span>}
              </div>
              <div style={{ fontSize:13, color:C.textMid, marginBottom:3, fontWeight:500 }}>{n.descripcion}</div>
              <div style={{ fontSize:11, color:C.textLight, fontWeight:400 }}>{n.requisito}</div>
            </div>
          ))}
        </div>
      )}

      {/* REFERIDOS */}
      {tab === 'referidos' && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:C.warmMid, marginBottom:20 }}>
            <div style={{ background:C.bgLight, padding:"20px 18px" }}>
              <div style={{ fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:C.textLight, marginBottom:6, fontWeight:600 }}>Referidos totales</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:C.rouge, fontWeight:500 }}>{(cuenta.referidos||[]).length}</div>
            </div>
            <div style={{ background:C.bgLight, padding:"20px 18px" }}>
              <div style={{ fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:C.textLight, marginBottom:6, fontWeight:600 }}>Referidos válidos</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:"#3D5A3D", fontWeight:500 }}>{refActivos} / 30</div>
            </div>
          </div>
          <div style={{ background:"#F0F5EF", border:"1px solid #8AAA88", padding:"11px 14px", marginBottom:16, fontSize:12, color:"#2A4A2A", lineHeight:1.7, fontWeight:400 }}>
            Un referido cuenta como válido cuando: está activo, lleva 3+ meses suscrito y tiene promedio de {fmt(50000)}/mes.
          </div>
          {(cuenta.referidos||[]).map((r, i) => {
            const valido = r.activo && r.meses >= 3 && r.promedio >= 50000
            return (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.warm}` }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:C.text }}>{r.nombre}</div>
                  <div style={{ fontSize:12, color:C.textMid, marginTop:2, fontWeight:400 }}>{r.meses} mes{r.meses > 1 ? 'es' : ''} · Promedio {fmt(r.promedio)}/mes</div>
                </div>
                {valido
                  ? <span style={{ background:"#EDF5ED", color:"#2A5A2A", padding:"4px 10px", fontSize:11, fontWeight:600 }}>✓ Válido</span>
                  : <span style={{ background:C.warm, color:C.textLight, padding:"4px 10px", fontSize:11, fontWeight:600 }}>
                      {!r.activo ? "Inactivo" : r.meses < 3 ? `${r.meses}/3 meses` : "Bajo promedio"}
                    </span>
                }
              </div>
            )
          })}
        </div>
      )}

      {/* HISTORIAL */}
      {tab === 'historial' && (
        <div>
          {(cuenta.historial||[]).map((h, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:`1px solid ${C.warm}` }}>
              <div>
                <div style={{ fontSize:13, color:C.textMid, marginBottom:4 }}>
                  {new Date(h.fecha).toLocaleDateString("es-CL", { weekday:"long", day:"numeric", month:"long" })}
                  <span style={{ marginLeft:8, fontSize:11, background: h.turno === 'am' ? "#FFF0DC" : "#EEEEFF", color: h.turno === 'am' ? "#7A3A00" : "#2A2A8A", padding:"2px 7px", fontWeight:600 }}>{h.turno === 'am' ? 'AM' : 'PM'}</span>
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{h.productos}</div>
              </div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:C.rouge, fontWeight:500 }}>{fmt(h.total)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProgRow({ label, val, max, ok, suffix }) {
  const pct = Math.min(100, (val / max) * 100)
  const isOk = ok !== undefined ? ok : val >= max
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6, fontWeight:500 }}>
        <span style={{ color:C.textMid }}>{label}</span>
        <span style={{ color: isOk ? "#3D5A3D" : C.rouge, fontWeight:700 }}>
          {suffix ? `${val} / ${max} ${suffix}` : `${fmt(val)} / ${fmt(max)}`} {isOk ? "✓" : "✗"}
        </span>
      </div>
      <div style={{ background:C.warm, height:8, overflow:"hidden" }}>
        <div style={{ background: isOk ? "#3D5A3D" : C.or, height:"100%", width:`${pct}%`, transition:"width .4s" }}/>
      </div>
    </div>
  )
}
