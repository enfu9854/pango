import { useState } from 'react'
import { C, DEMO_PRODUCTS, DEMO_USER, getFechas, fmt, calcPrecio, PESOS } from './constants.js'
import { NB, Toast, FooterNCM } from './ui.jsx'
import { btnPrimary, inpBox } from './ui.jsx'
import HomeScreen from './HomeScreen.jsx'
import { RegisterScreen, LoginScreen } from './AuthScreens.jsx'
import CuentaScreen from './CuentaScreen.jsx'
import { AdminScreen, RepartoScreen } from './AdminReparto.jsx'
import { useState as useS } from 'react'

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#EDE4D3;color:#1A1208;font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#C8B89A}
img{display:block}
`

export default function App(){
  const [screen, setScreen]   = useState("home")
  const [user, setUser]       = useState(null)
  const [toast, setToast]     = useState("")
  const [agenda, setAgenda]   = useState({})
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [catFilter, setCatFilter] = useState("Todos")

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(""),3000)}
  function go(s){setScreen(s);window.scrollTo(0,0)}
  function handleLogin(u){setUser(u);go("agenda")}
  function handleLogout(){setUser(null);setAgenda({});go("home")}

  const diasConPedido = Object.keys(agenda).filter(f=>agenda[f]?.items?.length>0)
  const totalAgenda   = diasConPedido.reduce((s,f)=>s+agenda[f].items.reduce((ss,i)=>ss+i.price*i.qty,0),0)

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#EDE4D3",minHeight:"100vh"}}>
      <style>{CSS}</style>
      <Toast msg={toast}/>

      {/* NAV */}
      <nav style={{background:C.noir,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",position:"sticky",top:0,zIndex:200}}>
        <div onClick={()=>go(user?"agenda":"home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.orLight,letterSpacing:1}}>
            Pan<span style={{color:C.or}}>Go</span>
          </span>
          <span style={{width:1,height:16,background:"rgba(255,255,255,.2)"}}/>
          <span style={{fontSize:9,letterSpacing:3,color:"rgba(255,255,255,.35)",textTransform:"uppercase"}}>BOULANGERIE</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:2}}>
          <NB label="INICIO"      active={screen==="home"}     onClick={()=>go("home")}/>
          <NB label="PRODUCTOS"   active={screen==="catalog"}  onClick={()=>go("catalog")}/>
          {user
            ? <>
                <NB label="HACER PEDIDO" active={screen==="agenda"}  onClick={()=>go("agenda")}/>
                <NB label="MI CUENTA"    active={screen==="cuenta"}  onClick={()=>go("cuenta")}/>
              </>
            : <>
                <NB label="INGRESAR"     active={screen==="login"}    onClick={()=>go("login")}/>
                <NB label="REGISTRARSE"  active={screen==="register"} onClick={()=>go("register")}/>
              </>
          }
          <NB label="REPARTO" active={screen==="reparto"} onClick={()=>go("reparto")}/>
          <button onClick={()=>go("admin")} style={{background:"transparent",color:"rgba(255,255,255,.3)",border:"none",padding:"8px 8px",fontSize:15,cursor:"pointer"}}>⚙</button>
          {diasConPedido.length>0 && (
            <button onClick={()=>go("agenda")} style={{background:C.or,color:C.noir,border:"none",padding:"7px 14px",fontSize:11,fontWeight:700,letterSpacing:1,cursor:"pointer",marginLeft:6}}>
              🛒 {diasConPedido.length} · {fmt(totalAgenda)}
            </button>
          )}
        </div>
      </nav>

      {/* SCREENS */}
      {screen==="home"     && <HomeScreen onStart={()=>go("register")} onLogin={()=>go("login")} onProductos={()=>go("catalog")}/>}
      {screen==="catalog"  && <CatalogScreen products={products} catFilter={catFilter} setCatFilter={setCatFilter} onPedir={()=>user?go("agenda"):go("register")} onLogin={()=>go("login")} onRegister={()=>go("register")} loggedIn={!!user}/>}
      {screen==="register" && <RegisterScreen onSuccess={handleLogin} onLogin={()=>go("login")} showToast={showToast}/>}
      {screen==="login"    && <LoginScreen onSuccess={handleLogin} onRegister={()=>go("register")} showToast={showToast}/>}
      {screen==="agenda"   && <AgendaScreen user={user} products={products} agenda={agenda} setAgenda={setAgenda} onCheckout={()=>{if(diasConPedido.length)go("payment");else showToast("Agrega al menos un producto")}} showToast={showToast}/>}
      {screen==="cuenta"   && <CuentaScreen user={user} onLogout={handleLogout}/>}
      {screen==="payment"  && <PaymentScreen total={totalAgenda} dias={diasConPedido.length} onSuccess={()=>{setAgenda({});go("success")}}/>}
      {screen==="success"  && <SuccessScreen onNueva={()=>go("agenda")} onCuenta={()=>go("cuenta")}/>}
      {screen==="admin"    && <AdminScreen products={products} onPriceUpdate={(id,v)=>setProducts(ps=>ps.map(p=>p.id===id?{...p,base_price:v}:p))} showToast={showToast}/>}
      {screen==="reparto"  && <RepartoScreen showToast={showToast}/>}
    </div>
  )
}

// ── CATÁLOGO ──────────────────────────────────────────────────────────────────
function CatalogScreen({products, catFilter, setCatFilter, onPedir, loggedIn, onLogin, onRegister}){
  const list = catFilter==="Todos"?products:products.filter(p=>p.category===catFilter)
  const [selW, setSelW] = useState({})
  return (
    <div>
      <div style={{maxWidth:1060, margin:"0 auto", padding:"48px 24px 80px"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <p style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Elaborado diario · Entrega en conserjería</p>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:500,color:C.text,marginBottom:8}}>Nuestra selección</h2>
          <p style={{fontSize:14,color:C.textMid}}>Pedido hasta las 24:00 · Turno AM (8–12h) o PM (16–20h)</p>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:36}}>
          {["Todos","Pan","Empanadas"].map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} style={{
              padding:"7px 22px", border:`1.5px solid ${catFilter===c?C.noir:C.warmMid}`,
              background:catFilter===c?C.noir:"transparent",
              color:catFilter===c?C.creme:C.textMid,
              fontSize:11,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",fontWeight:500,
            }}>{c}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:0,background:C.warmMid}}>
          {list.map(p=>{
            const w = selW[p.id]||(p.weights?.[0]||null)
            const precio = calcPrecio(p,w)
            return (
              <div key={p.id} style={{background:"#fff",display:"flex",flexDirection:"column"}}>
                <div style={{height:240,overflow:"hidden",position:"relative"}}>
                  <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"
                    onError={e=>{e.target.style.background="#EDE4D3";e.target.style.display="none"}}/>
                </div>
                <div style={{padding:"20px 22px 24px",flex:1,display:"flex",flexDirection:"column"}}>
                  <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:500,color:C.text,marginBottom:6}}>{p.name}</h3>
                  <p style={{fontSize:13,color:C.textMid,lineHeight:1.7,marginBottom:14,flex:1}}>{p.description}</p>
                  {p.weights && (
                    <div style={{display:"flex",gap:5,marginBottom:14}}>
                      {p.weights.map(ww=>(
                        <button key={ww} onClick={()=>setSelW(s=>({...s,[p.id]:ww}))} style={{
                          padding:"3px 10px",
                          border:`1.5px solid ${w===ww?C.noir:C.warmMid}`,
                          background:w===ww?C.noir:"transparent",
                          color:w===ww?C.creme:C.textMid,
                          fontSize:11,cursor:"pointer",fontWeight:500,
                        }}>{PESOS[ww]}</button>
                      ))}
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.rouge,fontWeight:500}}>{fmt(precio)}</span>
                    <button onClick={onPedir} style={{background:C.noir,color:C.creme,border:"none",padding:"10px 22px",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>PEDIR</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {!loggedIn && (
          <div style={{marginTop:40,background:C.noir,padding:36,textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.orLight,marginBottom:14,fontWeight:500}}>¿Quieres recibir estos productos en tu edificio?</div>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={onRegister} style={{background:C.creme,color:C.noir,border:"none",padding:"12px 36px",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Crear mi cuenta gratis</button>
              <button onClick={onLogin} style={{background:"transparent",color:"rgba(255,255,255,.6)",border:"1px solid rgba(255,255,255,.3)",padding:"12px 28px",cursor:"pointer",fontSize:11,fontWeight:500,letterSpacing:1.5,textTransform:"uppercase"}}>Ya tengo cuenta</button>
            </div>
          </div>
        )}
      </div>
      <FooterNCM/>
    </div>
  )
}

// ── AGENDA ─────────────────────────────────────────────────────────────────────
function AgendaScreen({user, products, agenda, setAgenda, onCheckout, showToast}){
  const [semana, setSemana]   = useState(1)
  const [freq, setFreq]       = useState("once")
  const [diaActivo, setDia]   = useState(null)
  const [catF, setCatF]       = useState("Todos")
  const [selW, setSelW]       = useState({})
  const [showProds, setShowProds] = useState(true)
  const fechas = getFechas(4)
  const diasConPedido = Object.keys(agenda).filter(f=>agenda[f]?.items?.length>0)
  const total = diasConPedido.reduce((s,f)=>s+agenda[f].items.reduce((ss,i)=>ss+i.price*i.qty,0),0)

  function toggleDia(f){setDia(diaActivo===f?null:f)}
  function setTurno(f,t){setAgenda(a=>({...a,[f]:{turno:t,items:a[f]?.items||[]}}))}
  function removeDia(f){setAgenda(a=>{const n={...a};delete n[f];return n});if(diaActivo===f)setDia(null)}
  function addItem(fecha,p,w){
    const key=`${p.id}_${w||"u"}`
    const price=calcPrecio(p,w)
    setAgenda(a=>{
      const dia=a[fecha]||{turno:"am",items:[]}
      const ex=dia.items.find(i=>i.key===key)
      return {...a,[fecha]:{...dia,items:ex?dia.items.map(i=>i.key===key?{...i,qty:i.qty+1}:i):[...dia.items,{key,product:p,weight:w,qty:1,price}]}}
    })
    showToast(`${p.emoji} ${p.name} añadido`)
  }
  function updItem(fecha,key,d){
    setAgenda(a=>{
      const dia=a[fecha];if(!dia)return a
      return {...a,[fecha]:{...dia,items:dia.items.map(i=>i.key===key?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0)}}
    })
  }

  const pList = catF==="Todos"?products:products.filter(p=>p.category===catF)

  return (
    <div>
      <div style={{maxWidth:960, margin:"0 auto", padding:"36px 24px 100px"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:16}}>
          <div>
            <p style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>CARRITO Y PROGRAMACIÓN</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:500,color:C.text}}>¿Qué días quieres recibir?</h2>
            <p style={{fontSize:13,color:C.textMid,marginTop:4}}>Este es tu carrito: programa productos, fecha y horario por cada día.</p>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["once","SOLO ESTA VEZ"],["weekly","SEMANAL"],["biweekly","QUINCENAL"],["monthly","MENSUAL"]].map(([k,l])=>(
              <button key={k} onClick={()=>setFreq(k)} style={{
                padding:"7px 14px", border:`1.5px solid ${freq===k?C.noir:C.warmMid}`,
                background:freq===k?C.noir:"transparent",
                color:freq===k?C.creme:C.textMid,
                fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontWeight:600,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Semanas */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[1,2,3,4].map(s=>(
            <button key={s} onClick={()=>setSemana(s)} style={{
              padding:"6px 16px", border:`1.5px solid ${semana===s?C.noir:C.warmMid}`,
              background:semana===s?C.noir:"transparent",
              color:semana===s?C.creme:C.textMid,
              fontSize:11,cursor:"pointer",fontWeight:semana===s?700:400,
            }}>Semana {s}</button>
          ))}
        </div>

        {/* Calendario */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,background:C.warmMid,marginBottom:20}}>
          {fechas.filter(f=>f.semana===semana).map(fd=>{
            const dia=agenda[fd.fecha]
            const items=dia?.items||[]
            const tot=items.reduce((s,i)=>s+i.price*i.qty,0)
            const activo=diaActivo===fd.fecha
            const tiene=items.length>0
            return (
              <div key={fd.fecha} onClick={()=>toggleDia(fd.fecha)} style={{
                background:activo?C.noir:tiene?"#EFE9DC":"#fff",
                padding:"14px 8px",cursor:"pointer",textAlign:"center",
                borderBottom:activo?`3px solid ${C.or}`:"3px solid transparent",
              }}>
                <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:activo?"rgba(255,255,255,.5)":C.textLight,marginBottom:4,fontWeight:600}}>{fd.diaNombre}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:activo?C.or:tiene?C.rouge:C.text,fontWeight:500}}>{fd.numero}</div>
                <div style={{fontSize:11,color:activo?"rgba(255,255,255,.4)":C.textLight}}>{fd.mes}.</div>
                {tiene && <div style={{marginTop:6,fontSize:11,color:activo?C.orLight:C.rouge,fontWeight:600}}>{fmt(tot)}</div>}
              </div>
            )
          })}
        </div>

        {/* Panel del día */}
        {diaActivo && (()=>{
          const fd=fechas.find(f=>f.fecha===diaActivo)
          const dia=agenda[diaActivo]||{turno:"am",items:[]}
          const dayTotal=dia.items.reduce((s,i)=>s+i.price*i.qty,0)
          return (
            <div style={{background:"#fff",border:`1px solid ${C.warmMid}`,padding:"24px 28px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:500,color:C.text}}>
                  {fd?.diaFull} {fd?.numero} de {fd?.mes}.
                </h3>
                {dia.items.length>0 && (
                  <button onClick={()=>removeDia(diaActivo)} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"5px 14px",cursor:"pointer",fontSize:11,letterSpacing:1,textTransform:"uppercase"}}>
                    Quitar día
                  </button>
                )}
              </div>

              {/* Turno */}
              <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.or,marginBottom:8,fontWeight:600}}>HORARIO DE ENTREGA</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:C.warmMid,marginBottom:20}}>
                {[{k:"am",l:"Turno Mañana",h:"8:00–12:00 h"},{k:"pm",l:"Turno Tarde",h:"16:00–20:00 h"}].map(t=>(
                  <button key={t.k} onClick={()=>setTurno(diaActivo,t.k)} style={{
                    padding:"14px 18px", background:dia.turno===t.k?C.noir:"#fff",
                    border:"none", cursor:"pointer", textAlign:"left",
                  }}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:500,color:dia.turno===t.k?C.orLight:C.text,marginBottom:3}}>{t.l}</div>
                    <div style={{fontSize:11,color:dia.turno===t.k?"rgba(255,255,255,.5)":C.textMid}}>{t.h}</div>
                  </button>
                ))}
              </div>

              {/* Items */}
              {dia.items.length>0 && <>
                {dia.items.map(i=>(
                  <div key={i.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.warm}`}}>
                    <span style={{fontSize:13,fontWeight:500,color:C.text}}>{i.product.emoji} {i.product.name}{i.weight?` · ${PESOS[i.weight]}`:""}</span>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:13,color:C.textMid,minWidth:64,textAlign:"right"}}>{fmt(i.price*i.qty)}</span>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <button onClick={()=>updItem(diaActivo,i.key,-1)} style={{width:28,height:28,border:`1px solid ${C.warmMid}`,background:C.warm,cursor:"pointer",fontSize:15}}>−</button>
                        <span style={{minWidth:20,textAlign:"center",fontWeight:600}}>{i.qty}</span>
                        <button onClick={()=>updItem(diaActivo,i.key,1)} style={{width:28,height:28,border:"none",background:C.noir,color:C.creme,cursor:"pointer",fontSize:15}}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:500}}>
                  <span>Total del día</span><span style={{color:C.rouge}}>{fmt(dayTotal)}</span>
                </div>
              </>}

              {/* Añadir productos */}
              <div style={{marginTop:20}}>
                <button onClick={()=>setShowProds(s=>!s)} style={{
                  width:"100%", padding:"12px 0", background:showProds?C.noir:C.warm,
                  color:showProds?C.creme:C.textMid, border:`1px solid ${showProds?C.noir:C.warmMid}`,
                  cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
                  marginBottom:showProds?14:0,
                }}>
                  {showProds?"OCULTAR PRODUCTOS ▲":"MOSTRAR PRODUCTOS ▼"}
                </button>
                {showProds && <>
                  <div style={{display:"flex",gap:6,marginBottom:12}}>
                    {["Todos","Pan","Empanadas"].map(c=>(
                      <button key={c} onClick={()=>setCatF(c)} style={{
                        padding:"5px 13px", border:`1.5px solid ${catF===c?C.noir:C.warmMid}`,
                        background:catF===c?C.noir:"transparent",
                        color:catF===c?C.creme:C.textMid,
                        fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontWeight:600,
                      }}>{c}</button>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:1,background:C.warmMid}}>
                    {pList.map(p=>{
                      const w=selW[p.id]||(p.weights?.[0]||null)
                      const pr=calcPrecio(p,w)
                      return (
                        <div key={p.id} style={{background:"#fff",padding:"16px 16px 18px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                            <div>
                              <div style={{fontWeight:600,fontSize:13,color:C.text}}>{p.emoji} {p.name}</div>
                              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:C.rouge,fontWeight:500}}>{fmt(pr)}</div>
                            </div>
                            <button onClick={()=>addItem(diaActivo,p,w)} style={{background:C.noir,color:C.creme,border:"none",padding:"5px 11px",fontSize:10,cursor:"pointer",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,whiteSpace:"nowrap"}}>+ Añadir</button>
                          </div>
                          {p.weights && (
                            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                              {p.weights.map(ww=>(
                                <button key={ww} onClick={()=>setSelW(s=>({...s,[p.id]:ww}))} style={{
                                  padding:"3px 8px",
                                  border:`1.5px solid ${w===ww?C.noir:C.warmMid}`,
                                  background:w===ww?C.noir:"transparent",
                                  color:w===ww?C.creme:C.textMid,
                                  fontSize:10,cursor:"pointer",fontWeight:500,
                                }}>{PESOS[ww]}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>}
              </div>
            </div>
          )
        })()}

        {/* Resumen */}
        {diasConPedido.length>0 && (
          <div style={{background:"#fff",border:`1px solid ${C.warmMid}`,padding:"24px 28px",marginTop:14}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:500,color:C.text,marginBottom:16}}>Resumen de tu pedido</div>
            {diasConPedido.sort().map(f=>{
              const fd=fechas.find(x=>x.fecha===f)
              const dia=agenda[f]
              const tot=dia.items.reduce((s,i)=>s+i.price*i.qty,0)
              return (
                <div key={f} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.warm}`,flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>
                      {fd?.diaFull} {fd?.numero} {fd?.mes}.
                      <span style={{marginLeft:8,fontSize:11,background:dia.turno==="am"?"#FFF0DC":"#EEEEFF",color:dia.turno==="am"?"#7A3A00":"#2A2A8A",padding:"2px 8px",fontWeight:700}}>{dia.turno==="am"?"☀ AM":"🌆 PM"}</span>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {dia.items.map(i=><span key={i.key} style={{fontSize:12,color:C.textMid}}>{i.product.emoji} {i.qty}× {i.product.name}{i.weight?` ${PESOS[i.weight]}`:""}</span>)}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.rouge,fontWeight:500}}>{fmt(tot)}</span>
                    <button onClick={()=>toggleDia(f)} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"4px 10px",cursor:"pointer",fontSize:11}}>Editar</button>
                  </div>
                </div>
              )
            })}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginTop:4}}>
              <div>
                <div style={{fontSize:11,color:C.textLight,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Total · {diasConPedido.length} día{diasConPedido.length>1?"s":""}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:C.rouge,fontWeight:500}}>{fmt(total)}</div>
              </div>
              <button style={{...btnPrimary,width:"auto",padding:"13px 44px"}} onClick={onCheckout}>Ir a pagar →</button>
            </div>
          </div>
        )}

        {!diasConPedido.length&&!diaActivo && (
          <div style={{textAlign:"center",padding:"56px 20px",color:C.textLight}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,color:C.warmMid,marginBottom:12}}>—</div>
            <div style={{fontWeight:600,fontSize:16,color:C.textMid,marginBottom:6}}>Selecciona un día para comenzar</div>
            <div style={{fontSize:13}}>Haz clic en cualquier día del calendario</div>
          </div>
        )}
      </div>
      <FooterNCM/>
    </div>
  )
}

// ── PAYMENT & SUCCESS ──────────────────────────────────────────────────────────
function PaymentScreen({total, dias, onSuccess}){
  return (
    <div>
      <div style={{maxWidth:500,margin:"60px auto",padding:24}}>
        <div style={{background:"#fff",border:`1px solid ${C.warmMid}`,padding:"36px 40px",textAlign:"center"}}>
          <div style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:14,fontWeight:600}}>CONFIRMAR PAGO</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,color:C.rouge,fontWeight:500,marginBottom:6}}>{fmt(total)}</div>
          <p style={{fontSize:13,color:C.textMid,marginBottom:28}}>Pedidos programados · {dias} día{dias>1?"s":""}</p>
          <div style={{background:C.warm,border:`1px solid ${C.warmMid}`,padding:14,marginBottom:20,textAlign:"left"}}>
            <p style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.textLight,marginBottom:5,fontWeight:600}}>Tarjeta de prueba</p>
            <p style={{fontFamily:"monospace",fontSize:14,letterSpacing:2}}>4009 1753 3280 6176</p>
            <p style={{fontSize:12,color:C.textMid,marginTop:3}}>CVV: 123 · Venc: 11/25</p>
          </div>
          <button style={{...btnPrimary,marginBottom:10}}>Pagar con Mercado Pago</button>
          <button onClick={onSuccess} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"13px 0",width:"100%",cursor:"pointer",fontSize:11,fontWeight:500,letterSpacing:2,textTransform:"uppercase"}}>
            Simular pago exitoso (demo)
          </button>
        </div>
      </div>
      <FooterNCM/>
    </div>
  )
}

function SuccessScreen({onNueva, onCuenta}){
  return (
    <div>
      <div style={{maxWidth:560,margin:"80px auto",padding:"40px 24px",textAlign:"center"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:60,color:C.or,lineHeight:1,marginBottom:14}}>✦</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:500,marginBottom:10,color:C.text}}>¡Pedidos confirmados!</h2>
        <p style={{color:C.textMid,lineHeight:1.9,marginBottom:36,fontSize:14}}>Recibirás un WhatsApp y email<br/>cuando tu pedido llegue a conserjería.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button style={{...btnPrimary,width:"auto",padding:"13px 36px"}} onClick={onNueva}>Nueva agenda</button>
          <button onClick={onCuenta} style={{background:"transparent",border:`1.5px solid ${C.noir}`,padding:"13px 28px",cursor:"pointer",fontSize:11,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:C.text}}>Mi cuenta</button>
        </div>
      </div>
      <FooterNCM/>
    </div>
  )
}
