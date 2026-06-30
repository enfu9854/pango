import { C } from './constants.js'

export const inp = {
  width:"100%", padding:"10px 14px",
  border:"none", borderBottom:`1.5px solid ${C.warmMid}`,
  background:"transparent", fontFamily:"'DM Sans',sans-serif",
  fontSize:14, color:C.text, outline:"none",
}
export const inpBox = {
  width:"100%", padding:"10px 14px",
  border:`1px solid ${C.warmMid}`,
  background:"#fff", fontFamily:"'DM Sans',sans-serif",
  fontSize:14, color:C.text, outline:"none", borderRadius:2,
}
export const btnPrimary = {
  background:C.noir, color:C.creme, border:"none",
  padding:"13px 0", width:"100%", cursor:"pointer",
  fontFamily:"'DM Sans',sans-serif", fontSize:12,
  fontWeight:600, letterSpacing:2, textTransform:"uppercase",
}

export function NB({label, active, onClick}){
  return (
    <button onClick={onClick} style={{
      background:"transparent", color:active?"#fff":"rgba(255,255,255,.55)",
      border:"none", padding:"6px 14px", fontSize:11,
      letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer",
      fontWeight:active?600:400,
      borderBottom:active?`1.5px solid ${C.or}`:"1.5px solid transparent",
    }}>{label}</button>
  )
}

export function FooterNCM(){
  return (
    <footer style={{background:"#1A1208", padding:"48px 32px 32px"}}>
      <div style={{maxWidth:960, margin:"0 auto", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:32}}>
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif", marginBottom:6}}>
            <span style={{fontSize:22, fontWeight:700, color:"#fff", letterSpacing:2}}>NCM</span>
            <span style={{fontSize:13, color:"rgba(255,255,255,.5)", marginLeft:6}}>Group</span>
          </div>
          <div style={{fontSize:11, color:"rgba(255,255,255,.4)", letterSpacing:1, marginBottom:8, textTransform:"uppercase"}}>INFRAESTRUCTURA OPERACIONAL · FINANCIERA · DIGITAL.</div>
          <div style={{fontSize:11, color:"rgba(255,255,255,.3)"}}>© 2026 NCM Group · Providencia, Santiago · Miami, Florida · Confidencial</div>
          <div style={{fontSize:11, color:"rgba(255,255,255,.3)", marginTop:4}}>Contacto: pango@ncm.cl</div>
        </div>
        <div>
          <div style={{fontSize:10, letterSpacing:3, color:"rgba(255,255,255,.4)", textTransform:"uppercase", marginBottom:14, fontWeight:600}}>REDES</div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:16}}>
            {[
              {label:"Facebook",  bg:"#1877F2"},
              {label:"Instagram", bg:"#E4405F"},
              {label:"LinkedIn",  bg:"#0A66C2"},
              {label:"WhatsApp",  bg:"#25D366"},
              {label:"Email",     bg:"#555"},
            ].map(r=>(
              <button key={r.label} style={{background:r.bg, color:"#fff", border:"none", padding:"6px 14px", fontSize:11, fontWeight:600, cursor:"pointer", borderRadius:2}}>{r.label}</button>
            ))}
          </div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            {["Términos de uso","Privacidad","Entregas","Pagos"].map(l=>(
              <button key={l} style={{background:"transparent", color:"rgba(255,255,255,.5)", border:"1px solid rgba(255,255,255,.2)", padding:"5px 12px", fontSize:11, cursor:"pointer"}}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export function Toast({msg}){
  if(!msg) return null
  return (
    <div style={{
      position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
      background:C.noir, color:C.creme, padding:"11px 28px",
      fontSize:13, fontWeight:500, zIndex:9999, whiteSpace:"nowrap",
      boxShadow:"0 4px 20px rgba(0,0,0,.3)",
    }}>{msg}</div>
  )
}
