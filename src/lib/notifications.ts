import { sendTelegramMessage } from './telegram'
import { sendEmail } from './email'

export async function notifyNuevoVendedor(nombre: string, email: string) {
  await sendTelegramMessage(`🆕 <b>Nuevo vendedor registrado</b>\nNombre: ${nombre}\nEmail: ${email}`)
  await sendEmail({ to: email, subject: 'Bienvenido a DMS Market', html: `<h2>Hola ${nombre}</h2><p>Tu cuenta de vendedor fue creada exitosamente en DMS Market.</p>` })
}

export async function notifyNuevoComprador(nombre: string, email: string) {
  await sendTelegramMessage(`👤 <b>Nuevo comprador registrado</b>\nNombre: ${nombre}\nEmail: ${email}`)
  await sendEmail({ to: email, subject: 'Bienvenido a DMS Market', html: `<h2>Hola ${nombre}</h2><p>Bienvenido a DMS Market. Ya puedes empezar a comprar.</p>` })
}

export async function notifyNuevoProducto(nombre: string, tienda: string, precio: number) {
  await sendTelegramMessage(`📦 <b>Nuevo producto publicado</b>\nProducto: ${nombre}\nTienda: ${tienda}\nPrecio: $${precio.toLocaleString('es-CO')}`)
}

export async function notifyNuevaCompra(cliente: string, total: number, orderId: string) {
  await sendTelegramMessage(`💰 <b>Nueva compra realizada</b>\nCliente: ${cliente}\nTotal: $${total.toLocaleString('es-CO')}\nOrden: #${orderId.slice(0,8).toUpperCase()}`)
}

export async function notifyNuevaDisputa(razon: string, email: string) {
  await sendTelegramMessage(`⚠️ <b>Nueva disputa creada</b>\nRazón: ${razon}\nContacto: ${email}`)
}

export async function notifyPagoAprobado(cliente: string, total: number, email: string) {
  await sendTelegramMessage(`✅ <b>Pago aprobado</b>\nCliente: ${cliente}\nTotal: $${total.toLocaleString('es-CO')}`)
  await sendEmail({ to: email, subject: 'Tu pago fue aprobado', html: `<h2>Pago confirmado</h2><p>Tu pago de $${total.toLocaleString('es-CO')} fue procesado exitosamente.</p>` })
}

export async function notifyNuevoServicio(nombre: string, categoria: string) {
  await sendTelegramMessage(`🛠 <b>Nuevo servicio publicado</b>\nServicio: ${nombre}\nCategoría: ${categoria}`)
}

export async function notifyNuevoProveedor(nombre: string, email: string) {
  await sendTelegramMessage(`🆕 <b>Nuevo proveedor registrado</b>\nNombre: ${nombre}\nEmail: ${email}`)
  await sendEmail({ to: email, subject: 'Bienvenido a DMS Market', html: `<h2>Hola ${nombre}</h2><p>Tu cuenta de proveedor fue creada. Revisaremos tu servicio pronto.</p>` })
}