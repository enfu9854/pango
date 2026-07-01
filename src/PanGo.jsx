import { useState, useEffect, useRef } from "react";

const API       = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const ADMIN_KEY = "pango2024";

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  noir:"#1A1208", creme:"#F7F2E8", or:"#C9A84C", orLight:"#E8D5A3",
  rouge:"#8B2E1A", sage:"#3D5A3D", warm:"#EDE4D3", warmMid:"#C8B89A",
  text:"#1A1208", textMid:"#4A3728", textLight:"#6B5545", bg:"#F7F2E8",
};

const DIAS   = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const DIAS_F = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const PESOS  = {500:"500 gr",1000:"1 kg",1500:"1,5 kg",2000:"2 kg"};

const NIVELES = [
  {id:"base",      icon:"🥐", nombre:"Cliente Base",     color:C.textMid, bg:C.warm,
   desc:"Precios regulares del catálogo", req:"Registrarse en PanGo"},
  {id:"referidos", icon:"⭐", nombre:"Pan Preferente",   color:"#854F0B", bg:"#FAEEDA",
   desc:"Cualquier pan al precio más bajo del catálogo",
   req:"30 referidos válidos (3+ meses, $50.000/mes) · Promedio $50.000/mes últimos 3 meses"},
  {id:"gold",      icon:"🌟", nombre:"Pan Gold",         color:"#5C3D00", bg:"#FDF3DC",
   desc:"5 tipos de pan al precio más bajo del catálogo",
   req:"6 meses activo · Promedio $50.000/mes últimos 3 meses"},
  {id:"platinum",  icon:"💎", nombre:"Pan Platinum",     color:"#1A3A6B", bg:"#E8F0FB",
   desc:"7 tipos de pan al precio más bajo del catálogo",
   req:"12 meses activo · Promedio $50.000/mes últimos 3 meses"},
];

function fmt(n){return `$${Math.round(n||0).toLocaleString("es-CL")}`;}
function calcPrecio(p,w,nivel,products){
  if(!p)return 0;
  const base=p.base_price||p.basePrice||0;
  const extra=p.price_per_extra500||p.pricePerExtra500||0;
  const bw=p.base_weight||p.baseWeight||500;
  const normal=p.category==="Pan"?base+Math.max(0,((w||bw)-bw)/500)*extra:base;
  if(p.category!=="Pan"||!nivel||nivel==="base")return normal;
  const panes=(products||[]).filter(pr=>pr.category==="Pan");
  if(!panes.length)return normal;
  const minBase=Math.min(...panes.map(pr=>pr.base_price||pr.basePrice||9999));
  const minPan=panes.find(pr=>(pr.base_price||pr.basePrice)===minBase);
  const minPrecio=minBase+Math.max(0,((w||bw)-(minPan?.base_weight||500))/500)*(minPan?.price_per_extra500||0);
  return nivel!=="base"?Math.min(normal,minPrecio):normal;
}
function getFechas(semanas=4){
  const hoy=new Date();const out=[];
  for(let i=1;i<=semanas*7;i++){
    const d=new Date(hoy);d.setDate(hoy.getDate()+i);
    const dow=d.getDay();
    out.push({fecha:d.toISOString().split("T")[0],diaNombre:DIAS[dow===0?6:dow-1],
      diaFull:DIAS_F[dow===0?6:dow-1],numero:d.getDate(),
      mes:d.toLocaleDateString("es-CL",{month:"short"}),semana:Math.ceil(i/7)});
  }
  return out;
}
async function apiFetch(p,o={}){
  const r=await fetch(`${API}${p}`,{headers:{"Content-Type":"application/json",...o.headers},...o});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||r.statusText);}
  return r.json();
}
function adminFetch(p,o={}){return apiFetch(p,{...o,headers:{"x-admin-key":ADMIN_KEY,...(o.headers||{})}});}

// ─── Fotos reales productos ────────────────────────────────────────────────────
const FOTOS={
  hallulla:     "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80",
  corriente:    "https://images.unsplash.com/photo-1568471173242-461f0a730452?auto=format&fit=crop&w=700&q=80",
  ciabatta:     "https://images.unsplash.com/photo-1534620808146-d33bb39128b2?auto=format&fit=crop&w=700&q=80",
  emp_pino_aji: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=700&q=80",
  emp_pino_saji:"https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=700&q=80",
  emp_queso:    "https://images.unsplash.com/photo-1638507078498-3b0cb0042df5?auto=format&fit=crop&w=700&q=80",
};

// ─── SVG fallback ─────────────────────────────────────────────────────────────
const SVG={
  hallulla:`<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <rect width="320" height="240" fill="#1A1208"/>
    <ellipse cx="107" cy="95"  rx="55" ry="42" fill="#C8783A"/><ellipse cx="107" cy="90"  rx="52" ry="38" fill="#D4884A"/>
    <ellipse cx="213" cy="95"  rx="55" ry="42" fill="#C47035"/><ellipse cx="213" cy="90"  rx="52" ry="38" fill="#D0804A"/>
    <ellipse cx="107" cy="150" rx="55" ry="42" fill="#C47035"/><ellipse cx="107" cy="145" rx="52" ry="38" fill="#D0804A"/>
    <ellipse cx="213" cy="150" rx="55" ry="42" fill="#BF6830"/><ellipse cx="213" cy="145" rx="52" ry="38" fill="#CB7840"/>
    <ellipse cx="92"  cy="80"  rx="40" ry="28" fill="none" stroke="#E8A870" stroke-width="1" opacity=".5"/>
    <ellipse cx="198" cy="80"  rx="40" ry="28" fill="none" stroke="#E8A870" stroke-width="1" opacity=".5"/>
    <ellipse cx="92"  cy="135" rx="40" ry="28" fill="none" stroke="#E8A870" stroke-width="1" opacity=".5"/>
    <ellipse cx="198" cy="135" rx="40" ry="28" fill="none" stroke="#E8A870" stroke-width="1" opacity=".5"/>
    <ellipse cx="88"  cy="74"  rx="14" ry="8"  fill="#F0C890" opacity=".3"/>
    <ellipse cx="194" cy="74"  rx="14" ry="8"  fill="#F0C890" opacity=".3"/>
    <line x1="40" y1="210" x2="280" y2="210" stroke="#C9A84C" stroke-width="1" opacity=".6"/>
    <text x="160" y="228" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#C9A84C" letter-spacing="4" opacity=".9">PAN HALLULLA</text>
  </svg>`,
  corriente:`<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <rect width="320" height="240" fill="#1A1208"/>
    <!-- Marraqueta: dos panes unidos con surco central -->
    <ellipse cx="160" cy="118" rx="120" ry="58" fill="#A05520"/>
    <ellipse cx="114" cy="104" rx="72"  ry="48" fill="#C8783A"/>
    <ellipse cx="206" cy="104" rx="72"  ry="48" fill="#C07035"/>
    <!-- Surco central profundo -->
    <ellipse cx="160" cy="104" rx="12"  ry="48" fill="#7A3A10" opacity=".9"/>
    <!-- Corte superior marraqueta -->
    <path d="M 60 88 Q 114 68 160 80 Q 206 68 260 88" fill="none" stroke="#E8A060" stroke-width="3" opacity=".7"/>
    <!-- Textura crujiente -->
    <path d="M 68 108 Q 114 96 160 102 Q 206 96 252 108" fill="none" stroke="#904820" stroke-width="1" opacity=".4"/>
    <path d="M 72 118 Q 114 108 160 113 Q 206 108 248 118" fill="none" stroke="#904820" stroke-width="1" opacity=".3"/>
    <!-- Harina superficial -->
    <ellipse cx="95"  cy="82" rx="8"  ry="4" fill="#F0E8D5" opacity=".45"/>
    <ellipse cx="224" cy="78" rx="7"  ry="3" fill="#F0E8D5" opacity=".4"/>
    <ellipse cx="148" cy="76" rx="5"  ry="2" fill="#F0E8D5" opacity=".35"/>
    <!-- Brillo -->
    <ellipse cx="100" cy="85" rx="30" ry="12" fill="#E8C070" opacity=".22"/>
    <ellipse cx="215" cy="82" rx="28" ry="11" fill="#E8C070" opacity=".18"/>
    <line x1="40" y1="210" x2="280" y2="210" stroke="#C9A84C" stroke-width="1" opacity=".6"/>
    <text x="160" y="228" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#C9A84C" letter-spacing="4" opacity=".9">MARRAQUETA</text>
  </svg>`,
  ciabatta:`<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <rect width="320" height="240" fill="#1A1208"/>
    <ellipse cx="160" cy="118" rx="128" ry="54" fill="#9A5018"/>
    <ellipse cx="160" cy="108" rx="124" ry="46" fill="#BA7030"/>
    <!-- Cortes diagonales ciabatta -->
    <line x1="88"  y1="72" x2="100" y2="142" stroke="#7A3A10" stroke-width="3" opacity=".75"/>
    <line x1="116" y1="66" x2="128" y2="136" stroke="#7A3A10" stroke-width="3" opacity=".75"/>
    <line x1="144" y1="63" x2="156" y2="133" stroke="#7A3A10" stroke-width="3" opacity=".75"/>
    <line x1="172" y1="63" x2="184" y2="133" stroke="#7A3A10" stroke-width="3" opacity=".75"/>
    <line x1="200" y1="66" x2="212" y2="136" stroke="#7A3A10" stroke-width="3" opacity=".75"/>
    <line x1="228" y1="70" x2="240" y2="140" stroke="#7A3A10" stroke-width="3" opacity=".7"/>
    <!-- Harina abundante -->
    <ellipse cx="104" cy="78" rx="10" ry="5" fill="#F0E8D5" opacity=".55"/>
    <ellipse cx="160" cy="70" rx="12" ry="5" fill="#F0E8D5" opacity=".5"/>
    <ellipse cx="215" cy="76" rx="9"  ry="4" fill="#F0E8D5" opacity=".5"/>
    <ellipse cx="136" cy="72" rx="7"  ry="3" fill="#F0E8D5" opacity=".4"/>
    <ellipse cx="188" cy="73" rx="8"  ry="3" fill="#F0E8D5" opacity=".42"/>
    <!-- Brillo -->
    <ellipse cx="118" cy="86" rx="32" ry="12" fill="#E8C068" opacity=".2"/>
    <line x1="40" y1="210" x2="280" y2="210" stroke="#C9A84C" stroke-width="1" opacity=".6"/>
    <text x="160" y="228" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#C9A84C" letter-spacing="4" opacity=".9">PAN CIABATTA</text>
  </svg>`,
  emp_pino_aji:`<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <rect width="320" height="240" fill="#1A1208"/>
    <!-- Empanada de horno: forma ovalada grande con repulgue -->
    <ellipse cx="160" cy="120" rx="125" ry="72" fill="#B86820"/>
    <ellipse cx="157" cy="110" rx="120" ry="64" fill="#D07838"/>
    <!-- Repulgue inferior (borde característico) -->
    <path d="M 38 130 Q 160 195 282 130" fill="#904818" opacity=".9" stroke="none"/>
    <path d="M 44 128 Q 160 190 276 128" fill="none" stroke="#C07030" stroke-width="3" stroke-dasharray="9,6" opacity=".7"/>
    <!-- Textura horneada -->
    <path d="M 60  98 Q 160  82 260  98" fill="none" stroke="#904818" stroke-width="1.5" opacity=".45"/>
    <path d="M 52 110 Q 160  95 268 110" fill="none" stroke="#904818" stroke-width="1"   opacity=".3"/>
    <!-- Detalle ají: dos líneas decorativas + punto rojo -->
    <path d="M 130 106 Q 160 98 190 106" fill="none" stroke="#904818" stroke-width="2" opacity=".6"/>
    <circle cx="160" cy="108" r="9" fill="#8B2E1A" opacity=".9"/>
    <circle cx="160" cy="108" r="5" fill="#C0392B"/>
    <circle cx="157" cy="105" r="2" fill="#E84040" opacity=".7"/>
    <!-- Brillo horneado -->
    <ellipse cx="118" cy="92" rx="42" ry="20" fill="#F0C870" opacity=".18"/>
    <ellipse cx="112" cy="86" rx="20" ry="9"  fill="#FFFFF0" opacity=".1"/>
    <!-- Sésamo decorativo -->
    <ellipse cx="200" cy="96" rx="4" ry="2" fill="#E8D080" opacity=".6" transform="rotate(-20 200 96)"/>
    <ellipse cx="185" cy="90" rx="4" ry="2" fill="#E8D080" opacity=".5" transform="rotate(15 185 90)"/>
    <ellipse cx="216" cy="102" rx="4" ry="2" fill="#E8D080" opacity=".55" transform="rotate(-10 216 102)"/>
    <line x1="40" y1="210" x2="280" y2="210" stroke="#C9A84C" stroke-width="1" opacity=".6"/>
    <text x="160" y="228" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#C9A84C" letter-spacing="3" opacity=".9">EMPANADA · PINO CON AJÍ</text>
  </svg>`,
  emp_pino_saji:`<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <rect width="320" height="240" fill="#1A1208"/>
    <ellipse cx="160" cy="120" rx="125" ry="72" fill="#B86820"/>
    <ellipse cx="157" cy="110" rx="120" ry="64" fill="#D07838"/>
    <path d="M 38 130 Q 160 195 282 130" fill="#904818" opacity=".9"/>
    <path d="M 44 128 Q 160 190 276 128" fill="none" stroke="#C07030" stroke-width="3" stroke-dasharray="9,6" opacity=".7"/>
    <path d="M 60  98 Q 160  82 260  98" fill="none" stroke="#904818" stroke-width="1.5" opacity=".45"/>
    <path d="M 52 110 Q 160  95 268 110" fill="none" stroke="#904818" stroke-width="1"   opacity=".3"/>
    <!-- Sin punto rojo, con decoración neutra -->
    <path d="M 128 104 Q 160 96 192 104" fill="none" stroke="#904818" stroke-width="2" opacity=".6"/>
    <path d="M 136 112 Q 160 106 184 112" fill="none" stroke="#B06828" stroke-width="1.5" opacity=".5"/>
    <!-- Brillo -->
    <ellipse cx="118" cy="92" rx="42" ry="20" fill="#F0C870" opacity=".2"/>
    <ellipse cx="196" cy="96" rx="4" ry="2" fill="#E8D080" opacity=".6" transform="rotate(-20 196 96)"/>
    <ellipse cx="181" cy="90" rx="4" ry="2" fill="#E8D080" opacity=".5" transform="rotate(15 181 90)"/>
    <ellipse cx="212" cy="102" rx="4" ry="2" fill="#E8D080" opacity=".55" transform="rotate(-10 212 102)"/>
    <line x1="40" y1="210" x2="280" y2="210" stroke="#C9A84C" stroke-width="1" opacity=".6"/>
    <text x="160" y="228" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#C9A84C" letter-spacing="3" opacity=".9">EMPANADA · PINO SIN AJÍ</text>
  </svg>`,
  emp_queso:`<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <rect width="320" height="240" fill="#1A1208"/>
    <!-- Empanada queso: más dorada/amarilla -->
    <ellipse cx="160" cy="120" rx="125" ry="72" fill="#B88020"/>
    <ellipse cx="157" cy="110" rx="120" ry="64" fill="#D49838"/>
    <path d="M 38 130 Q 160 195 282 130" fill="#907018" opacity=".9"/>
    <path d="M 44 128 Q 160 190 276 128" fill="none" stroke="#C09030" stroke-width="3" stroke-dasharray="9,6" opacity=".7"/>
    <!-- Queso derretido saliendo -->
    <path d="M 118 112 Q 142 120 160 116 Q 178 120 202 112" fill="#F0D050" opacity=".8"/>
    <path d="M 124 108 Q 148 116 160 113 Q 172 116 196 108" fill="#F8E060" opacity=".5"/>
    <!-- Textura dorada -->
    <path d="M 60 98 Q 160 82 260 98" fill="none" stroke="#907018" stroke-width="1.5" opacity=".4"/>
    <!-- Brillo más brillante por queso -->
    <ellipse cx="115" cy="88" rx="45" ry="22" fill="#F8E870" opacity=".2"/>
    <ellipse cx="108" cy="82" rx="22" ry="10" fill="#FFFFE0" opacity=".12"/>
    <ellipse cx="196" cy="94" rx="4" ry="2" fill="#E8D080" opacity=".6" transform="rotate(-20 196 94)"/>
    <ellipse cx="181" cy="88" rx="4" ry="2" fill="#E8D080" opacity=".5" transform="rotate(15 181 88)"/>
    <line x1="40" y1="210" x2="280" y2="210" stroke="#C9A84C" stroke-width="1" opacity=".6"/>
    <text x="160" y="228" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#C9A84C" letter-spacing="3" opacity=".9">EMPANADA DE QUESO</text>
  </svg>`,
};

// ─── Términos resumidos para aceptar en el registro ───────────────────────────
const TERMINOS_RESUMEN = `Al crear una cuenta en PanGo aceptas:
• Las entregas se realizan EXCLUSIVAMENTE en conserjería del edificio registrado.
• PanGo NO es responsable por pérdidas, extravíos o deterioro de productos una vez entregados en portería. El registro del nombre del conserje receptor y la hora de entrega constituyen prueba suficiente de entrega.
• Pedidos pagados no son reembolsables salvo cancelación por causas imputables a PanGo.
• Reclamos por productos defectuosos deben realizarse dentro de 2 horas de la notificación de entrega.
• Los beneficios de fidelización requieren un promedio de facturación de $50.000/mes en los últimos 3 meses.
• Tus datos personales son tratados conforme a la Ley N°19.628 de Chile.`;

// ─── Demo cuenta ──────────────────────────────────────────────────────────────
const DEMO_CUENTA = {
  name:"María González",email:"maria@email.com",phone:"+56912345678",
  building:"demo-1",apt:"504",edificioNombre:"Edificio Las Lilas",
  nivel:"gold",mesesActivo:7,promedioUlt3:72000,
  miembroDesde:"2025-11-10",codigoReferido:"MARIA-504",
  referidos:[
    {nombre:"Carlos Pérez",meses:5,activo:true,promedio:65000},
    {nombre:"Ana Rodríguez",meses:4,activo:true,promedio:58000},
    {nombre:"Pedro Silva",meses:2,activo:false,promedio:22000},
    {nombre:"Laura Martínez",meses:6,activo:true,promedio:78000},
  ],
  historial:[
    {fecha:"2026-06-09",productos:"Pan Hallulla 1kg + Empanada Queso ×2",total:5600,turno:"am",estado:"entregado"},
    {fecha:"2026-06-07",productos:"Marraqueta 500g + Ciabatta 500g",total:4050,turno:"pm",estado:"entregado"},
    {fecha:"2026-06-05",productos:"Empanada Pino ×3",total:7200,turno:"am",estado:"entregado"},
    {fecha:"2026-06-03",productos:"Pan Hallulla 2kg",total:4500,turno:"am",estado:"entregado"},
  ],
  pedidosPendientes:[
    {fecha:"2026-06-14",productos:"Pan Hallulla 1kg",total:2300,turno:"am",estado:"pagado"},
  ],
};

const DEMO_PRODUCTS=[
  {id:"hallulla",name:"Pan Hallulla",emoji:"🫓",category:"Pan",base_price:1200,price_per_extra500:1100,base_weight:500,weights:[500,1000,1500,2000],description:"Suave y esponjoso, ideal para el desayuno. Horneado cada mañana con harina artesanal."},
  {id:"corriente",name:"Pan Corriente (Marraqueta)",emoji:"🍞",category:"Pan",base_price:900,price_per_extra500:850,base_weight:500,weights:[500,1000,1500,2000],description:"La marraqueta chilena: crujiente por fuera, blanda por dentro. El favorito de siempre."},
  {id:"ciabatta",name:"Pan Ciabatta",emoji:"🥖",category:"Pan",base_price:1500,price_per_extra500:1400,base_weight:500,weights:[500,1000,1500,2000],description:"Italiano artesanal de masa madre. Corteza crocante y miga alveolada. Perfecto para tablas."},
  {id:"emp_pino_aji",name:"Empanada de Pino con Ají",emoji:"🌶️",category:"Empanadas",base_price:2400,description:"Carne jugosa, aceitunas, huevo y un toque de merkén. Dorada al horno, bien sellada."},
  {id:"emp_pino_saji",name:"Empanada de Pino sin Ají",emoji:"🥟",category:"Empanadas",base_price:2200,description:"Carne jugosa con aceitunas y huevo. El sabor tradicional sin el picante."},
  {id:"emp_queso",name:"Empanada de Queso",emoji:"🧀",category:"Empanadas",base_price:1900,description:"Queso mantecoso derretido en masa dorada y crujiente. Irresistible recién salida del horno."},
];
const DEMO_BUILDINGS=[
  {id:"demo-1",name:"Edificio Las Lilas",address:"Av. Las Lilas 1200, Las Condes"},
  {id:"demo-2",name:"Edificio Portal Sur",address:"Calle Portal 456, Providencia"},
  {id:"demo-3",name:"Torre Bellavista",address:"Bellavista 789, Recoleta"},
];

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.warm};color:${C.text};font-family:'DM Sans',sans-serif;font-size:16px}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.warmMid}}
  input,select,button,textarea{font-family:'DM Sans',sans-serif}
`;
const btnP=(d=false)=>({
  background:d?C.warmMid:C.noir,color:d?"#999":C.creme,border:"none",
  padding:"14px 0",width:"100%",cursor:d?"not-allowed":"pointer",
  fontSize:14,fontWeight:600,letterSpacing:2,textTransform:"uppercase",
});
const inp={
  width:"100%",padding:"13px 16px",border:`1.5px solid ${C.warmMid}`,
  background:C.bg,fontSize:15,color:C.text,outline:"none",
};

// ══════════════════════════════════════════════════════════════════════════════
export default function PanGo(){
  const [screen,setScreen]=useState("home");
  const [products,setProducts]=useState([]);
  const [buildings,setBuildings]=useState([]);
  const [user,setUser]=useState(null);
  const [toast,setToast]=useState("");
  const [loading,setLoading]=useState(false);
  const [agenda,setAgenda]=useState({});
  const [diaActivo,setDiaActivo]=useState(null);
  const [semana,setSemana]=useState(1);
  const [frecuencia,setFrecuencia]=useState("once");
  const [catFilter,setCatFilter]=useState("Todos");
  const [combos,setCombos]=useState([]);
  const [adminUnlocked,setAdminUnlocked]=useState(false);
  const [adminPass,setAdminPass]=useState("");
  const [adminTab,setAdminTab]=useState("resumen");
  const [adminDay,setAdminDay]=useState("Lun");
  const [adminData,setAdminData]=useState(null);
  const [adminOrders,setAdminOrders]=useState([]);
  const [editingProd,setEditingProd]=useState(null);
  const fechas=getFechas(4);

  useEffect(()=>{
    apiFetch("/products").then(setProducts).catch(()=>setProducts(DEMO_PRODUCTS));
    apiFetch("/buildings").then(setBuildings).catch(()=>setBuildings(DEMO_BUILDINGS));
    const p=new URLSearchParams(window.location.search);
    if(p.get("status")==="success"){setScreen("success");window.history.replaceState({},"","/");}
  },[]);
  useEffect(()=>{
    if(!adminUnlocked)return;
    if(adminTab==="resumen")adminFetch(`/admin/summary/${adminDay}`).then(setAdminData).catch(()=>setAdminData(null));
    if(adminTab==="pedidos")adminFetch("/admin/orders").then(setAdminOrders).catch(()=>setAdminOrders([]));
  },[adminUnlocked,adminTab,adminDay]);

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(""),3200);}
  const nivel=user?.nivel||"base";
  const diasConPedido=Object.keys(agenda).filter(f=>agenda[f]?.items?.length>0);
  const totalAgenda=diasConPedido.reduce((s,f)=>s+agenda[f].items.reduce((ss,i)=>ss+i.price*i.qty,0),0);

  function setTurno(fecha,turno){setAgenda(a=>({...a,[fecha]:{turno,items:a[fecha]?.items||[]}}));}
  function addItem(fecha,product,weight){
    const key=`${product.id}_${weight||"u"}`;
    const price=calcPrecio(product,weight,nivel,products);
    setAgenda(a=>{
      const dia=a[fecha]||{turno:"am",items:[]};
      const ex=dia.items.find(i=>i.key===key);
      return{...a,[fecha]:{...dia,items:ex
        ?dia.items.map(i=>i.key===key?{...i,qty:i.qty+1}:i)
        :[...dia.items,{key,product,weight,qty:1,price}]}};
    });
    showToast(`${product.emoji} ${product.name} añadido`);
  }
  function updItem(fecha,key,delta){
    setAgenda(a=>{
      const dia=a[fecha];if(!dia)return a;
      return{...a,[fecha]:{...dia,items:dia.items.map(i=>i.key===key?{...i,qty:Math.max(0,i.qty+delta)}:i).filter(i=>i.qty>0)}};
    });
  }
  function removeDia(fecha){setAgenda(a=>{const n={...a};delete n[fecha];return n;});}

  async function handleCheckout(){
    if(!diasConPedido.length)return showToast("Agrega al menos un producto");
    setLoading(true);
    try{
      const b=buildings.find(b=>b.id===user?.building);
      const results=[];
      for(const fecha of diasConPedido){
        const dia=agenda[fecha];
        const r=await apiFetch("/orders",{method:"POST",body:JSON.stringify({
          user:{...user,buildingName:b?.name},
          items:dia.items.map(i=>({productId:i.product.id,weight:i.weight,qty:i.qty})),
          days:[fechas.find(f=>f.fecha===fecha)?.diaNombre||fecha],
          shift:dia.turno,deliveryDate:fecha,
        })}).catch(()=>({orderId:`DEMO-${fecha}`,total:dia.items.reduce((s,i)=>s+i.price*i.qty,0),sandboxUrl:"#"}));
        results.push(r);
      }
      setScreen("payment");
    }catch(e){showToast(e.message);}
    finally{setLoading(false);}
  }

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.warm,minHeight:"100vh",color:C.text,fontSize:16}}>
      <style>{CSS}</style>
      {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",
        background:C.noir,color:C.creme,padding:"12px 28px",fontSize:14,fontWeight:600,
        letterSpacing:.5,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.3)"}}>
        {toast}</div>}

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{background:C.noir,padding:"0 28px",height:62,display:"flex",
        alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200}}>
        <div onClick={()=>setScreen("home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontFamily:"'IM Fell English',serif",fontSize:24,color:C.orLight,letterSpacing:1}}>
            Pan<span style={{color:C.or}}>Go</span></span>
          <span style={{width:1,height:18,background:"rgba(255,255,255,.2)"}}/>
          <span style={{fontSize:10,letterSpacing:3,color:"rgba(255,255,255,.4)",textTransform:"uppercase"}}>Boulangerie</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:2,flexWrap:"wrap"}}>
          <NB label="Inicio"    active={screen==="home"}     onClick={()=>setScreen("home")}/>
          <NB label="Productos" active={screen==="catalog"}  onClick={()=>setScreen("catalog")}/>
          {user?<>
            <NB label="Mi agenda"  active={screen==="agenda"}  onClick={()=>setScreen("agenda")}/>
            <NB label="Mis combos" active={screen==="combos"}  onClick={()=>setScreen("combos")}/>
            <NB label="Mi cuenta"  active={screen==="cuenta"}  onClick={()=>setScreen("cuenta")}/>
          </>:<>
            <NB label="Ingresar"    active={screen==="login"}    onClick={()=>setScreen("login")}/>
            <NB label="Registrarse" active={screen==="register"} onClick={()=>setScreen("register")}/>
          </>}
          {diasConPedido.length>0&&(
            <button onClick={()=>setScreen("agenda")} style={{
              background:C.or,color:C.noir,border:"none",padding:"8px 16px",
              fontSize:13,fontWeight:700,letterSpacing:1,cursor:"pointer",marginLeft:6}}>
              🛒 {diasConPedido.length} · {fmt(totalAgenda)}
            </button>
          )}
          <button onClick={()=>setScreen("admin")} style={{
            background:"transparent",color:"rgba(255,255,255,.3)",border:"none",
            padding:"8px 10px",fontSize:16,cursor:"pointer",marginLeft:4}}>⚙</button>
        </div>
      </nav>

      {/* ── HOME ─────────────────────────────────────────────────────────── */}
      {screen==="home"&&<HomeScreen onStart={()=>setScreen("register")} onLogin={()=>setScreen("login")} onCatalog={()=>setScreen("catalog")}/>}

      {/* ── CATÁLOGO ─────────────────────────────────────────────────────── */}
      {screen==="catalog"&&(
        <div style={{maxWidth:1060,margin:"0 auto",padding:"48px 20px 80px"}}>
          <div style={{textAlign:"center",marginBottom:44}}>
            <p style={{fontSize:11,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>
              Elaborado diario · Entrega en conserjería
            </p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:500,color:C.text,marginBottom:10}}>
              Nuestra selección
            </h2>
            <p style={{fontSize:15,color:C.textMid,fontWeight:400}}>
              Pedido hasta las 24:00 · Turno AM (8–12 h) o PM (16–20 h)
            </p>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:36}}>
            {["Todos","Pan","Empanadas"].map(c=>(
              <button key={c} onClick={()=>setCatFilter(c)} style={{
                padding:"8px 22px",border:`1.5px solid ${catFilter===c?C.noir:C.warmMid}`,
                background:catFilter===c?C.noir:"transparent",
                color:catFilter===c?C.creme:C.textMid,
                fontSize:13,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",fontWeight:500}}>
                {c}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:1,background:C.warmMid}}>
            {products.filter(p=>catFilter==="Todos"||p.category===catFilter).map(p=>(
              <CatalogCard key={p.id} product={p} nivel={nivel} products={products}
                onOrder={()=>user?setScreen("agenda"):setScreen("register")}/>
            ))}
          </div>
          {!user&&(
            <div style={{marginTop:44,background:C.noir,padding:"36px",textAlign:"center"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:C.orLight,marginBottom:14,fontWeight:500}}>
                ¿Quieres recibir estos productos en tu edificio?
              </div>
              <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                <button style={{...btnP(),width:"auto",padding:"13px 40px"}} onClick={()=>setScreen("register")}>
                  Crear mi cuenta gratis
                </button>
                <button onClick={()=>setScreen("login")} style={{
                  background:"transparent",color:"rgba(255,255,255,.7)",
                  border:"1px solid rgba(255,255,255,.3)",padding:"13px 32px",
                  cursor:"pointer",fontSize:14,fontWeight:500,letterSpacing:1.5,textTransform:"uppercase"}}>
                  Ya tengo cuenta
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REGISTRO ─────────────────────────────────────────────────────── */}
      {screen==="register"&&(
        <Wrap>
          <PT title="Crear mi cuenta" sub="Elige cómo registrarte"/>
          <div style={{maxWidth:520,margin:"0 auto"}}>
            <div style={{display:"grid",gap:10,marginBottom:24}}>
              {[{icon:"💬",label:"Continuar con WhatsApp"},{icon:"G",label:"Continuar con Google"},{icon:"🍎",label:"Continuar con Apple"}].map(o=>(
                <button key={o.label} onClick={()=>{}} style={{
                  display:"flex",alignItems:"center",gap:16,
                  background:C.bg,border:`1.5px solid ${C.warmMid}`,
                  padding:"15px 22px",cursor:"pointer",fontSize:15,fontWeight:500,color:C.text,width:"100%"}}>
                  <span style={{fontSize:22,minWidth:28,textAlign:"center"}}>{o.icon}</span>{o.label}
                </button>
              ))}
            </div>
            <Divider label="o con email"/>
            <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:32}}>
              <RegisterForm buildings={buildings} onSubmit={data=>{
                setUser({...data,nivel:"base",mesesActivo:0,promedioUlt3:0,
                  referidos:[],historial:[],pedidosPendientes:[],
                  codigoReferido:`${data.name.split(" ")[0].toUpperCase()}-${data.apt}`,
                  miembroDesde:new Date().toISOString().split("T")[0]});
                setScreen("agenda");
              }} showToast={showToast}/>
            </div>
            <p style={{textAlign:"center",marginTop:18,fontSize:14,color:C.textLight}}>
              ¿Ya tienes cuenta?{" "}
              <span onClick={()=>setScreen("login")} style={{color:C.rouge,cursor:"pointer",fontWeight:600}}>Ingresar aquí</span>
            </p>
          </div>
        </Wrap>
      )}

      {/* ── LOGIN ────────────────────────────────────────────────────────── */}
      {screen==="login"&&(
        <Wrap>
          <PT title="Ingresar" sub="Bienvenido de vuelta"/>
          <div style={{maxWidth:440,margin:"0 auto"}}>
            <div style={{display:"grid",gap:10,marginBottom:20}}>
              {[{icon:"💬",label:"Entrar con WhatsApp"},{icon:"G",label:"Entrar con Google"},{icon:"🍎",label:"Entrar con Apple"}].map(o=>(
                <button key={o.label} onClick={()=>{setUser(DEMO_CUENTA);setScreen("agenda");}} style={{
                  display:"flex",alignItems:"center",gap:16,
                  background:C.bg,border:`1.5px solid ${C.warmMid}`,
                  padding:"15px 22px",cursor:"pointer",fontSize:15,fontWeight:500,color:C.text,width:"100%"}}>
                  <span style={{fontSize:22,minWidth:28,textAlign:"center"}}>{o.icon}</span>{o.label}
                </button>
              ))}
            </div>
            <Divider label="o con email"/>
            <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:28}}>
              <FL label="Email"><input style={inp} type="email" placeholder="tu@email.com"/></FL>
              <FL label="Contraseña"><input style={inp} type="password" placeholder="••••••••"/></FL>
              <button style={{...btnP(),marginTop:22}} onClick={()=>{setUser(DEMO_CUENTA);setScreen("agenda");}}>
                Ingresar
              </button>
              <p style={{textAlign:"center",marginTop:12,fontSize:13,color:C.textLight}}>Demo: cualquier dato funciona</p>
            </div>
            <p style={{textAlign:"center",marginTop:16,fontSize:14,color:C.textLight}}>
              ¿No tienes cuenta?{" "}
              <span onClick={()=>setScreen("register")} style={{color:C.rouge,cursor:"pointer",fontWeight:600}}>Crear cuenta</span>
            </p>
          </div>
        </Wrap>
      )}

      {/* ── AGENDA ───────────────────────────────────────────────────────── */}
      {screen==="agenda"&&(
        <div style={{maxWidth:980,margin:"0 auto",padding:"36px 20px 120px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:16}}>
            <div>
              <p style={{fontSize:11,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Mi agenda</p>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:500,color:C.text,marginBottom:6}}>
                ¿Qué días quieres recibir?
              </h2>
              <p style={{fontSize:15,color:C.textMid,fontWeight:400}}>Cada día puede tener productos y horario diferente</p>
              {nivel!=="base"&&(
                <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:8,
                  background:NIVELES.find(n=>n.id===nivel)?.bg,padding:"6px 14px",border:`1px solid ${C.warmMid}`}}>
                  <span style={{fontSize:16}}>{NIVELES.find(n=>n.id===nivel)?.icon}</span>
                  <span style={{fontSize:13,fontWeight:600,color:NIVELES.find(n=>n.id===nivel)?.color}}>
                    {NIVELES.find(n=>n.id===nivel)?.nombre} — precios especiales aplicados
                  </span>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
              {[{k:"once",l:"Solo esta vez"},{k:"weekly",l:"Semanal"},{k:"biweekly",l:"Quincenal"},{k:"monthly",l:"Mensual"}].map(f=>(
                <button key={f.k} onClick={()=>setFrecuencia(f.k)} style={{
                  padding:"6px 14px",border:`1.5px solid ${frecuencia===f.k?C.noir:C.warmMid}`,
                  background:frecuencia===f.k?C.noir:"transparent",
                  color:frecuencia===f.k?C.creme:C.textMid,
                  fontSize:12,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontWeight:500}}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>
          {/* Semanas */}
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {[1,2,3,4].map(s=>(
              <button key={s} onClick={()=>setSemana(s)} style={{
                padding:"7px 16px",border:`1.5px solid ${semana===s?C.noir:C.warmMid}`,
                background:semana===s?C.noir:"transparent",color:semana===s?C.creme:C.textMid,
                fontSize:13,cursor:"pointer",fontWeight:500}}>Semana {s}</button>
            ))}
          </div>
          {/* Calendario */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,background:C.warmMid,marginBottom:20}}>
            {fechas.filter(f=>f.semana===semana).map(fd=>{
              const dia=agenda[fd.fecha];const items=dia?.items||[];
              const total=items.reduce((s,i)=>s+i.price*i.qty,0);
              const activo=diaActivo===fd.fecha;const tiene=items.length>0;
              return(
                <div key={fd.fecha} onClick={()=>setDiaActivo(activo?null:fd.fecha)} style={{
                  background:activo?C.noir:tiene?"#EFE9DC":C.bg,
                  padding:"14px 8px",cursor:"pointer",
                  borderBottom:activo?`3px solid ${C.or}`:"3px solid transparent"}}>
                  <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",
                    color:activo?"rgba(255,255,255,.6)":C.textLight,marginBottom:4,fontWeight:600}}>{fd.diaNombre}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,
                    color:activo?C.or:tiene?C.rouge:C.text,fontWeight:500}}>{fd.numero}</div>
                  <div style={{fontSize:12,color:activo?"rgba(255,255,255,.5)":C.textLight,fontWeight:400}}>{fd.mes}</div>
                  {tiene&&<div style={{marginTop:6}}>
                    <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",
                      color:activo?C.or:C.rouge,marginBottom:2,fontWeight:700}}>
                      {dia.turno==="am"?"☀ AM":"🌆 PM"}
                    </div>
                    <div style={{fontSize:12,color:activo?C.orLight:C.textMid,fontWeight:600}}>{fmt(total)}</div>
                  </div>}
                </div>
              );
            })}
          </div>
          {/* Panel día activo */}
          {diaActivo&&(
            <DiaPedido fecha={diaActivo} fechaInfo={fechas.find(f=>f.fecha===diaActivo)}
              dia={agenda[diaActivo]} products={products} nivel={nivel}
              onSetTurno={t=>setTurno(diaActivo,t)}
              onAddItem={(p,w)=>addItem(diaActivo,p,w)}
              onUpdateItem={(k,d)=>updItem(diaActivo,k,d)}
              onRemoveDia={()=>{removeDia(diaActivo);setDiaActivo(null);}}/>
          )}
          {/* Resumen carrito */}
          {diasConPedido.length>0&&(
            <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:28,marginTop:16}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.text,marginBottom:18,fontWeight:500}}>
                Resumen de tu pedido
              </div>
              {diasConPedido.sort().map(fecha=>{
                const fd=fechas.find(f=>f.fecha===fecha);
                const dia=agenda[fecha];
                const tot=dia.items.reduce((s,i)=>s+i.price*i.qty,0);
                return(
                  <div key={fecha} style={{display:"flex",justifyContent:"space-between",
                    alignItems:"flex-start",padding:"12px 0",borderBottom:`1px solid ${C.warm}`}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:15,color:C.text,marginBottom:4}}>
                        {fd?.diaFull} {fd?.numero} {fd?.mes}
                        <span style={{marginLeft:10,fontSize:12,
                          color:dia.turno==="am"?"#7A3A00":"#2A2A8A",
                          background:dia.turno==="am"?"#FFF0DC":"#EEEEFF",
                          padding:"3px 10px",fontWeight:600}}>
                          {dia.turno==="am"?"☀ AM":"🌆 PM"}
                        </span>
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {dia.items.map(i=>(
                          <span key={i.key} style={{fontSize:14,color:C.textMid,fontWeight:400}}>
                            {i.product.emoji} {i.qty}× {i.product.name}{i.weight?` ${PESOS[i.weight]}`:""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.rouge,fontWeight:500}}>
                        {fmt(tot)}
                      </span>
                      <button onClick={()=>setDiaActivo(fecha)} style={{
                        background:"transparent",border:`1px solid ${C.warmMid}`,
                        padding:"5px 12px",fontSize:12,cursor:"pointer",color:C.textMid,fontWeight:500}}>
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
              {frecuencia!=="once"&&(
                <div style={{background:"#EDF5ED",border:"1px solid #5A8A5A",padding:"14px 18px",marginTop:14,fontSize:14,color:"#2A5A2A",fontWeight:400}}>
                  🔄 Este patrón se repetirá <strong>{({once:"solo esta vez",weekly:"semanalmente",biweekly:"quincenalmente",monthly:"mensualmente"})[frecuencia]}</strong>. Puedes pausar o cancelar desde Mi cuenta.
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:18,marginTop:4}}>
                <div>
                  <div style={{fontSize:12,color:C.textLight,letterSpacing:1,textTransform:"uppercase",marginBottom:2,fontWeight:600}}>
                    Total · {diasConPedido.length} día{diasConPedido.length>1?"s":""}
                  </div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:C.rouge,fontWeight:500}}>
                    {fmt(totalAgenda)}
                  </div>
                </div>
                <button style={{...btnP(loading),width:"auto",padding:"14px 48px"}}
                  onClick={handleCheckout} disabled={loading}>
                  {loading?"Procesando…":"Ir a pagar →"}
                </button>
              </div>
            </div>
          )}
          {diasConPedido.length===0&&!diaActivo&&(
            <div style={{textAlign:"center",padding:"52px 20px",color:C.textLight}}>
              <div style={{fontFamily:"'IM Fell English',serif",fontSize:48,color:C.warmMid,marginBottom:14}}>—</div>
              <div style={{fontWeight:600,fontSize:16,color:C.textMid,marginBottom:6}}>Selecciona un día para comenzar</div>
              <div style={{fontSize:14,color:C.textLight,fontWeight:400}}>Haz clic en cualquier día del calendario</div>
            </div>
          )}
        </div>
      )}

      {/* ── MI CUENTA ────────────────────────────────────────────────────── */}
      {screen==="cuenta"&&user&&<MiCuenta user={user} nivel={nivel}/>}

      {screen==="combos"&&user&&(
        <MisCombos
          combos={combos} setCombos={setCombos}
          products={products} nivel={nivel}
          agenda={agenda} setAgenda={setAgenda}
          fechas={getFechas(4)}
          showToast={showToast}
          onIrAgenda={()=>setScreen("agenda")}
        />
      )}

      {/* ── PAYMENT ──────────────────────────────────────────────────────── */}
      {screen==="payment"&&(
        <Wrap>
          <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:36,maxWidth:520,margin:"0 auto"}}>
            <div style={{fontFamily:"'IM Fell English',serif",fontSize:12,letterSpacing:4,color:C.or,
              textTransform:"uppercase",marginBottom:16,fontWeight:400,textAlign:"center"}}>Confirmar pago</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,color:C.rouge,
              marginBottom:6,fontWeight:500,textAlign:"center"}}>{fmt(totalAgenda)}</div>
            <p style={{fontSize:14,color:C.textMid,marginBottom:28,fontWeight:400,textAlign:"center"}}>
              {diasConPedido.length} pedido{diasConPedido.length>1?"s":""} programado{diasConPedido.length>1?"s":""}
            </p>
            {/* Métodos de pago */}
            <div style={{marginBottom:24}}>
              <div style={{fontSize:12,letterSpacing:2,textTransform:"uppercase",color:C.textLight,marginBottom:14,fontWeight:600}}>
                Método de pago
              </div>
              {[
                {icon:"💳",label:"Tarjeta de crédito o débito",sub:"Visa, Mastercard, American Express"},
                {icon:"📱",label:"Mercado Pago",sub:"Billetera digital, cuotas sin interés"},
                {icon:"🏦",label:"Transferencia bancaria",sub:"Todos los bancos nacionales"},
              ].map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:16,
                  padding:"14px 16px",border:`1.5px solid ${i===0?C.noir:C.warmMid}`,
                  background:i===0?C.bg:"transparent",marginBottom:8,cursor:"pointer"}}>
                  <span style={{fontSize:22}}>{m.icon}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:C.text}}>{m.label}</div>
                    <div style={{fontSize:12,color:C.textLight,fontWeight:400}}>{m.sub}</div>
                  </div>
                  {i===0&&<div style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",
                    background:C.noir,border:`2px solid ${C.noir}`,display:"flex",
                    alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:C.or}}/>
                  </div>}
                </div>
              ))}
            </div>
            <div style={{background:C.warm,border:`1px solid ${C.warmMid}`,padding:16,marginBottom:24}}>
              <p style={{fontSize:12,letterSpacing:2,textTransform:"uppercase",color:C.textLight,marginBottom:8,fontWeight:600}}>
                Tarjeta de prueba (sandbox)
              </p>
              <p style={{fontFamily:"monospace",fontSize:15,letterSpacing:2,color:C.text}}>4009 1753 3280 6176</p>
              <p style={{fontSize:13,color:C.textMid,marginTop:4,fontWeight:400}}>CVV: 123 · Venc: 11/25</p>
            </div>
            <a href="#" style={{display:"block",background:C.noir,color:C.creme,padding:"15px 0",
              textDecoration:"none",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",
              marginBottom:10,textAlign:"center"}}>
              Pagar con Mercado Pago
            </a>
            <button onClick={()=>{setAgenda({});setScreen("success");}} style={{
              background:"transparent",border:`1px solid ${C.warmMid}`,width:"100%",
              padding:"12px 0",cursor:"pointer",fontSize:12,color:C.textMid,
              letterSpacing:1.5,textTransform:"uppercase",fontWeight:500}}>
              Simular pago exitoso (demo)
            </button>
          </div>
        </Wrap>
      )}

      {/* ── SUCCESS ──────────────────────────────────────────────────────── */}
      {screen==="success"&&(
        <Wrap>
          <div style={{maxWidth:500,margin:"0 auto",textAlign:"center"}}>
            <div style={{fontFamily:"'IM Fell English',serif",fontSize:56,color:C.or,lineHeight:1,marginBottom:14}}>✦</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,fontWeight:500,marginBottom:12,color:C.text}}>
              ¡Pedidos confirmados!
            </h2>
            <p style={{color:C.textMid,lineHeight:1.9,marginBottom:36,fontSize:15,fontWeight:400}}>
              Recibirás un WhatsApp y email<br/>cuando tu pedido llegue a conserjería.
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <button style={{...btnP(),width:"auto",padding:"14px 36px"}} onClick={()=>{setAgenda({});setScreen("agenda");}}>
                Nueva agenda
              </button>
              <button onClick={()=>setScreen("cuenta")} style={{
                background:"transparent",border:`1.5px solid ${C.noir}`,padding:"14px 28px",
                cursor:"pointer",fontSize:13,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:C.text}}>
                Mi cuenta
              </button>
            </div>
          </div>
        </Wrap>
      )}

      {/* ── ADMIN ────────────────────────────────────────────────────────── */}
      {screen==="admin"&&(
        adminUnlocked
          ?<AdminPanel tab={adminTab} setTab={setAdminTab} day={adminDay} setDay={setAdminDay}
              data={adminData} orders={adminOrders} products={products}
              editingProd={editingProd} setEditingProd={setEditingProd}
              onDeliver={async id=>{
                try{await adminFetch(`/admin/orders/${id}/deliver`,{method:"POST"});showToast("Entregado");adminFetch("/admin/orders").then(setAdminOrders);}
                catch(e){showToast(e.message);}
              }}
              onPriceUpdate={async(id,b,e)=>{
                try{const u=await adminFetch(`/products/${id}`,{method:"PATCH",body:JSON.stringify({basePrice:b,pricePerExtra500:e})});
                  setProducts(prev=>prev.map(p=>p.id===id?{...p,...u}:p));setEditingProd(null);showToast("Precio actualizado");}
                catch(e){showToast(e.message);}
              }}
              onSendWA={async()=>{
                const ph=prompt("WhatsApp del admin:");if(!ph)return;
                try{await adminFetch("/admin/whatsapp/daily-summary",{method:"POST",body:JSON.stringify({day:adminDay,adminPhone:ph})});showToast("Enviado");}
                catch(e){showToast(e.message);}
              }}
              onLogout={()=>{setAdminUnlocked(false);setAdminPass("");}}/>
          :<Wrap>
            <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:36,maxWidth:380,margin:"0 auto",textAlign:"center"}}>
              <div style={{fontFamily:"'IM Fell English',serif",fontSize:12,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:22,fontWeight:400}}>
                Acceso restringido
              </div>
              <input type="password" style={{...inp,marginBottom:16}} placeholder="Clave de administrador"
                value={adminPass} onChange={e=>setAdminPass(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&(adminPass==="pango2024"?setAdminUnlocked(true):showToast("Clave incorrecta"))}/>
              <button style={btnP()} onClick={()=>adminPass==="pango2024"?setAdminUnlocked(true):showToast("Clave incorrecta")}>
                Ingresar
              </button>
              <p style={{fontSize:13,color:C.textLight,marginTop:12,fontWeight:400}}>Demo: pango2024</p>
            </div>
          </Wrap>
      )}
    </div>
  );
}

// ─── FORMULARIO DE REGISTRO COMPLETO ─────────────────────────────────────────
function RegisterForm({buildings,onSubmit,showToast}){
  const [form,setForm]=useState({name:"",email:"",phone:"",building:"",apt:"",referido:"",pass:""});
  const [aceptado,setAceptado]=useState(false);
  const [verTerminos,setVerTerminos]=useState(false);
  const f=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  function submit(e){
    e.preventDefault();
    if(!form.name||!form.email||!form.phone||!form.building||!form.apt)return showToast("Completa todos los campos obligatorios");
    if(!aceptado)return showToast("Debes aceptar los Términos y Condiciones");
    onSubmit(form);
  }
  return(
    <form onSubmit={submit}>
      <FL label="Nombre completo *"><input style={inp} value={form.name} onChange={f("name")} placeholder="Ej: María González" required/></FL>
      <FL label="Email *"><input style={inp} type="email" value={form.email} onChange={f("email")} placeholder="tu@email.com" required/></FL>
      <FL label="WhatsApp *"><input style={inp} type="tel" value={form.phone} onChange={f("phone")} placeholder="+56 9 1234 5678" required/></FL>
      <FL label="Edificio *">
        <select style={{...inp,cursor:"pointer"}} value={form.building} onChange={f("building")} required>
          <option value="">Selecciona tu edificio</option>
          {buildings.map(b=><option key={b.id} value={b.id}>{b.name} — {b.address}</option>)}
        </select>
      </FL>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <FL label="Departamento *"><input style={inp} value={form.apt} onChange={f("apt")} placeholder="Ej: 504" required/></FL>
        <FL label="Código de referido"><input style={inp} value={form.referido} onChange={f("referido")} placeholder="Ej: MARIA-504"/></FL>
      </div>
      <FL label="Contraseña *"><input style={inp} type="password" value={form.pass} onChange={f("pass")} placeholder="Mínimo 8 caracteres" required/></FL>

      {/* Términos y condiciones */}
      <div style={{marginTop:22,background:C.warm,border:`1px solid ${C.warmMid}`,padding:16}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
          <input type="checkbox" id="terminos" checked={aceptado} onChange={e=>setAceptado(e.target.checked)}
            style={{width:20,height:20,marginTop:2,cursor:"pointer",accentColor:C.noir,flexShrink:0}}/>
          <label htmlFor="terminos" style={{fontSize:14,color:C.text,lineHeight:1.6,cursor:"pointer",fontWeight:400}}>
            He leído y acepto los{" "}
            <span onClick={e=>{e.preventDefault();setVerTerminos(v=>!v);}}
              style={{color:C.rouge,fontWeight:600,cursor:"pointer",textDecoration:"underline"}}>
              Términos y Condiciones
            </span>
            {" "}de uso de PanGo, incluyendo la política de entregas y exención de responsabilidad. <strong>Obligatorio.</strong>
          </label>
        </div>
        {verTerminos&&(
          <div style={{background:C.bg,border:`1px solid ${C.warmMid}`,padding:16,
            fontSize:13,color:C.textMid,lineHeight:1.8,maxHeight:180,overflowY:"auto",fontWeight:400}}>
            {TERMINOS_RESUMEN.split("\n").map((l,i)=>(
              <p key={i} style={{marginBottom:l.startsWith("•")?4:8,paddingLeft:l.startsWith("•")?8:0}}>{l}</p>
            ))}
            <p style={{marginTop:10,fontSize:12,color:C.textLight}}>
              Documento completo disponible en ncm.cl/terminos
            </p>
          </div>
        )}
      </div>
      <button type="submit" style={{...btnP(!aceptado),marginTop:22}} disabled={!aceptado}>
        Crear mi cuenta
      </button>
    </form>
  );
}

// ─── CATALOG CARD ─────────────────────────────────────────────────────────────
function CatalogCard({product,nivel,products,onOrder}){
  const [selW,setSelW]=useState(product.weights?.[0]||null);
  const precio=calcPrecio(product,selW,nivel,products);
  const precioNormal=calcPrecio(product,selW,"base",products);
  const tieneDescuento=precio<precioNormal;
  return(
    <div style={{background:C.bg,display:"flex",flexDirection:"column"}}>
      <div style={{height:230,overflow:"hidden",position:"relative",background:C.noir}}>
        <img src={FOTOS[product.id]||FOTOS.corriente} alt={product.name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.9) contrast(1.05)"}}
          onError={e=>{e.target.style.background="#2A1A0A";e.target.style.display="none";}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(26,18,8,.45) 0%,transparent 60%)"}}/>
      </div>
      <div style={{padding:"20px 20px 24px",flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:500,color:C.text,marginBottom:8}}>
          {product.name}
        </div>
        <div style={{fontSize:14,color:C.textMid,lineHeight:1.7,marginBottom:16,flex:1,fontWeight:400}}>
          {product.description}
        </div>
        {product.weights&&(
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
            {product.weights.map(w=>(
              <button key={w} onClick={()=>setSelW(w)} style={{
                padding:"5px 12px",border:`1.5px solid ${selW===w?C.noir:C.warmMid}`,
                background:selW===w?C.noir:"transparent",
                color:selW===w?C.creme:C.textMid,
                fontSize:12,cursor:"pointer",fontWeight:500}}>
                {PESOS[w]}
              </button>
            ))}
          </div>
        )}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.rouge,fontWeight:500}}>
              {fmt(precio)}
            </div>
            {tieneDescuento&&(
              <div style={{fontSize:12,color:C.textLight,textDecoration:"line-through",fontWeight:400}}>
                {fmt(precioNormal)}
              </div>
            )}
          </div>
          <button onClick={onOrder} style={{
            background:C.noir,color:C.creme,border:"none",padding:"11px 22px",
            fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>
            Pedir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DIA PEDIDO ───────────────────────────────────────────────────────────────
function DiaPedido({fecha,fechaInfo,dia,products,nivel,onSetTurno,onAddItem,onUpdateItem,onRemoveDia}){
  const [mostrar,setMostrar]=useState(true);
  const [filtro,setFiltro]=useState("Todos");
  const items=dia?.items||[];const turno=dia?.turno||"am";
  const total=items.reduce((s,i)=>s+i.price*i.qty,0);
  return(
    <div style={{background:C.bg,border:`2px solid ${C.noir}`,padding:24,marginBottom:16,boxShadow:`4px 4px 0 ${C.noir}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:500,color:C.text}}>
            {fechaInfo?.diaFull} {fechaInfo?.numero} de {fechaInfo?.mes}
          </div>
          {nivel!=="base"&&<div style={{fontSize:13,color:C.sage,marginTop:4,fontWeight:600}}>
            ✓ Precios {NIVELES.find(n=>n.id===nivel)?.nombre} aplicados
          </div>}
        </div>
        {items.length>0&&<button onClick={onRemoveDia} style={{
          background:"transparent",border:`1px solid ${C.warmMid}`,
          padding:"6px 14px",fontSize:13,cursor:"pointer",color:C.textMid,fontWeight:500,letterSpacing:1,textTransform:"uppercase"}}>
          Quitar día
        </button>}
      </div>
      {/* Turno */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.or,marginBottom:10,fontWeight:600}}>Horario de entrega</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:C.warmMid}}>
          {[{k:"am",t:"Turno Mañana",h:"8:00–12:00 h"},{k:"pm",t:"Turno Tarde",h:"16:00–20:00 h"}].map(s=>(
            <button key={s.k} onClick={()=>onSetTurno(s.k)} style={{
              padding:"16px",background:turno===s.k?C.noir:C.bg,border:"none",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,
                color:turno===s.k?C.orLight:C.text,marginBottom:3,fontWeight:500}}>{s.t}</div>
              <div style={{fontSize:13,color:turno===s.k?"rgba(255,255,255,.5)":C.textMid,fontWeight:400}}>{s.h}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Items seleccionados */}
      {items.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.or,marginBottom:10,fontWeight:600}}>Productos</div>
          {items.map(i=>(
            <div key={i.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"10px 0",borderBottom:`1px solid ${C.warm}`}}>
              <span style={{fontSize:15,fontWeight:500,color:C.text}}>
                {i.product.emoji} {i.product.name}{i.weight?` · ${PESOS[i.weight]}`:""}
              </span>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:14,color:C.textMid,fontWeight:500,minWidth:64,textAlign:"right"}}>{fmt(i.price*i.qty)}</span>
                <QC qty={i.qty} onMinus={()=>onUpdateItem(i.key,-1)} onPlus={()=>onUpdateItem(i.key,+1)}/>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,
            fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:500}}>
            <span style={{color:C.text}}>Total del día</span>
            <span style={{color:C.rouge}}>{fmt(total)}</span>
          </div>
        </div>
      )}
      <button onClick={()=>setMostrar(v=>!v)} style={{
        width:"100%",background:"transparent",border:`1.5px solid ${C.noir}`,
        padding:"12px 0",cursor:"pointer",fontSize:13,fontWeight:600,
        letterSpacing:2,textTransform:"uppercase",color:C.text}}>
        {mostrar?`Ocultar productos ▲`:`+ Agregar productos${items.length?` (${items.length} seleccionado${items.length>1?"s":""})`:"" }`}
      </button>
      {mostrar&&(
        <div style={{marginTop:16}}>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {["Todos","Pan","Empanadas"].map(c=>(
              <button key={c} onClick={()=>setFiltro(c)} style={{
                padding:"6px 16px",border:`1.5px solid ${filtro===c?C.noir:C.warmMid}`,
                background:filtro===c?C.noir:"transparent",
                color:filtro===c?C.creme:C.textMid,
                fontSize:12,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",fontWeight:500}}>
                {c}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",border:`1px solid ${C.warmMid}`,overflow:"hidden"}}>
            {products.filter(p=>filtro==="Todos"||p.category===filtro).map(p=>(
              <MiniCard key={p.id} product={p} nivel={nivel} products={products} onAdd={onAddItem}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MINI CARD ────────────────────────────────────────────────────────────────
function MiniCard({product,nivel,products,onAdd}){
  const [selW,setSelW]=useState(product.weights?.[0]||null);
  const precio=calcPrecio(product,selW,nivel,products);
  const normal=calcPrecio(product,selW,"base",products);
  return(
    <div style={{background:"#fff",display:"flex",alignItems:"center",gap:0,borderBottom:`1px solid ${C.warm}`}}>
      {/* Foto */}
      <div style={{width:90,height:90,flexShrink:0,overflow:"hidden",background:C.noir}}>
        <img src={FOTOS[product.id]||FOTOS.corriente} alt={product.name}
          referrerPolicy="no-referrer"
          style={{width:"100%",height:"100%",objectFit:"cover"}}
          onError={e=>{e.target.style.display="none";}}/>
      </div>
      {/* Info */}
      <div style={{flex:1,padding:"12px 14px"}}>
        <div style={{fontWeight:600,fontSize:14,color:C.text,marginBottom:3}}>{product.name}</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:C.rouge,fontWeight:500,marginBottom:6}}>
          {fmt(precio)}
          {precio<normal&&<span style={{fontSize:12,color:C.textLight,textDecoration:"line-through",marginLeft:6,fontWeight:400}}>{fmt(normal)}</span>}
        </div>
        {product.weights&&(
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {product.weights.map(w=>(
              <button key={w} onClick={()=>setSelW(w)} style={{
                padding:"3px 9px",border:`1.5px solid ${selW===w?C.noir:C.warmMid}`,
                background:selW===w?C.noir:"transparent",
                color:selW===w?C.creme:C.textMid,fontSize:11,cursor:"pointer",fontWeight:500}}>
                {PESOS[w]}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Botón */}
      <button onClick={()=>onAdd(product,selW)} style={{
        background:C.noir,color:C.creme,border:"none",padding:"12px 16px",
        fontSize:11,cursor:"pointer",letterSpacing:1.5,textTransform:"uppercase",
        fontWeight:700,whiteSpace:"nowrap",height:"100%",alignSelf:"stretch",
        display:"flex",alignItems:"center"}}>
        + Añadir
      </button>
    </div>
  );
}

// ─── MI CUENTA ────────────────────────────────────────────────────────────────
function MiCuenta({user,nivel}){
  const [tab,setTab]=useState("resumen");
  const nv=NIVELES.find(n=>n.id===nivel)||NIVELES[0];
  const nividx=NIVELES.findIndex(n=>n.id===nivel);
  const siguiente=NIVELES[nividx+1];
  const cuenta={...DEMO_CUENTA,...user};
  const refActivos=cuenta.referidos?.filter(r=>r.activo&&r.meses>=3&&r.promedio>=50000).length||0;
  const promedio3=cuenta.promedioUlt3||0;
  const cumpleMin=promedio3>=50000;
  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"36px 20px 80px"}}>
      {/* Header */}
      <div style={{background:C.noir,padding:"28px 32px",marginBottom:24,display:"flex",
        justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div>
          <div style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Mi cuenta</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:C.creme,fontWeight:500}}>{cuenta.name}</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.55)",marginTop:4,fontWeight:400}}>
            {cuenta.edificioNombre||"Edificio"} · Depto {cuenta.apt}
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:2,fontWeight:400}}>
            {cuenta.email} · {cuenta.phone}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{background:nv.bg,padding:"8px 16px",display:"inline-block",marginBottom:6}}>
            <span style={{fontSize:18}}>{nv.icon}</span>
            <span style={{fontSize:14,fontWeight:700,color:nv.color,marginLeft:8}}>{nv.nombre}</span>
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:400}}>
            Miembro desde {new Date(cuenta.miembroDesde).toLocaleDateString("es-CL",{month:"long",year:"numeric"})}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1.5px solid ${C.warmMid}`,marginBottom:28,flexWrap:"wrap"}}>
        {[["resumen","Resumen"],["pendientes","Pedidos activos"],["historial","Historial"],["fidelizacion","Fidelización"],["referidos","Referidos"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"11px 20px",border:"none",background:"transparent",
            fontSize:13,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",
            color:tab===k?C.text:C.textLight,fontWeight:tab===k?700:400,
            borderBottom:tab===k?`2px solid ${C.noir}`:"2px solid transparent"}}>
            {l}
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      {tab==="resumen"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:C.warmMid,marginBottom:24}}>
            {[{l:"Meses activo",v:`${cuenta.mesesActivo} meses`},{l:"Promedio 3 meses",v:fmt(promedio3)},{l:"Referidos válidos",v:`${refActivos} personas`}].map(k=>(
              <div key={k.l} style={{background:C.bg,padding:"22px 18px"}}>
                <div style={{fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:C.textLight,marginBottom:6,fontWeight:600}}>{k.l}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:C.rouge,fontWeight:500}}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.or,marginBottom:12,fontWeight:600}}>
              Tu código de referido
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div style={{fontFamily:"monospace",fontSize:22,fontWeight:700,color:C.text,
                background:C.warm,padding:"12px 22px",border:`1.5px solid ${C.warmMid}`,letterSpacing:2}}>
                {cuenta.codigoReferido}
              </div>
              <button onClick={()=>navigator.clipboard.writeText(cuenta.codigoReferido).then(()=>alert("¡Código copiado!"))} style={{
                background:C.noir,color:C.creme,border:"none",padding:"12px 22px",
                fontSize:12,cursor:"pointer",fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"}}>
                Copiar
              </button>
            </div>
            <p style={{fontSize:13,color:C.textMid,marginTop:12,lineHeight:1.7,fontWeight:400}}>
              Comparte este código con vecinos y amigos. Cuando se registren con él y mantengan suscripción activa 3 meses con promedio de {fmt(50000)}/mes, cuenta como referido válido.
            </p>
          </div>
        </div>
      )}

      {/* PEDIDOS ACTIVOS */}
      {tab==="pendientes"&&(
        <div>
          <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.textLight,marginBottom:16,fontWeight:600}}>
            Pedidos pagados · Pendientes de entrega
          </div>
          {(cuenta.pedidosPendientes||[]).length===0
            ?<Empty label="Sin pedidos activos" sub="Agenda nuevos pedidos desde Mi agenda"/>
            :(cuenta.pedidosPendientes||[]).map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"14px 0",borderBottom:`1px solid ${C.warm}`}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:4}}>
                    {new Date(h.fecha).toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"})}
                    <span style={{marginLeft:10,fontSize:12,
                      color:h.turno==="am"?"#7A3A00":"#2A2A8A",
                      background:h.turno==="am"?"#FFF0DC":"#EEEEFF",
                      padding:"3px 10px",fontWeight:600}}>
                      {h.turno==="am"?"AM":"PM"}
                    </span>
                  </div>
                  <div style={{fontSize:14,fontWeight:400,color:C.textMid}}>{h.productos}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.rouge,fontWeight:500}}>{fmt(h.total)}</div>
                  <div style={{fontSize:12,background:"#EFF6EE",color:"#2D5A27",padding:"3px 10px",marginTop:4,fontWeight:600,display:"inline-block"}}>
                    Pagado · En camino
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* HISTORIAL */}
      {tab==="historial"&&(
        <div>
          {(cuenta.historial||[]).length===0
            ?<Empty label="Sin historial aún"/>
            :(cuenta.historial||[]).map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"14px 0",borderBottom:`1px solid ${C.warm}`}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:4}}>
                    {new Date(h.fecha).toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"})}
                    <span style={{marginLeft:10,fontSize:12,
                      color:h.turno==="am"?"#7A3A00":"#2A2A8A",
                      background:h.turno==="am"?"#FFF0DC":"#EEEEFF",
                      padding:"3px 10px",fontWeight:600}}>
                      {h.turno==="am"?"AM":"PM"}
                    </span>
                  </div>
                  <div style={{fontSize:14,fontWeight:400,color:C.textMid}}>{h.productos}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.rouge,fontWeight:500}}>{fmt(h.total)}</div>
                  <div style={{fontSize:11,color:C.textLight,marginTop:4,fontWeight:400}}>{h.estado}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* FIDELIZACIÓN */}
      {tab==="fidelizacion"&&(
        <div>
          <div style={{background:nv.bg,border:`1.5px solid ${nv.color}`,padding:22,marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
              <span style={{fontSize:28}}>{nv.icon}</span>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:500,color:nv.color}}>{nv.nombre}</div>
            </div>
            <div style={{fontSize:15,color:C.textMid,marginBottom:6,fontWeight:500}}>{nv.desc}</div>
            <div style={{fontSize:13,color:C.textLight,fontWeight:400}}>{nv.req}</div>
          </div>
          {siguiente&&(
            <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:22,marginBottom:20}}>
              <div style={{fontSize:12,letterSpacing:2,textTransform:"uppercase",color:C.textMid,marginBottom:16,fontWeight:700}}>
                Próximo nivel: {siguiente.icon} {siguiente.nombre}
              </div>
              {[
                {l:"Promedio últimos 3 meses",v:promedio3,max:50000,ok:cumpleMin,vf:fmt(promedio3)+"/"+fmt(50000)},
                siguiente.id!=="referidos"&&{l:"Antigüedad",v:cuenta.mesesActivo,max:siguiente.id==="gold"?6:12,ok:cuenta.mesesActivo>=(siguiente.id==="gold"?6:12),vf:`${cuenta.mesesActivo}/${siguiente.id==="gold"?6:12} meses`},
                siguiente.id==="referidos"&&{l:"Referidos válidos",v:refActivos,max:30,ok:refActivos>=30,vf:`${refActivos}/30`},
              ].filter(Boolean).map((bar,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,fontWeight:500}}>
                    <span style={{color:C.textMid}}>{bar.l}</span>
                    <span style={{color:bar.ok?C.sage:C.rouge,fontWeight:700}}>{bar.vf} {bar.ok?"✓":"✗"}</span>
                  </div>
                  <div style={{background:C.warm,height:8,overflow:"hidden"}}>
                    <div style={{background:bar.ok?C.sage:C.or,height:"100%",
                      width:`${Math.min(100,bar.v/bar.max*100)}%`,transition:"width .4s"}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.textLight,marginBottom:14,fontWeight:600}}>
            Todos los niveles
          </div>
          {NIVELES.map((n,i)=>(
            <div key={n.id} style={{
              background:n.id===nivel?n.bg:C.bg,border:`1.5px solid ${n.id===nivel?n.color:C.warmMid}`,
              padding:"16px 20px",marginBottom:8,opacity:i>nividx+1?.55:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                <span style={{fontSize:20}}>{n.icon}</span>
                <span style={{fontWeight:700,fontSize:15,color:n.id===nivel?n.color:C.text}}>{n.nombre}</span>
                {n.id===nivel&&<span style={{fontSize:11,background:n.color,color:"#fff",padding:"2px 10px",fontWeight:700}}>Tu nivel actual</span>}
              </div>
              <div style={{fontSize:14,color:C.textMid,marginBottom:4,fontWeight:500}}>{n.desc}</div>
              <div style={{fontSize:13,color:C.textLight,fontWeight:400}}>{n.req}</div>
            </div>
          ))}
        </div>
      )}

      {/* REFERIDOS */}
      {tab==="referidos"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:C.warmMid,marginBottom:20}}>
            <div style={{background:C.bg,padding:"20px 18px"}}>
              <div style={{fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:C.textLight,marginBottom:4,fontWeight:600}}>Total referidos</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,color:C.rouge,fontWeight:500}}>{cuenta.referidos?.length||0}</div>
            </div>
            <div style={{background:C.bg,padding:"20px 18px"}}>
              <div style={{fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:C.textLight,marginBottom:4,fontWeight:600}}>Referidos válidos</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,color:C.sage,fontWeight:500}}>{refActivos} / 30</div>
            </div>
          </div>
          <div style={{background:"#F0F5EF",border:"1px solid #8AAA88",padding:"14px 18px",marginBottom:16,
            fontSize:13,color:"#2A4A2A",lineHeight:1.8,fontWeight:400}}>
            Un referido cuenta como válido cuando: ✓ está activo · ✓ lleva 3+ meses suscrito · ✓ promedio {fmt(50000)}/mes últimos 3 meses
          </div>
          {(cuenta.referidos||[]).map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"14px 0",borderBottom:`1px solid ${C.warm}`}}>
              <div>
                <div style={{fontWeight:600,fontSize:15,color:C.text}}>{r.nombre}</div>
                <div style={{fontSize:13,color:C.textMid,marginTop:2,fontWeight:400}}>
                  {r.meses} mes{r.meses>1?"es":""} · Promedio {fmt(r.promedio)}/mes
                </div>
              </div>
              <span style={{
                background:r.activo&&r.meses>=3&&r.promedio>=50000?"#EDF5ED":"#F5F0EA",
                color:r.activo&&r.meses>=3&&r.promedio>=50000?"#2A5A2A":C.textMid,
                padding:"5px 12px",fontSize:12,fontWeight:700}}>
                {r.activo&&r.meses>=3&&r.promedio>=50000?"✓ Válido":!r.activo?"Inactivo":r.meses<3?`${r.meses}/3 meses`:"Bajo promedio"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({onStart,onLogin,onCatalog}){
  return(
    <div>
      <div style={{minHeight:"92vh",display:"flex",flexDirection:"column",
        justifyContent:"center",alignItems:"flex-start",padding:"80px 80px",
        position:"relative",overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&w=1600&q=85"
          referrerPolicy="no-referrer"
          alt="Pan artesanal"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,6,2,.55)",zIndex:1}}/>
        <div style={{position:"relative",zIndex:2,maxWidth:600,textAlign:"left"}}>
          <p style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:C.or,marginBottom:22,fontWeight:600}}>
            Artisan · Quotidien · Maison
          </p>
          <h1 style={{fontFamily:"'IM Fell English',serif",fontSize:"clamp(64px,10vw,104px)",
            color:C.creme,lineHeight:.9,marginBottom:8,letterSpacing:-2}}>
            Pan<span style={{color:C.or}}>Go</span>
          </h1>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.orLight,
            fontStyle:"italic",marginBottom:44,fontWeight:400}}>Boulangerie artisanale</p>
          <p style={{color:"rgba(255,255,255,.55)",fontSize:16,lineHeight:1.9,
            maxWidth:440,margin:"0 auto 44px",fontWeight:400}}>
            Pan artesanal programado día a día, con horario y productos distintos cada vez. Entrega directa en conserjería.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button style={{...btnP(),width:"auto",padding:"16px 52px",fontSize:13,letterSpacing:2}} onClick={onStart}>
              Crear mi cuenta
            </button>
            <button onClick={onCatalog} style={{
              background:"transparent",color:"rgba(255,255,255,.7)",
              border:"1px solid rgba(255,255,255,.35)",padding:"16px 32px",
              cursor:"pointer",fontSize:13,fontWeight:500,letterSpacing:2,textTransform:"uppercase"}}>
              Ver productos
            </button>
          </div>
          <button onClick={onLogin} style={{
            background:"transparent",border:"none",color:"rgba(255,255,255,.4)",
            marginTop:16,cursor:"pointer",fontSize:13,fontWeight:400}}>
            Ya tengo cuenta →
          </button>
        </div>
      </div>
      <div style={{background:C.bg,padding:"64px 24px"}}>
        <p style={{textAlign:"center",fontFamily:"'IM Fell English',serif",fontSize:11,
          letterSpacing:5,color:C.or,textTransform:"uppercase",marginBottom:48,fontWeight:400}}>
          Así funciona
        </p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
          gap:1,maxWidth:900,margin:"0 auto",background:C.warmMid}}>
          {[
            {n:"01",t:"Arma tu semana",d:"Elige qué días quieres recibir y qué productos para cada día. Pan distinto cada mañana."},
            {n:"02",t:"Elige el horario",d:"Turno mañana (8–12 h) o tarde (16–20 h) por cada día, completamente independiente."},
            {n:"03",t:"Paga una sola vez",d:"Un cobro por todos los días que programaste. Mercado Pago, transferencia o tarjeta."},
            {n:"04",t:"Recibe y disfruta",d:"Te avisamos por WhatsApp cuando llega a conserjería. Sin esperas en la puerta."},
          ].map(f=>(
            <div key={f.n} style={{background:C.bg,padding:"36px 28px"}}>
              <div style={{fontFamily:"'IM Fell English',serif",fontSize:14,color:C.or,marginBottom:14,letterSpacing:2,fontWeight:400}}>{f.n}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:500,marginBottom:10,color:C.text}}>{f.t}</h3>
              <p style={{fontSize:14,color:C.textMid,lineHeight:1.8,fontWeight:400}}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.noir,padding:"52px 24px",textAlign:"center"}}>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontStyle:"italic",
          color:C.orLight,marginBottom:26,fontWeight:400}}>"Le pain, c'est la vie."</p>
        <button style={{...btnP(),width:"auto",padding:"14px 48px"}} onClick={onStart}>Comenzar ahora</button>
        <p style={{fontSize:11,color:"rgba(255,255,255,.18)",marginTop:22,letterSpacing:2,fontWeight:400}}>NCM Group · ncm.cl</p>
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminPanel({tab,setTab,day,setDay,data,orders,products,editingProd,setEditingProd,onDeliver,onPriceUpdate,onSendWA,onLogout}){
  return(
    <div style={{maxWidth:980,margin:"0 auto",padding:"44px 20px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}>
        <div>
          <p style={{fontSize:10,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Panel de gestión</p>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:500,color:C.text}}>Administración</h2>
        </div>
        <button onClick={onLogout} style={{background:"transparent",border:`1px solid ${C.warmMid}`,
          padding:"9px 18px",fontSize:13,cursor:"pointer",color:C.textMid,fontWeight:500,letterSpacing:1,textTransform:"uppercase"}}>
          Cerrar sesión
        </button>
      </div>
      <div style={{display:"flex",borderBottom:`1.5px solid ${C.warmMid}`,marginBottom:36}}>
        {[["resumen","Producción"],["productos","Precios"],["pedidos","Pedidos"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"11px 24px",border:"none",background:"transparent",
            fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",
            color:tab===k?C.text:C.textLight,fontWeight:tab===k?700:400,
            borderBottom:tab===k?`2px solid ${C.noir}`:"2px solid transparent"}}>
            {l}
          </button>
        ))}
      </div>
      {tab==="resumen"&&(
        <div>
          <div style={{display:"flex",gap:6,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
            {DIAS.map(d=>(
              <button key={d} onClick={()=>setDay(d)} style={{
                padding:"7px 14px",border:`1.5px solid ${day===d?C.noir:C.warmMid}`,
                background:day===d?C.noir:"transparent",color:day===d?C.creme:C.textMid,
                fontSize:11,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontWeight:500}}>
                {d}
              </button>
            ))}
            <button onClick={onSendWA} style={{marginLeft:"auto",background:C.sage,color:"#fff",
              border:"none",padding:"8px 16px",fontSize:11,cursor:"pointer",fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>
              Enviar WA
            </button>
          </div>
          {data?<>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:C.warmMid,marginBottom:28}}>
              {[{l:"Pedidos",v:data.totalOrders},{l:"AM",v:data.amOrders},{l:"PM",v:data.pmOrders},{l:"Ingresos",v:fmt(data.totalRevenue)}].map(k=>(
                <div key={k.l} style={{background:C.noir,padding:"22px 18px"}}>
                  <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,.4)",textTransform:"uppercase",marginBottom:6,fontWeight:600}}>{k.l}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,color:C.or,fontWeight:500}}>{k.v}</div>
                </div>
              ))}
            </div>
            {(data.productionList||[]).map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"14px 0",borderBottom:`1px solid ${C.warm}`}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:26}}>{r.emoji}</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:15,color:C.text}}>{r.product_name}</div>
                    {r.weight&&<div style={{fontSize:13,color:C.textLight,fontWeight:400}}>{PESOS[r.weight]}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:24,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:C.rouge,fontWeight:500}}>{r.total_qty}</div>
                    <div style={{fontSize:12,color:C.textLight,fontWeight:400}}>unidades</div>
                  </div>
                  <div style={{textAlign:"right",minWidth:90}}>
                    <div style={{fontWeight:600,fontSize:15,color:C.text}}>{fmt(r.total_revenue)}</div>
                    <div style={{fontSize:12,color:C.textLight,fontWeight:400}}>ingresos</div>
                  </div>
                </div>
              </div>
            ))}
          </>:<div style={{textAlign:"center",padding:"48px 0",color:C.textLight,fontSize:15,fontWeight:400}}>
            Conecta el backend para ver datos reales
          </div>}
        </div>
      )}
      {tab==="productos"&&(
        <div>
          {products.map(p=>(
            <div key={p.id}>
              {editingProd===p.id
                ?<PriceEd product={p} onSave={(b,e)=>onPriceUpdate(p.id,b,e)} onCancel={()=>setEditingProd(null)}/>
                :<div onClick={()=>setEditingProd(p.id)} style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",padding:"16px 0",borderBottom:`1px solid ${C.warm}`,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <span style={{fontSize:26}}>{p.emoji}</span>
                      <div>
                        <div style={{fontWeight:600,fontSize:15,color:C.text}}>{p.name}</div>
                        <div style={{fontSize:13,color:C.textLight,fontWeight:400}}>{p.category}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.rouge,fontWeight:500}}>{fmt(p.base_price||p.basePrice)}</div>
                      {(p.price_per_extra500||p.pricePerExtra500)&&<div style={{fontSize:13,color:C.textLight,fontWeight:400}}>+{fmt(p.price_per_extra500||p.pricePerExtra500)}/500g</div>}
                      <div style={{fontSize:12,color:C.textMid,marginTop:2,fontWeight:500}}>Editar →</div>
                    </div>
                  </div>
              }
            </div>
          ))}
        </div>
      )}
      {tab==="pedidos"&&(
        <div>
          {orders.length===0
            ?<Empty label="Sin pedidos activos" sub="Conecta el backend"/>
            :orders.map(o=>{
              const u=o.users||{};
              return(
                <div key={o.id} style={{padding:"20px 0",borderBottom:`1px solid ${C.warm}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:16,color:C.text,marginBottom:2}}>{u.name}</div>
                      <div style={{fontSize:14,color:C.textMid,fontWeight:400}}>{u.buildings?.name} · Depto {u.apt}</div>
                    </div>
                    <span style={{background:C.warm,color:C.textMid,padding:"4px 12px",fontSize:12,fontWeight:600}}>
                      {o.shift==="am"?"AM":"PM"}
                    </span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {(o.order_items||[]).map((it,i)=>(
                        <span key={i} style={{background:C.warm,border:`1px solid ${C.warmMid}`,
                          padding:"4px 12px",fontSize:13,fontWeight:500,color:C.text}}>
                          {it.products?.emoji} {it.qty}× {it.products?.name}
                        </span>
                      ))}
                    </div>
                    {o.status==="paid"&&<button onClick={()=>onDeliver(o.id)} style={{
                      background:C.sage,color:"#fff",border:"none",padding:"9px 20px",
                      fontSize:12,cursor:"pointer",fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>
                      Entregar + WA
                    </button>}
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}

function PriceEd({product,onSave,onCancel}){
  const [base,setBase]=useState(product.base_price||product.basePrice||0);
  const [extra,setExtra]=useState(product.price_per_extra500||product.pricePerExtra500||"");
  return(
    <div style={{background:C.bg,border:`1.5px solid ${C.or}`,padding:22,margin:"8px 0"}}>
      <div style={{fontWeight:700,marginBottom:14,fontSize:15,color:C.text}}>{product.emoji} {product.name}</div>
      <div style={{display:"grid",gridTemplateColumns:(product.price_per_extra500||product.pricePerExtra500)!=null?"1fr 1fr":"1fr",gap:14,marginBottom:16}}>
        <FL label="Precio base"><input style={inp} type="number" value={base} onChange={e=>setBase(Number(e.target.value))}/></FL>
        {(product.price_per_extra500||product.pricePerExtra500)!=null&&<FL label="+500g"><input style={inp} type="number" value={extra} onChange={e=>setExtra(Number(e.target.value))}/></FL>}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={{...btnP(),width:"auto",padding:"10px 24px"}} onClick={()=>onSave(base,extra||null)}>Guardar</button>
        <button style={{background:"transparent",border:`1px solid ${C.warmMid}`,padding:"10px 18px",
          cursor:"pointer",fontSize:12,letterSpacing:1,textTransform:"uppercase",color:C.textMid,fontWeight:500}} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── MIS COMBOS / SUSCRIPCIONES ───────────────────────────────────────────────
function MisCombos({combos,setCombos,products,nivel,agenda,setAgenda,fechas,showToast,onIrAgenda}){
  const [modo,setModo]=useState("lista"); // lista | crear | editar
  const [editIdx,setEditIdx]=useState(null);
  const [nombre,setNombre]=useState("");
  const [items,setItems]=useState([]);
  const [freq,setFreq]=useState("weekly");
  const [turno,setTurno]=useState("am");
  const [filtro,setFiltro]=useState("Todos");
  const [selW,setSelW]=useState({});

  function nuevoCombo(){setNombre("");setItems([]);setFreq("weekly");setTurno("am");setFiltro("Todos");setModo("crear");}
  function editarCombo(i){const c=combos[i];setNombre(c.nombre);setItems([...c.items]);setFreq(c.freq);setTurno(c.turno);setFiltro("Todos");setEditIdx(i);setModo("editar");}
  function guardar(){
    if(!nombre.trim())return showToast("Ponle un nombre al combo");
    if(!items.length)return showToast("Agrega al menos un producto");
    const combo={nombre:nombre.trim(),items,freq,turno,activo:true,creadoEl:new Date().toISOString()};
    if(modo==="editar"&&editIdx!=null)setCombos(cs=>cs.map((c,i)=>i===editIdx?combo:c));
    else setCombos(cs=>[...cs,combo]);
    setModo("lista");showToast("Combo guardado ✓");
  }
  function eliminar(i){setCombos(cs=>cs.filter((_,j)=>j!==i));showToast("Combo eliminado");}
  function pausar(i){setCombos(cs=>cs.map((c,j)=>j===i?{...c,activo:!c.activo}:c));}

  function aplicarCombo(combo){
    // Aplica el combo a los próximos días disponibles según frecuencia
    const diasDisp=fechas.filter(f=>{
      if(combo.freq==="weekly") return f.semana===1;
      if(combo.freq==="biweekly") return f.semana===1||f.semana===3;
      if(combo.freq==="monthly") return f.semana===1&&f.diaNombre==="Lun";
      return f.semana===1&&f.diaNombre==="Lun"; // once
    });
    const diasAAplicar=combo.freq==="once"?[diasDisp[0]]:diasDisp;
    let aplicados=0;
    diasAAplicar.forEach(fd=>{
      if(!fd)return;
      setAgenda(a=>({...a,[fd.fecha]:{turno:combo.turno,items:combo.items.map(i=>({...i,key:`${i.product.id}_${i.weight||"u"}_${Date.now()}`}))}}));
      aplicados++;
    });
    showToast(`Combo aplicado a ${aplicados} día${aplicados>1?"s":""} ✓`);
    onIrAgenda();
  }

  function addItemCombo(product,weight){
    const key=`${product.id}_${weight||"u"}`;
    const price=calcPrecio(product,weight,nivel,products);
    setItems(prev=>{
      const ex=prev.find(i=>i.product.id===product.id&&i.weight===weight);
      if(ex)return prev.map(i=>i.product.id===product.id&&i.weight===weight?{...i,qty:i.qty+1}:i);
      return [...prev,{key,product,weight,qty:1,price}];
    });
  }
  function updItemCombo(key,d){setItems(prev=>prev.map(i=>i.key===key?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));}

  const FREQ_LABELS={once:"Una vez",weekly:"Semanal",biweekly:"Quincenal",monthly:"Mensual"};
  const pList=filtro==="Todos"?products:products.filter(p=>p.category===filtro);

  if(modo==="lista") return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"36px 20px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:14}}>
        <div>
          <p style={{fontSize:11,letterSpacing:4,color:C.or,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Mis combos</p>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:500,color:C.text}}>Pedidos recurrentes</h2>
          <p style={{fontSize:14,color:C.textMid,marginTop:6,fontWeight:400}}>Arma tu combo una vez y aplícalo cuando quieras — sin tener que agregar producto por producto.</p>
        </div>
        <button onClick={nuevoCombo} style={{background:C.noir,color:C.creme,border:"none",padding:"12px 24px",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>
          + Nuevo combo
        </button>
      </div>

      {combos.length===0?(
        <div style={{textAlign:"center",padding:"64px 20px",border:`1.5px dashed ${C.warmMid}`,background:C.bg}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,color:C.warmMid,marginBottom:14}}>🥐</div>
          <div style={{fontWeight:600,fontSize:16,color:C.textMid,marginBottom:8}}>Aún no tienes combos guardados</div>
          <div style={{fontSize:14,color:C.textLight,marginBottom:24,lineHeight:1.7}}>
            Crea un combo con tus productos favoritos y aplícalo<br/>con un clic para no repetir la misma selección cada vez.
          </div>
          <button onClick={nuevoCombo} style={{background:C.noir,color:C.creme,border:"none",padding:"13px 36px",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>
            Crear mi primer combo
          </button>
        </div>
      ):(
        <div style={{display:"grid",gap:1,background:C.warmMid}}>
          {combos.map((c,i)=>{
            const total=c.items.reduce((s,it)=>s+it.price*it.qty,0);
            return(
              <div key={i} style={{background:c.activo?C.bg:"#f5f0ea",padding:"20px 22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:500,color:C.text,marginBottom:4}}>{c.nombre}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,background:C.warm,color:C.textMid,padding:"3px 10px",fontWeight:600,letterSpacing:1}}>{FREQ_LABELS[c.freq]||c.freq}</span>
                      <span style={{fontSize:11,background:c.turno==="am"?"#FFF0DC":"#EEEEFF",color:c.turno==="am"?"#7A3A00":"#2A2A8A",padding:"3px 10px",fontWeight:600}}>{c.turno==="am"?"☀ AM":"🌆 PM"}</span>
                      {!c.activo&&<span style={{fontSize:11,background:"#fee",color:"#c33",padding:"3px 10px",fontWeight:600}}>Pausado</span>}
                    </div>
                  </div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.rouge,fontWeight:500}}>{fmt(total)}</div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                  {c.items.map((it,j)=>(
                    <span key={j} style={{fontSize:13,background:"#fff",border:`1px solid ${C.warmMid}`,padding:"4px 12px",color:C.text,fontWeight:500}}>
                      {it.product.emoji} {it.qty}× {it.product.name}{it.weight?` ${PESOS[it.weight]}`:""}
                    </span>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button onClick={()=>aplicarCombo(c)} style={{background:C.noir,color:C.creme,border:"none",padding:"9px 20px",fontSize:12,cursor:"pointer",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>
                    ▶ Aplicar ahora
                  </button>
                  <button onClick={()=>editarCombo(i)} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"9px 16px",fontSize:12,cursor:"pointer",fontWeight:500,letterSpacing:1}}>
                    Editar
                  </button>
                  <button onClick={()=>pausar(i)} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"9px 16px",fontSize:12,cursor:"pointer",fontWeight:500}}>
                    {c.activo?"Pausar":"Reactivar"}
                  </button>
                  <button onClick={()=>eliminar(i)} style={{background:"transparent",border:"1px solid #fcc",color:"#c33",padding:"9px 14px",fontSize:12,cursor:"pointer",fontWeight:500}}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── CREAR / EDITAR ────────────────────────────────────────────────────────────
  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"36px 20px 100px"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28}}>
        <button onClick={()=>setModo("lista")} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"7px 14px",fontSize:12,cursor:"pointer",fontWeight:500}}>
          ← Volver
        </button>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:500,color:C.text}}>
          {modo==="editar"?"Editar combo":"Nuevo combo"}
        </h2>
      </div>

      {/* Nombre */}
      <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:"20px 22px",marginBottom:14}}>
        <label style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.or,display:"block",marginBottom:8,fontWeight:600}}>Nombre del combo</label>
        <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder='Ej: "Desayuno de lunes", "Pan de la semana"'
          style={{width:"100%",padding:"12px 14px",border:`1.5px solid ${C.warmMid}`,background:"#fff",fontSize:15,color:C.text,outline:"none"}}/>
      </div>

      {/* Turno y frecuencia */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:C.warmMid,marginBottom:14}}>
        <div style={{background:C.bg,padding:"16px 18px"}}>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.or,marginBottom:10,fontWeight:600}}>Horario</div>
          <div style={{display:"flex",gap:6}}>
            {[{k:"am",l:"☀ AM"},{k:"pm",l:"🌆 PM"}].map(t=>(
              <button key={t.k} onClick={()=>setTurno(t.k)} style={{flex:1,padding:"10px 0",border:`1.5px solid ${turno===t.k?C.noir:C.warmMid}`,background:turno===t.k?C.noir:"transparent",color:turno===t.k?C.creme:C.textMid,fontSize:12,cursor:"pointer",fontWeight:600}}>{t.l}</button>
            ))}
          </div>
        </div>
        <div style={{background:C.bg,padding:"16px 18px"}}>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.or,marginBottom:10,fontWeight:600}}>Frecuencia al aplicar</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {[{k:"once",l:"Una vez"},{k:"weekly",l:"Semanal"},{k:"biweekly",l:"Quincenal"},{k:"monthly",l:"Mensual"}].map(f=>(
              <button key={f.k} onClick={()=>setFreq(f.k)} style={{padding:"6px 10px",border:`1.5px solid ${freq===f.k?C.noir:C.warmMid}`,background:freq===f.k?C.noir:"transparent",color:freq===f.k?C.creme:C.textMid,fontSize:11,cursor:"pointer",fontWeight:500}}>{f.l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Productos seleccionados */}
      {items.length>0&&(
        <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:"18px 20px",marginBottom:14}}>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.or,marginBottom:10,fontWeight:600}}>Productos en este combo</div>
          {items.map(it=>(
            <div key={it.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.warm}`}}>
              <span style={{fontSize:14,fontWeight:500,color:C.text}}>{it.product.emoji} {it.product.name}{it.weight?` · ${PESOS[it.weight]}`:""}</span>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:13,color:C.textMid,minWidth:60,textAlign:"right"}}>{fmt(it.price*it.qty)}</span>
                <QC qty={it.qty} onMinus={()=>updItemCombo(it.key,-1)} onPlus={()=>updItemCombo(it.key,+1)}/>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:500}}>
            <span style={{color:C.text}}>Total combo</span>
            <span style={{color:C.rouge}}>{fmt(items.reduce((s,i)=>s+i.price*i.qty,0))}</span>
          </div>
        </div>
      )}

      {/* Agregar productos */}
      <div style={{background:C.bg,border:`1.5px solid ${C.warmMid}`,padding:"18px 20px",marginBottom:20}}>
        <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.or,marginBottom:12,fontWeight:600}}>Agregar productos</div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {["Todos","Pan","Empanadas"].map(c=>(
            <button key={c} onClick={()=>setFiltro(c)} style={{padding:"6px 14px",border:`1.5px solid ${filtro===c?C.noir:C.warmMid}`,background:filtro===c?C.noir:"transparent",color:filtro===c?C.creme:C.textMid,fontSize:11,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontWeight:500}}>{c}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:1,background:C.warmMid}}>
          {pList.map(p=>{
            const w=selW[p.id]||(p.weights?.[0]||null);
            const pr=calcPrecio(p,w,nivel,products);
            return(
              <div key={p.id} style={{background:"#fff",padding:"14px 14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:C.text}}>{p.emoji} {p.name}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:C.rouge,fontWeight:500}}>{fmt(pr)}</div>
                  </div>
                  <button onClick={()=>addItemCombo(p,w)} style={{background:C.noir,color:C.creme,border:"none",padding:"5px 11px",fontSize:10,cursor:"pointer",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,whiteSpace:"nowrap"}}>+ Añadir</button>
                </div>
                {p.weights&&(
                  <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                    {p.weights.map(ww=>(
                      <button key={ww} onClick={()=>setSelW(s=>({...s,[p.id]:ww}))} style={{padding:"3px 8px",border:`1.5px solid ${w===ww?C.noir:C.warmMid}`,background:w===ww?C.noir:"transparent",color:w===ww?C.creme:C.textMid,fontSize:10,cursor:"pointer",fontWeight:500}}>{PESOS[ww]}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:"flex",gap:10}}>
        <button onClick={guardar} style={{background:C.noir,color:C.creme,border:"none",padding:"13px 0",flex:1,fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>
          Guardar combo
        </button>
        <button onClick={()=>setModo("lista")} style={{background:"transparent",border:`1px solid ${C.warmMid}`,color:C.textMid,padding:"13px 22px",fontSize:12,cursor:"pointer",fontWeight:500,letterSpacing:1,textTransform:"uppercase"}}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── ÁTOMOS ───────────────────────────────────────────────────────────────────
function Wrap({children}){return<div style={{maxWidth:720,margin:"0 auto",padding:"52px 20px 80px"}}>{children}</div>;}
function PT({title,sub}){return(
  <div style={{textAlign:"center",marginBottom:36}}>
    <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:500,color:C.text,marginBottom:8}}>{title}</h2>
    {sub&&<p style={{fontSize:14,color:C.textLight,letterSpacing:1,fontWeight:400}}>{sub}</p>}
  </div>
);}
function FL({label,children}){return(
  <div>
    <label style={{display:"block",fontSize:12,letterSpacing:2,textTransform:"uppercase",
      color:C.textMid,marginBottom:8,marginTop:16,fontWeight:600}}>{label}</label>
    {children}
  </div>
);}
function QC({qty,onMinus,onPlus}){return(
  <div style={{display:"flex",alignItems:"center",gap:6}}>
    <button onClick={onMinus} style={{width:32,height:32,border:`1.5px solid ${C.warmMid}`,
      background:C.warm,cursor:"pointer",fontSize:18,color:C.text,fontWeight:500}}>−</button>
    <span style={{fontSize:15,minWidth:24,textAlign:"center",fontWeight:700,color:C.text}}>{qty}</span>
    <button onClick={onPlus} style={{width:32,height:32,border:`1.5px solid ${C.noir}`,
      background:C.noir,color:C.creme,cursor:"pointer",fontSize:18}}>+</button>
  </div>
);}
function NB({label,active,onClick}){return(
  <button onClick={onClick} style={{background:"transparent",
    color:active?"#fff":"rgba(255,255,255,.5)",border:"none",
    padding:"8px 14px",fontSize:12,letterSpacing:1.5,textTransform:"uppercase",
    cursor:"pointer",borderBottom:active?`1px solid ${C.or}`:"1px solid transparent",
    fontWeight:active?700:400}}>
    {label}
  </button>
);}
function Divider({label}){return(
  <div style={{display:"flex",alignItems:"center",gap:14,margin:"22px 0"}}>
    <div style={{flex:1,height:1,background:C.warmMid}}/>
    <span style={{fontSize:13,color:C.textLight,letterSpacing:1,fontWeight:400}}>{label}</span>
    <div style={{flex:1,height:1,background:C.warmMid}}/>
  </div>
);}
function Empty({label,sub}){return(
  <div style={{textAlign:"center",padding:"52px 20px",color:C.textLight}}>
    <div style={{fontFamily:"'IM Fell English',serif",fontSize:44,color:C.warmMid,marginBottom:14}}>—</div>
    <div style={{fontWeight:600,fontSize:16,color:C.textMid,marginBottom:6}}>{label}</div>
    {sub&&<div style={{fontSize:14,color:C.textLight,fontWeight:400}}>{sub}</div>}
  </div>
);}
