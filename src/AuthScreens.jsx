import { C, COMUNAS, DEMO_USER } from './constants.js'
import { inpBox, btnPrimary, FooterNCM } from './ui.jsx'
import { useState } from 'react'

const lbl = {fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.textMid,marginBottom:5,display:"block",fontWeight:600}
const fieldWrap = {marginBottom:16}

// ── CALLES y EDIFICIOS mock ────────────────────────────────────────────────────
const MOCK_STREETS = {
  "Providencia":  ["Av. Providencia","Av. Nueva Providencia","Av. Pedro de Valdivia","Av. Ricardo Lyon","Av. Tobalaba"],
  "Las Condes":   ["Av. Apoquindo","Av. Las Condes","Av. Vitacura","Av. El Bosque","Alonso de Córdova"],
  "Ñuñoa":        ["Av. Irarrázaval","Av. Grecia","Calle Suecia","Av. Ossa","Av. Macul"],
}
const MOCK_EDIFICIOS = {
  "Providencia":  ["Edificio Las Lilas — Av. Providencia 1200","Torre Bellavista — Bellavista 789","Edificio Nova — Nueva Providencia 1881"],
  "Las Condes":   ["Edificio Portal Sur — Apoquindo 3000","Torre Titanium — Vitacura 2939"],
  "Ñuñoa":        [],
}

export function RegisterScreen({onSuccess, onLogin, showToast}){
  const [comuna, setComuna]         = useState("")
  const [calle, setCalle]           = useState("")
  const [numero, setNumero]         = useState("")
  const [streetSugg, setStreetSugg] = useState([])
  const [edificioSugg, setEdifSugg] = useState([])
  const [seleccionado, setSelec]    = useState("")
  const [esEdificio, setEsEdificio] = useState(false)

  function onCalleChange(v){
    setCalle(v)
    const streets = (MOCK_STREETS[comuna]||[]).filter(s=>s.toLowerCase().includes(v.toLowerCase()))
    const edifs   = (MOCK_EDIFICIOS[comuna]||[]).filter(s=>s.toLowerCase().includes(v.toLowerCase()))
    setStreetSugg(v.length>1 ? streets : [])
    setEdifSugg(v.length>1 ? edifs : [])
    setSelec("")
    setEsEdificio(false)
  }

  function selStreet(s){
    setCalle(s); setStreetSugg([]); setEdifSugg([])
    setSelec(s+(numero?" "+numero:""))
  }
  function selEdificio(e){
    setCalle(e.split(" — ")[1]||e); setStreetSugg([]); setEdifSugg([])
    setSelec(e); setEsEdificio(true)
  }

  function handleSubmit(ev){
    ev.preventDefault()
    const fd = new FormData(ev.target)
    onSuccess({...DEMO_USER, name:fd.get("name"), email:fd.get("email"), phone:fd.get("phone")})
    showToast("¡Cuenta creada! Bienvenida 🥐")
  }

  return (
    <div>
      <div style={{maxWidth:700, margin:"0 auto", padding:"56px 24px 80px"}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:500,color:C.text,textAlign:"center",marginBottom:6}}>Crear mi cuenta</h2>
        <p style={{textAlign:"center",fontSize:13,color:C.textLight,marginBottom:40}}>Completa tus datos para comenzar</p>

        <form onSubmit={handleSubmit}>
          <div style={{background:"#fff",border:`1px solid ${C.warmMid}`,padding:"32px 36px"}}>

            {/* DIRECCIÓN */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div style={fieldWrap}>
                <label style={lbl}>COMUNA</label>
                <select style={{...inpBox,cursor:"pointer"}} name="commune" value={comuna} onChange={e=>{setComuna(e.target.value);setCalle("");setSelec("");}} required>
                  <option value="">Selecciona tu comuna</option>
                  {COMUNAS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={lbl}>CÓDIGO REFERIDO (OPCIONAL)</label>
                <input style={inpBox} name="referido" placeholder="Ej: MARIA-504"/>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:4}}>
              <div style={fieldWrap}>
                <label style={lbl}>CALLE, PASAJE O EDIFICIO</label>
                <input style={inpBox} value={calle} onChange={e=>onCalleChange(e.target.value)} placeholder="Escribe para buscar..." autoComplete="off"/>
              </div>
              <div style={fieldWrap}>
                <label style={lbl}>NÚMERO</label>
                <input style={inpBox} value={numero} onChange={e=>{setNumero(e.target.value);if(calle)setSelec(calle+" "+e.target.value)}} placeholder="1881"/>
              </div>
            </div>

            <p style={{fontSize:11,color:C.textLight,marginBottom:12,lineHeight:1.6}}>
              Primero comuna, luego calle/pasaje, número y edificio. Si no hay edificio verificado, puedes seguir con dirección manual.
            </p>

            {/* SUGERENCIAS */}
            {(streetSugg.length>0||edificioSugg.length>0) && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:C.warmMid,marginBottom:16}}>
                <div style={{background:C.bg,padding:14}}>
                  <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.textLight,marginBottom:8,fontWeight:600}}>CALLES Y PASAJES</div>
                  {streetSugg.length===0
                    ? <div style={{fontSize:12,color:C.textLight}}>Sin sugerencias locales para esta búsqueda.</div>
                    : streetSugg.map(s=>(
                        <div key={s} onClick={()=>selStreet(s)} style={{fontSize:13,color:C.text,padding:"6px 0",cursor:"pointer",borderBottom:`1px solid ${C.warm}`}}>{s}</div>
                      ))
                  }
                </div>
                <div style={{background:C.bg,padding:14}}>
                  <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.textLight,marginBottom:8,fontWeight:600}}>EDIFICIOS VERIFICADOS</div>
                  {edificioSugg.length===0
                    ? <div style={{fontSize:12,color:C.textLight}}>No hay edificios verificados en esta comuna para este filtro.</div>
                    : edificioSugg.map(e=>(
                        <div key={e} onClick={()=>selEdificio(e)} style={{fontSize:13,color:C.text,padding:"6px 0",cursor:"pointer",borderBottom:`1px solid ${C.warm}`}}>{e}</div>
                      ))
                  }
                </div>
              </div>
            )}

            {seleccionado && (
              <div style={{background:"#EDF5ED",border:"1px solid #8AAA88",padding:"10px 14px",marginBottom:16,fontSize:13,color:"#2A4A2A"}}>
                {esEdificio && <span style={{color:"#3D5A3D",fontWeight:700,marginRight:6}}>✓ Edificio verificado — </span>}
                Seleccionado: {seleccionado}
              </div>
            )}

            {/* DATOS PERSONALES */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={fieldWrap}>
                <label style={lbl}>NOMBRE COMPLETO</label>
                <input style={inpBox} name="name" placeholder="Ej: María González" required/>
              </div>
              <div style={fieldWrap}>
                <label style={lbl}>WHATSAPP</label>
                <input style={inpBox} name="phone" type="tel" placeholder="+56 9 1234 5678" required/>
              </div>
            </div>
            <div style={fieldWrap}>
              <label style={lbl}>EMAIL</label>
              <input style={inpBox} name="email" type="email" placeholder="tu@email.com" required/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={fieldWrap}>
                <label style={lbl}>DEPARTAMENTO / OFICINA</label>
                <input style={inpBox} name="apt" placeholder="Ej: 504"/>
              </div>
              <div style={fieldWrap}>
                <label style={lbl}>NOTAS OPCIONALES</label>
                <input style={inpBox} name="notas" placeholder="Interfono, conserjería, horario, etc"/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={fieldWrap}>
                <label style={lbl}>CONTRASEÑA</label>
                <input style={inpBox} name="password" type="password" placeholder="••••••••" minLength={8} required/>
              </div>
              <div style={fieldWrap}>
                <label style={lbl}>REPETIR CONTRASEÑA</label>
                <input style={inpBox} name="password2" type="password" placeholder="••••••••" minLength={8} required/>
              </div>
            </div>

            <button type="submit" style={{...btnPrimary,marginTop:8}}>CREAR MI CUENTA</button>
          </div>
        </form>
        <p style={{textAlign:"center",marginTop:16,fontSize:13,color:C.textLight}}>
          ¿Ya tienes cuenta?{" "}
          <span onClick={onLogin} style={{color:C.rouge,cursor:"pointer",fontWeight:600}}>Ingresar aquí</span>
        </p>
      </div>
      <FooterNCM/>
    </div>
  )
}

export function LoginScreen({onSuccess, onRegister, showToast}){
  function handleSubmit(ev){
    ev.preventDefault()
    onSuccess(DEMO_USER)
    showToast("Bienvenida, María 🥐")
  }
  return (
    <div>
      <div style={{maxWidth:520, margin:"0 auto", padding:"64px 24px 80px"}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:500,textAlign:"center",marginBottom:6,color:C.text}}>Ingresar</h2>
        <p style={{textAlign:"center",fontSize:13,color:C.textLight,marginBottom:36}}>Acceso a tu cuenta, pedidos e historial</p>

        <div style={{height:1,background:C.warmMid,margin:"0 0 28px",position:"relative"}}>
          <span style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",background:C.bg,padding:"0 14px",fontSize:11,color:C.textLight,letterSpacing:1}}>o con email</span>
        </div>

        <div style={{background:"#fff",border:`1px solid ${C.warmMid}`,padding:"28px 32px"}}>
          <form onSubmit={handleSubmit}>
            <div style={fieldWrap}>
              <label style={lbl}>EMAIL</label>
              <input style={inpBox} name="email" type="email" placeholder="tu@email.com" required/>
            </div>
            <div style={fieldWrap}>
              <label style={lbl}>CONTRASEÑA</label>
              <input style={inpBox} name="password" type="password" placeholder="••••••••" required/>
            </div>
            <button type="submit" style={{...btnPrimary,marginTop:8}}>INGRESAR</button>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
              <span onClick={()=>showToast("Revisa tu email 📧")} style={{fontSize:12,color:C.rouge,cursor:"pointer",fontWeight:500}}>Recuperar contraseña</span>
              <span onClick={()=>showToast("Disponible próximamente")} style={{fontSize:12,color:C.rouge,cursor:"pointer",fontWeight:500}}>Cambiar contraseña</span>
            </div>
          </form>
        </div>
        <p style={{textAlign:"center",marginTop:16,fontSize:13,color:C.textLight}}>
          ¿No tienes cuenta?{" "}
          <span onClick={onRegister} style={{color:C.rouge,cursor:"pointer",fontWeight:600}}>Crear cuenta</span>
        </p>
      </div>
      <FooterNCM/>
    </div>
  )
}
