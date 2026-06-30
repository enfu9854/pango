import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseKey)
  : null

// ── Auth helpers ──────────────────────────────────────────────────────────────
export async function signUp({ email, password, name, phone, apt, buildingId, comunaId, referido }) {
  if (!supabase) throw new Error('Supabase no configurado')
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, phone, apt, building_id: buildingId, comuna_id: comunaId, referido } },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  if (!supabase) throw new Error('Supabase no configurado')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── Data helpers ──────────────────────────────────────────────────────────────
export async function fetchProducts() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchBuildings() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function fetchUserProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('users')
    .select('*, buildings(name, address)')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function createOrder({ userId, items, deliveryDate, shift, frequency }) {
  if (!supabase) throw new Error('Supabase no configurado')
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const { data: order, error } = await supabase
    .from('orders')
    .insert({ user_id: userId, delivery_date: deliveryDate, shift, frequency, total, status: 'pending' })
    .select()
    .single()
  if (error) throw error

  const orderItems = items.map(i => ({
    order_id: order.id,
    product_id: i.product.id,
    weight: i.weight,
    qty: i.qty,
    unit_price: i.price,
  }))
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw itemsError
  return order
}

export async function fetchAdminSummary(day) {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('admin_summary_by_day', { day_name: day })
  if (error) throw error
  return data
}

export async function fetchAdminOrders(status = 'paid') {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('orders')
    .select('*, users(name, apt, buildings(name)), order_items(qty, products(name, emoji))')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function markOrderDelivered(orderId) {
  if (!supabase) return null
  const { error } = await supabase
    .from('orders')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) throw error
}

export async function updateProductPrice(productId, basePrice, extra) {
  if (!supabase) return null
  const { error } = await supabase
    .from('products')
    .update({ base_price: basePrice, price_per_extra500: extra })
    .eq('id', productId)
  if (error) throw error
}
