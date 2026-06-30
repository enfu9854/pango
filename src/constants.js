export const C = {
  noir:"#1A1208", creme:"#F7F2E8", or:"#C9A84C", orLight:"#E8D5A3",
  rouge:"#8B2E1A", sage:"#3D5A3D", warm:"#EDE4D3", warmMid:"#C8B89A",
  text:"#1A1208", textMid:"#4A3728", textLight:"#6B5545", bg:"#F7F2E8",
}

export const PESOS = {500:"500 gr",1000:"1 kg",1500:"1,5 kg",2000:"2 kg"}
export const DIAS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
export const DIAS_F= ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]

export const DEMO_PRODUCTS = [
  {id:"hallulla",   name:"Pan Hallulla",            emoji:"🫓", category:"Pan",       base_price:2990, price_per_extra500:1000, base_weight:1000, weights:[1000,1500,2000], description:"Amasado tradicional para el día a día.",             img:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=85"},
  {id:"frances",    name:"Pan Francés",             emoji:"🍞", category:"Pan",       base_price:2990, price_per_extra500:1000, base_weight:1000, weights:[1000,1500,2000], description:"La marraqueta chilena, también llamada pan francés: crujiente por fuera y blanda por dentro.", img:"https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=800&q=85"},
  {id:"ciabatta",   name:"Pan Ciabatta",            emoji:"🥖", category:"Pan",       base_price:3390, price_per_extra500:1200, base_weight:1000, weights:[1000,1500],      description:"Más rústico, para pedidos premium.",                  img:"https://images.unsplash.com/photo-1586444248879-bc8d43673ee3?w=800&q=85"},
  {id:"emp_pino_aji",  name:"Empanada Pino c/Ají",  emoji:"🌶️", category:"Empanadas", base_price:3390, description:"Carne jugosa con merkén artesanal.",               img:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=85"},
  {id:"emp_pino_saji", name:"Empanada Pino s/Ají",  emoji:"🥟", category:"Empanadas", base_price:3390, description:"El clásico relleno de carne molida, sin picante.", img:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=85"},
  {id:"emp_queso",     name:"Empanada de Queso",    emoji:"🧀", category:"Empanadas", base_price:2990, description:"Queso mantecoso derretido en masa artesanal.",     img:"https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=85"},
]

export const DEMO_BUILDINGS = [
  {id:"b1", name:"Edificio Las Lilas",   address:"Av. Las Lilas 1200"},
  {id:"b2", name:"Edificio Portal Sur",  address:"Calle Portal 456"},
  {id:"b3", name:"Torre Bellavista",     address:"Bellavista 789"},
]

export const COMUNAS = ["Providencia","Las Condes","Vitacura","Lo Barnechea","Ñuñoa","La Reina","Macul","San Miguel","Maipú"]

export const NIVELES = [
  {id:"base",      nombre:"Cliente Base",   icon:"🥐", color:C.textMid, bg:C.warm,    descripcion:"Precios regulares", requisito:"Registrarse en PanGo"},
  {id:"preferente",nombre:"Pan Preferente", icon:"⭐", color:"#854F0B", bg:"#FAEEDA", descripcion:"Cualquier pan al precio más bajo del catálogo", requisito:"30 referidos activos 3+ meses · Promedio $50.000/mes"},
  {id:"gold",      nombre:"Pan Gold",       icon:"🌟", color:"#5C3D00", bg:"#FDF3DC", descripcion:"5 tipos de pan al precio más bajo del catálogo", requisito:"6 meses como cliente · Promedio $50.000/mes"},
  {id:"platinum",  nombre:"Pan Platinum",   icon:"💎", color:"#1A3A6B", bg:"#E8F0FB", descripcion:"7 tipos de pan al precio más bajo del catálogo", requisito:"12 meses como cliente · Promedio $50.000/mes"},
]

export const DEMO_USER = {
  id:"demo-user", name:"María González", email:"maria@email.com",
  phone:"+56912345678", apt:"504", edificio:"Edificio Las Lilas",
  miembroDesde:"2024-06-10", mesesActivo:4, nivel:"gold",
  promedioUlt3:68000, codigoReferido:"MARIA-504",
  referidos:[
    {nombre:"Carlos Pérez",  meses:4, activo:true,  promedio:62000},
    {nombre:"Ana Rodríguez", meses:3, activo:true,  promedio:55000},
    {nombre:"Pedro Silva",   meses:2, activo:false, promedio:18000},
    {nombre:"Laura Martínez",meses:5, activo:true,  promedio:73000},
  ],
  historial:[
    {fecha:"2026-06-09", productos:"Pan Hallulla 1kg + Empanada Queso ×2", total:5600, turno:"am"},
    {fecha:"2026-06-07", productos:"Pan Ciabatta 1kg + Pan Francés 1kg",   total:6380, turno:"pm"},
    {fecha:"2026-06-05", productos:"Empanada Pino ×3",                      total:10170,turno:"am"},
    {fecha:"2026-06-03", productos:"Pan Hallulla 2kg",                       total:5980, turno:"am"},
  ],
}

export function fmt(n){return "$"+Math.round(n||0).toLocaleString("es-CL")}

export function calcPrecio(p, w){
  if(!p) return 0
  const base  = p.base_price || 0
  const extra = p.price_per_extra500 || 0
  const bw    = p.base_weight || 1000
  if(!p.weights) return base
  return base + Math.max(0,((w||bw)-bw)/500)*extra
}

export function getFechas(semanas=4){
  const hoy=new Date(); const out=[]
  for(let i=1;i<=semanas*7;i++){
    const d=new Date(hoy); d.setDate(hoy.getDate()+i)
    const dow=d.getDay()
    out.push({
      fecha:d.toISOString().split("T")[0],
      diaNombre:DIAS[dow===0?6:dow-1],
      diaFull:DIAS_F[dow===0?6:dow-1],
      numero:d.getDate(),
      mes:d.toLocaleDateString("es-CL",{month:"short"}),
      semana:Math.ceil(i/7),
    })
  }
  return out
}
