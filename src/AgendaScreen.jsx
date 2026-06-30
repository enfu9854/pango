import { useState } from 'react'
import { C, PESOS, FREQ, NIVELES, getFechas, fmt, calcPrecio } from './constants.js'
import { QC, btnP } from './ui.jsx'

export default function AgendaScreen({ user, products, agenda, setAgenda, onCheckout }) {
  const [semana, setSemana] = useState(1)
  const [frecuencia, setFrecuencia] = useState('once')
  const [diaActivo, setDiaActivo] = useState(null)
  const [catFilter, setCatFilter] = useState('Todos')
  const [selWeights, setSelWeights] = useState({})
  const fechas = getFechas(4)
  const nivel = user?.nivel || 'base'
  const nv = NIVELES.find(n => n.id === nivel)

  const diasConPedido = Object.keys(agenda).filter(f => agenda[f]?.items?.length > 0)
  const total = diasConPedido.reduce((s, f) => s + agenda[f].items.reduce((ss, i) => ss + i.price * i.qty, 0), 0)

  function toggleDia(f) { setDiaActivo(diaActivo === f ? null : f) }
  function setTurno(f, t) { setAgenda(a => ({ ...a, [f]: { turno: t, items: a[f]?.items || [] } })) }
  function addItem(fecha, product, weight) {
    const key = `${product.id}_${weight || 'u'}`
    const price = calcPrecio(product, weight, nivel, products)
    setAgenda(a => {
      const dia = a[fecha] || { turno: 'am', items: [] }
      const ex = dia.items.find(i => i.key === key)
      return { ...a, [fecha]: { ...dia, items: ex
        ? dia.items.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
        : [...dia.items, { key, product, weight, qty: 1, price }]
      }}
    })
  }
  function updItem(fecha, key, delta) {
    setAgenda(a => {
      const dia = a[fecha]; if (!dia) return a
      return { ...a, [fecha]: { ...dia, items: dia.items.map(i => i.key === key ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0) }}
    })
  }
  function removeDia(f) { setAgenda(a => { const n = { ...a }; delete n[f]; return n }) }

  const pList = catFilter === 'Todos' ? products : products.filter(p => p.category === catFilter)

  return (
    <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 20px 120px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:16 }}>
        <div>
          <p style={{ fontSize:10, letterSpacing:4, color:C.or, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>Mi agenda de pedidos</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:500, color:C.text }}>¿Qué días quieres recibir?</h2>
          <p style={{ fontSize:13, color:C.textMid, marginTop:4, fontWeight:400 }}>Cada día puede tener productos y horario diferente</p>
          {nivel !== 'base' && (
            <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:6, background:nv?.bg, padding:"4px 12px", border:`1px solid ${C.warmMid}` }}>
              <span>{nv?.icon}</span>
              <span style={{ fontSize:12, fontWeight:600, color:nv?.color }}>{nv?.nombre} — precios especiales aplicados</span>
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {FREQ.map(f => (
            <button key={f.key} onClick={() => setFrecuencia(f.key)} style={{
              padding:"5px 11px", border:`1.5px solid ${frecuencia === f.key ? C.noir : C.warmMid}`,
              background: frecuencia === f.key ? C.noir : "transparent",
              color: frecuencia === f.key ? C.creme : C.textMid,
              fontSize:10, letterSpacing:1, textTransform:"uppercase", cursor:"pointer", fontWeight:500,
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Semanas */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {[1,2,3,4].map(s => (
          <button key={s} onClick={() => setSemana(s)} style={{
            padding:"6px 14px", border:`1.5px solid ${semana === s ? C.noir : C.warmMid}`,
            background: semana === s ? C.noir : "transparent",
            color: semana === s ? C.creme : C.textMid,
            fontSize:11, cursor:"pointer", fontWeight:500,
          }}>Semana {s}</button>
        ))}
      </div>

      {/* Calendario */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1, background:C.warmMid, marginBottom:20 }}>
        {fechas.filter(f => f.semana === semana).map(fd => {
          const dia = agenda[fd.fecha]
          const items = dia?.items || []
          const tot = items.reduce((s, i) => s + i.price * i.qty, 0)
          const activo = diaActivo === fd.fecha
          const tiene = items.length > 0
          return (
            <div key={fd.fecha} onClick={() => toggleDia(fd.fecha)} style={{
              background: activo ? C.noir : tiene ? "#EFE9DC" : C.bgLight,
              padding:"12px 8px", cursor:"pointer",
              borderBottom: activo ? `3px solid ${C.or}` : "3px solid transparent",
            }}>
              <div style={{ fontSize:10, letterSpacing:1, textTransform:"uppercase", color: activo ? "rgba(255,255,255,.6)" : C.textLight, marginBottom:4, fontWeight:500 }}>{fd.diaNombre}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color: activo ? C.or : tiene ? C.rouge : C.text, fontWeight:500 }}>{fd.numero}</div>
              <div style={{ fontSize:11, color: activo ? "rgba(255,255,255,.5)" : C.textLight, fontWeight:400 }}>{fd.mes}</div>
              {tiene && (
                <div style={{ marginTop:6 }}>
                  <div style={{ fontSize:9, letterSpacing:1, textTransform:"uppercase", color: activo ? C.or : C.rouge, marginBottom:2, fontWeight:600 }}>
                    {dia.turno === 'am' ? '☀ AM' : '🌆 PM'}
                  </div>
                  <div style={{ fontSize:11, color: activo ? C.orLight : C.textMid, fontWeight:600 }}>{fmt(tot)}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Panel día */}
      {diaActivo && (() => {
        const fd = fechas.find(f => f.fecha === diaActivo)
        const dia = agenda[diaActivo] || { turno:'am', items:[] }
        const dayTotal = dia.items.reduce((s, i) => s + i.price * i.qty, 0)
        return (
          <div style={{ background:C.bgLight, border:`2px solid ${C.noir}`, padding:24, marginBottom:16, boxShadow:`4px 4px 0 ${C.noir}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:8 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:500, color:C.text }}>
                {fd?.diaFull} {fd?.numero} de {fd?.mes}
              </div>
              {dia.items.length > 0 && (
                <button onClick={() => removeDia(diaActivo)} style={{
                  background:"transparent", border:`1.5px solid ${C.warmMid}`, color:C.textMid,
                  padding:"5px 12px", cursor:"pointer", fontSize:11, letterSpacing:1, textTransform:"uppercase",
                }}>Quitar día</button>
              )}
            </div>

            {/* Turno */}
            <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:C.or, marginBottom:8, fontWeight:600 }}>Horario de entrega</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:C.warmMid, marginBottom:18 }}>
              {[{k:'am',label:'Turno Mañana',hora:'8:00–12:00 h'},{k:'pm',label:'Turno Tarde',hora:'16:00–20:00 h'}].map(t => (
                <button key={t.k} onClick={() => setTurno(diaActivo, t.k)} style={{
                  padding:14, background: dia.turno === t.k ? C.noir : C.bgLight,
                  border:"none", cursor:"pointer", textAlign:"left",
                }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:500, color: dia.turno === t.k ? C.orLight : C.text, marginBottom:3 }}>{t.label}</div>
                  <div style={{ fontSize:11, color: dia.turno === t.k ? "rgba(255,255,255,.5)" : C.textMid }}>{t.hora}</div>
                </button>
              ))}
            </div>

            {/* Items en el día */}
            {dia.items.length > 0 && (
              <>
                <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:C.or, marginBottom:8, fontWeight:600 }}>Productos</div>
                {dia.items.map(i => (
                  <div key={i.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.warm}` }}>
                    <span style={{ fontSize:13, fontWeight:500, color:C.text }}>
                      {i.product.emoji} {i.product.name}{i.weight ? ` · ${PESOS[i.weight]}` : ''}
                    </span>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:13, color:C.textMid, minWidth:60, textAlign:"right" }}>{fmt(i.price * i.qty)}</span>
                      <QC qty={i.qty} onMinus={() => updItem(diaActivo, i.key, -1)} onPlus={() => updItem(diaActivo, i.key, 1)}/>
                    </div>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:500 }}>
                  <span>Total del día</span><span style={{ color:C.rouge }}>{fmt(dayTotal)}</span>
                </div>
              </>
            )}

            {/* Catálogo inline */}
            <div style={{ marginTop:18 }}>
              <div style={{ display:"flex", gap:5, marginBottom:12 }}>
                {['Todos','Pan','Empanadas'].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)} style={{
                    padding:"5px 11px", border:`1.5px solid ${catFilter === c ? C.noir : C.warmMid}`,
                    background: catFilter === c ? C.noir : "transparent",
                    color: catFilter === c ? C.creme : C.textMid,
                    fontSize:10, letterSpacing:1, textTransform:"uppercase", cursor:"pointer", fontWeight:500,
                  }}>{c}</button>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:1, background:C.warmMid }}>
                {pList.map(p => {
                  const sw = selWeights[p.id] || (p.weights?.[0] || null)
                  const pr = calcPrecio(p, sw, nivel, products)
                  return (
                    <div key={p.id} style={{ background:C.bgLight, padding:"14px 14px 16px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13, color:C.text }}>{p.emoji} {p.name}</div>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:C.rouge, fontWeight:500 }}>{fmt(pr)}</div>
                        </div>
                        <button onClick={() => addItem(diaActivo, p, sw)} style={{
                          background:C.noir, color:C.creme, border:"none",
                          padding:"5px 11px", fontSize:10, cursor:"pointer",
                          letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, whiteSpace:"nowrap",
                        }}>+ Añadir</button>
                      </div>
                      {p.weights && (
                        <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                          {p.weights.map(w => (
                            <button key={w} onClick={() => setSelWeights(s => ({ ...s, [p.id]: w }))} style={{
                              padding:"3px 8px",
                              border:`1.5px solid ${sw === w ? C.noir : C.warmMid}`,
                              background: sw === w ? C.noir : "transparent",
                              color: sw === w ? C.creme : C.textMid,
                              fontSize:10, cursor:"pointer", fontWeight:500,
                            }}>{PESOS[w]}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Resumen total */}
      {diasConPedido.length > 0 && (
        <div style={{ background:C.bgLight, border:`1.5px solid ${C.warmMid}`, padding:24, marginTop:14 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:500, color:C.text, marginBottom:16 }}>Resumen de tu pedido</div>
          {diasConPedido.sort().map(f => {
            const fd = fechas.find(x => x.fecha === f)
            const dia = agenda[f]
            const tot = dia.items.reduce((s, i) => s + i.price * i.qty, 0)
            return (
              <div key={f} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.warm}`, flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>
                    {fd?.diaFull} {fd?.numero} {fd?.mes}
                    <span style={{ marginLeft:8, fontSize:11, background: dia.turno === 'am' ? "#FFF0DC" : "#EEEEFF", color: dia.turno === 'am' ? "#7A3A00" : "#2A2A8A", padding:"2px 8px", fontWeight:600 }}>
                      {dia.turno === 'am' ? '☀ AM' : '🌆 PM'}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {dia.items.map(i => (
                      <span key={i.key} style={{ fontSize:12, color:C.textMid }}>{i.product.emoji} {i.qty}× {i.product.name}{i.weight ? ` ${PESOS[i.weight]}` : ''}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:C.rouge, fontWeight:500 }}>{fmt(tot)}</span>
                  <button onClick={() => toggleDia(f)} style={{
                    background:"transparent", border:`1.5px solid ${C.warmMid}`, color:C.textMid,
                    padding:"4px 10px", cursor:"pointer", fontSize:11,
                  }}>Editar</button>
                </div>
              </div>
            )
          })}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:16, marginTop:4 }}>
            <div>
              <div style={{ fontSize:11, color:C.textLight, letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>Total · {diasConPedido.length} día{diasConPedido.length > 1 ? 's' : ''}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:C.rouge, fontWeight:500 }}>{fmt(total)}</div>
            </div>
            <button style={{ ...btnP(), width:"auto", padding:"13px 42px" }} onClick={onCheckout}>Ir a pagar →</button>
          </div>
        </div>
      )}

      {!diasConPedido.length && !diaActivo && (
        <div style={{ textAlign:"center", padding:"48px 20px", color:C.textLight }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:44, color:C.warmMid, marginBottom:12 }}>—</div>
          <div style={{ fontWeight:600, fontSize:16, color:C.textMid, marginBottom:6 }}>Selecciona un día para comenzar</div>
          <div style={{ fontSize:13, fontWeight:400 }}>Haz clic en cualquier día del calendario</div>
        </div>
      )}
    </div>
  )
}
