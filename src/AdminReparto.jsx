import { useState } from 'react'
import { C, DEMO_PRODUCTS, fmt } from './constants.js'
import { inpBox, btnPrimary, FooterNCM } from './ui.jsx'

// ── ADMIN ──────────────────────────────────────────────────────────────────────
export function AdminScreen({products, onPriceUpdate, showToast}){
  const [unlocked, setUnlocked] = useState(false)
  const [user, setUser]   = useState("")
  const [pwd, setPwd]     = useState("")
  const [tab, setTab]     = useState("produccion")
  const [editId, setEditId] = useState(null)
  const [adminDay, setAdminDay] = useState("Sáb")
  const [prices, setPrices] = useState(
    Object.fromEntries(products.map(p=>([p.id,{venta:p.base_price, costo:Math.round(p.base_price*.55)}])))
  )

  if(!unlocked) return (
    <div>
      <div style={{maxWidth:440, margin:"80px auto", padding:20}}>
        <div style={{background:"#fff", border:`1px solid ${C.warmMid}`, padding:"36px 40px", textAlign:"center"}}>
          <div style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:20,fontWeight:600}}>ACCESO RESTRINGIDO</div>
          <input style={{...inpBox,marginBottom:12,textAlign:"center"}} placeholder="Usuario de administrador" value={user} onChange={e=>setUser(e.target.value)}/>
          <input style={{...inpBox,marginBottom:16,textAlign:"center"}} type="password" placeholder="Clave de administrador" value={pwd} onChange={e=>setPwd(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&tryLogin()}/>
          <button style={btnPrimary} onClick={()=>{
            if(user==="pango"&&pwd==="pango2024") setUnlocked(true)
            else showToast("Credenciales incorrectas ✗")
          }}>INGRESAR</button>
          <p style={{fontSize:11,color:C.textLight,marginTop:12}}>Usuario inicial: <strong>pango</strong>. El acceso se valida contra el backend.</p>
        </div>
      </div>
      <FooterNCM/>
    </div>
  )

  const DAYS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
  const PROD_SUMMARY = [
    {emoji:"🫓",n:"Pan Hallulla",  w:"1 kg",  qty:18, rev:53820},
    {emoji:"🍞",n:"Pan Francés",   w:"1 kg",  qty:24, rev:71760},
    {emoji:"🥖",n:"Pan Ciabatta",  w:"1 kg",  qty:8,  rev:27120},
    {emoji:"🌶️",n:"Emp. Pino c/Ají",w:"",    qty:30, rev:101700},
    {emoji:"🥟",n:"Emp. Pino s/Ají",w:"",    qty:18, rev:61020},
    {emoji:"🧀",n:"Emp. de Queso", w:"",      qty:12, rev:35880},
  ]

  function savePrice(id, venta, costo){
    setPrices(p=>({...p,[id]:{venta,costo}}))
    onPriceUpdate && onPriceUpdate(id, venta)
    setEditId(null)
    showToast("Precio actualizado ✓")
  }

  return (
    <div>
      <div style={{maxWidth:960, margin:"0 auto", padding:"40px 24px 80px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <p style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>PANEL DE GESTIÓN</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:500,color:C.text}}>Administración</h2>
          </div>
          <button onClick={()=>setUnlocked(false)} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"9px 18px",cursor:"pointer",fontSize:11,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>
            CERRAR SESIÓN
          </button>
        </div>

        {/* TABS */}
        <div style={{display:"flex",borderBottom:`1.5px solid ${C.warmMid}`,marginBottom:28}}>
          {[["produccion","PRODUCCIÓN"],["precios","PRECIOS"],["pedidos","PEDIDOS"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              padding:"10px 24px", border:"none", background:"transparent",
              fontSize:11, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer",
              color:tab===k?C.text:C.textLight, fontWeight:tab===k?700:400,
              borderBottom:tab===k?`2px solid ${C.noir}`:"2px solid transparent",
            }}>{l}</button>
          ))}
        </div>

        {/* PRODUCCIÓN */}
        {tab==="produccion" && (
          <div>
            <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
              {DAYS.map(d=>(
                <button key={d} onClick={()=>setAdminDay(d)} style={{
                  padding:"5px 13px", border:`1.5px solid ${adminDay===d?C.noir:C.warmMid}`,
                  background:adminDay===d?C.noir:"transparent",
                  color:adminDay===d?C.creme:C.textMid,
                  fontSize:10, letterSpacing:1, textTransform:"uppercase", cursor:"pointer", fontWeight:500,
                }}>{d}</button>
              ))}
              <button onClick={()=>showToast("WhatsApp enviado ✓")} style={{
                marginLeft:"auto",background:"#3D5A3D",color:"#fff",border:"none",
                padding:"7px 16px",fontSize:10,cursor:"pointer",fontWeight:700,letterSpacing:1,textTransform:"uppercase",
              }}>Enviar WA</button>
            </div>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:C.noir,marginBottom:24}}>
              {[{l:"Pedidos",v:24},{l:"AM",v:16},{l:"PM",v:8},{l:"Ingresos",v:"$351.300"}].map(k=>(
                <div key={k.l} style={{background:C.noir,padding:"18px 16px"}}>
                  <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,.4)",textTransform:"uppercase",marginBottom:5,fontWeight:600}}>{k.l}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:C.or,fontWeight:500}}>{k.v}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.textLight,marginBottom:14,fontWeight:600}}>Lista de producción</div>
            {PROD_SUMMARY.map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.warm}`}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:24}}>{r.emoji}</span>
                  <div>
                    <div style={{fontWeight:600,color:C.text}}>{r.n}</div>
                    {r.w && <div style={{fontSize:11,color:C.textLight}}>{r.w}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:24,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.rouge,fontWeight:500}}>{r.qty}</div>
                    <div style={{fontSize:10,color:C.textLight}}>unidades</div>
                  </div>
                  <div style={{textAlign:"right",minWidth:80}}>
                    <div style={{fontWeight:600,color:C.text}}>{fmt(r.rev)}</div>
                    <div style={{fontSize:10,color:C.textLight}}>ingresos</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRECIOS */}
        {tab==="precios" && (
          <div>
            <p style={{fontSize:12,color:C.textMid,marginBottom:20}}>
              Ingresa precio de venta por kg y costo por kg. El sistema calcula automáticamente el precio base de 500g, el costo de 500g y los tramos adicionales.
            </p>
            {products.map(p=>{
              const pr = prices[p.id] || {venta:p.base_price, costo:Math.round(p.base_price*.55)}
              const isEditing = editId===p.id
              return isEditing
                ? <PriceEditor key={p.id} product={p} pr={pr} onSave={savePrice} onCancel={()=>setEditId(null)}/>
                : (
                  <div key={p.id} onClick={()=>setEditId(p.id)} style={{
                    display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"14px 0",borderBottom:`1px solid ${C.warm}`,cursor:"pointer",
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:22}}>{p.emoji}</span>
                      <div>
                        <div style={{fontWeight:600,color:C.text}}>{p.name}</div>
                        <div style={{fontSize:11,color:C.textLight}}>{p.category}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.textLight,marginBottom:2}}>VENTA KG</div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.rouge,fontWeight:500}}>{fmt(pr.venta)}</div>
                      <div style={{fontSize:11,color:C.textMid}}>Base 500g {fmt(Math.round(pr.venta/2))} · Costo kg {fmt(pr.costo)}</div>
                      <div style={{fontSize:11,color:C.textMid}}>Margen bruto kg {pr.venta>0?Math.round((pr.venta-pr.costo)/pr.venta*100):0}%</div>
                      <div style={{fontSize:11,color:C.rouge,fontWeight:600,marginTop:2}}>Editar →</div>
                    </div>
                  </div>
                )
            })}
          </div>
        )}

        {/* PEDIDOS */}
        {tab==="pedidos" && (
          <div>
            {[
              {u:"Carlos Pérez",   b:"Edificio Las Lilas",  d:"504",  shift:"am", items:[{e:"🫓",n:"Hallulla 1kg",q:2}]},
              {u:"Ana Soto",       b:"Torre Bellavista",    d:"3B",   shift:"pm", items:[{e:"🌶️",n:"Emp. Pino c/Ají",q:3},{e:"🍞",n:"Francés 1kg",q:1}]},
              {u:"Laura Martínez", b:"Edificio Portal Sur", d:"12C",  shift:"am", items:[{e:"🧀",n:"Emp. Queso",q:4}]},
            ].map((o,i)=>(
              <div key={i} style={{padding:"16px 0",borderBottom:`1px solid ${C.warm}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:15,color:C.text}}>{o.u}</div>
                    <div style={{fontSize:12,color:C.textMid}}>{o.b} · Depto {o.d}</div>
                  </div>
                  <span style={{background:o.shift==="am"?"#FFF0DC":"#EEEEFF",color:o.shift==="am"?"#7A3A00":"#2A2A8A",padding:"3px 10px",fontSize:10,fontWeight:700}}>{o.shift==="am"?"AM":"PM"}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {o.items.map((it,j)=>(
                      <span key={j} style={{background:C.warm,border:`1px solid ${C.warmMid}`,padding:"3px 10px",fontSize:11,fontWeight:500}}>{it.e} {it.q}× {it.n}</span>
                    ))}
                  </div>
                  <button onClick={()=>showToast("Entregado + WA enviado ✓")} style={{background:"#3D5A3D",color:"#fff",border:"none",padding:"8px 16px",fontSize:10,cursor:"pointer",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>
                    Entregar + WA
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FooterNCM/>
    </div>
  )
}

function PriceEditor({product, pr, onSave, onCancel}){
  const [venta, setVenta] = useState(pr.venta)
  const [costo, setCosto] = useState(pr.costo)
  const v500  = Math.round(venta/2)
  const c500  = Math.round(costo/2)
  const extra = Math.round(venta/2)
  const margenBruto = venta>0?Math.round((venta-costo)/venta*100):0
  const margenColor = margenBruto>=0?"#2A5A2A":"#8B2E1A"

  return (
    <div style={{background:"#fff",border:`1.5px solid ${C.or}`,padding:"22px 24px",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <span style={{fontSize:18}}>{product.emoji}</span>
        <span style={{fontWeight:600,fontSize:15,color:C.text}}>{product.name}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
        <div>
          <label style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.textMid,display:"block",marginBottom:6,fontWeight:600}}>PRECIO DE VENTA POR KG</label>
          <input style={{...inpBox,fontSize:18,fontWeight:600}} type="number" value={venta} onChange={e=>setVenta(Number(e.target.value))}/>
        </div>
        <div>
          <label style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.textMid,display:"block",marginBottom:6,fontWeight:600}}>COSTO POR KG</label>
          <input style={inpBox} type="number" value={costo} onChange={e=>setCosto(Number(e.target.value))}/>
        </div>
      </div>
      <div style={{background:C.bg,border:`1px solid ${C.warmMid}`,padding:"10px 14px",marginBottom:16,fontSize:12,color:C.textMid,lineHeight:1.8}}>
        El sistema calcula automáticamente el precio base de 500g, el costo de 500g y los tramos adicionales.<br/>
        <strong>Venta 500g: {fmt(v500)} · Venta 1kg: {fmt(venta)} · Costo 500g: {fmt(c500)} · Costo 1kg: {fmt(costo)} · Margen bruto kg: <span style={{color:margenColor}}>{margenBruto}%</span></strong>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>onSave(product.id,venta,costo)} style={{...btnPrimary,width:"auto",padding:"11px 28px",fontSize:11,letterSpacing:2}}>GUARDAR</button>
        <button onClick={onCancel} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"11px 18px",cursor:"pointer",fontSize:11,letterSpacing:1,textTransform:"uppercase"}}>CANCELAR</button>
      </div>
    </div>
  )
}

// ── REPARTO ───────────────────────────────────────────────────────────────────
export function RepartoScreen({showToast}){
  const [unlocked, setUnlocked] = useState(false)
  const [pwd, setPwd]   = useState("")
  const [checked, setChecked] = useState({})

  if(!unlocked) return (
    <div>
      <div style={{maxWidth:400, margin:"100px auto", padding:20}}>
        <div style={{background:"#fff",border:`1px solid ${C.warmMid}`,padding:"36px 40px",textAlign:"center"}}>
          <div style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:22,fontWeight:600}}>ACCESO REPARTIDOR</div>
          <input style={{...inpBox,textAlign:"center",marginBottom:14,letterSpacing:2}} type="password" placeholder="Clave de reparto"
            value={pwd} onChange={e=>setPwd(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&(pwd==="reparto2024"?setUnlocked(true):showToast("Clave incorrecta ✗"))}/>
          <button style={btnPrimary} onClick={()=>pwd==="reparto2024"?setUnlocked(true):showToast("Clave incorrecta ✗")}>INGRESAR</button>
        </div>
      </div>
      <FooterNCM/>
    </div>
  )

  const RUTA = [
    {sector:"Providencia", items:[
      {n:"María González",  addr:"Av. Providencia 1234 · Depto 504",  prod:"1,5 kg Hallulla"},
      {n:"Carlos Pérez",    addr:"Av. Providencia 1456 · Piso 5",     prod:"1 kg Pan Francés"},
      {n:"Ana Soto",        addr:"Av. Providencia 1789 · Casa",       prod:"2 kg Ciabatta"},
    ]},
    {sector:"Ñuñoa", items:[
      {n:"Juan Muñoz",      addr:"Irarrázaval 890 · Depto 2A",        prod:"1 kg Ciabatta"},
      {n:"Laura Martínez",  addr:"Av. Irarrázaval 1200",              prod:"Emp. Pino ×6"},
    ]},
  ]
  let idx=0

  return (
    <div>
      <div style={{maxWidth:720, margin:"0 auto", padding:"40px 24px 80px"}}>
        <p style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>RUTA DEL DÍA</p>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:500,color:C.text,marginBottom:22}}>Turno AM — hoy</h2>
        {RUTA.map(sector=>(
          <div key={sector.sector} style={{background:"#fff",border:`1px solid ${C.warmMid}`,marginBottom:14,overflow:"hidden"}}>
            <div style={{background:C.noir,padding:"10px 16px",display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,.6)",textTransform:"uppercase",fontWeight:600}}>{sector.sector}</span>
              <span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{sector.items.length} entregas</span>
            </div>
            {sector.items.map(item=>{
              idx++; const id=`${sector.sector}-${idx}`
              return (
                <div key={id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:`1px solid ${C.warm}`}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:C.or,color:C.noir,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{idx}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,color:C.text}}>{item.n}</div>
                    <div style={{fontSize:12,color:C.textMid}}>{item.addr} · {item.prod}</div>
                  </div>
                  <button onClick={()=>{setChecked(c=>({...c,[id]:!c[id]}));if(!checked[id])showToast("Entrega marcada ✓")}} style={{
                    width:32,height:32,borderRadius:"50%",
                    border:`1.5px solid ${checked[id]?"#3D5A3D":C.warmMid}`,
                    background:checked[id]?"#3D5A3D":"transparent",
                    color:checked[id]?"#fff":C.textMid,
                    cursor:"pointer",fontSize:16,fontWeight:700,
                  }}>✓</button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <FooterNCM/>
    </div>
  )
}
