import { C, NIVELES } from './constants.js'
import { FooterNCM } from './ui.jsx'

const HERO_IMG = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=90"

export default function HomeScreen({onStart, onLogin, onProductos}){
  return (
    <div>
      {/* HERO — foto real de pan */}
      <div style={{
        position:"relative", minHeight:"92vh",
        display:"flex", alignItems:"center",
        background:`url(${HERO_IMG}) center/cover no-repeat`,
      }}>
        <div style={{position:"absolute",inset:0,background:"rgba(10,6,2,.52)"}}/>
        <div style={{position:"relative",zIndex:1,padding:"0 80px",maxWidth:640}}>
          <p style={{fontSize:11,letterSpacing:5,color:C.or,textTransform:"uppercase",marginBottom:18,fontWeight:600}}>
            ARTISAN · QUOTIDIEN · MAISON
          </p>
          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(56px,7vw,90px)",
            color:"#fff", lineHeight:.88, marginBottom:10, letterSpacing:-2,
          }}>
            Pan<span style={{color:C.or}}>Go</span>
          </h1>
          <p style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:22, color:C.orLight, fontStyle:"italic", marginBottom:28,
          }}>Boulangerie artesanal</p>
          <p style={{color:"rgba(255,255,255,.75)",fontSize:15,lineHeight:1.8,maxWidth:420,marginBottom:40}}>
            Pan artesanal programado día a día, con horario y productos distintos cada vez. Entrega directa en conserjería.
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
            <button onClick={onStart} style={{
              background:"#fff", color:C.noir, border:"none",
              padding:"13px 36px", fontSize:11, fontWeight:700,
              letterSpacing:2, textTransform:"uppercase", cursor:"pointer",
            }}>CREAR MI CUENTA</button>
            <button onClick={onProductos} style={{
              background:"transparent", color:"#fff",
              border:"1.5px solid rgba(255,255,255,.6)",
              padding:"13px 28px", fontSize:11, fontWeight:600,
              letterSpacing:2, textTransform:"uppercase", cursor:"pointer",
            }}>VER PRODUCTOS</button>
          </div>
          <button onClick={onLogin} style={{
            background:"none", border:"none", color:"rgba(255,255,255,.7)",
            fontSize:13, cursor:"pointer", padding:0, textDecoration:"underline",
          }}>Ya tengo cuenta →</button>
        </div>
      </div>

      {/* BENEFICIOS */}
      <div style={{background:C.bg, padding:"64px 32px"}}>
        <p style={{textAlign:"center",fontSize:10,letterSpacing:5,color:C.or,textTransform:"uppercase",marginBottom:44,fontWeight:600}}>
          BENEFICIOS EXCLUSIVOS
        </p>
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",
          gap:1, background:C.warmMid, maxWidth:960, margin:"0 auto",
        }}>
          {NIVELES.filter(n=>n.id!=="base").map(n=>(
            <div key={n.id} style={{background:n.bg, padding:"32px 26px"}}>
              <div style={{fontSize:28,marginBottom:12}}>{n.icon}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:500,color:n.color,marginBottom:10}}>{n.nombre}</div>
              <div style={{fontSize:13,color:C.textMid,marginBottom:8,fontWeight:500,lineHeight:1.5}}>{n.descripcion}</div>
              <div style={{fontSize:11,color:C.textLight,lineHeight:1.6}}>{n.requisito}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUOTE */}
      <div style={{background:C.noir, padding:"56px 32px", textAlign:"center"}}>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontStyle:"italic",color:C.orLight,marginBottom:24}}>
          "Le pain, c'est la vie."
        </p>
        <button onClick={onStart} style={{
          background:"transparent", color:"#fff",
          border:"1px solid rgba(255,255,255,.4)",
          padding:"12px 40px", fontSize:11, fontWeight:600,
          letterSpacing:3, textTransform:"uppercase", cursor:"pointer",
        }}>COMENZAR AHORA</button>
        <p style={{fontSize:10,color:"rgba(255,255,255,.2)",marginTop:20,letterSpacing:2}}>NCM Group · pango.ncm.cl</p>
      </div>

      <FooterNCM/>
    </div>
  )
}
