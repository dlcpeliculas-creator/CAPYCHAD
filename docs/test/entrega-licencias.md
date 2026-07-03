# Entrega manual de licencias (hasta ~20 ventas/mes)

**Formato de clave:** `CAPY-{PLAN}-{XXXX-XXXX-XXXX}` — PLAN: VIT (vitalicia), FUN (fundadora), ANU (anual), EST (estudiante). Grupos aleatorios A–Z/2–9 (sin 0/O/1/I). Generarla a mano o con: `node -e "const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const g=()=>Array.from({length:4},()=>c[Math.floor(Math.random()*c.length)]).join('');console.log('CAPY-FUN-'+g()+'-'+g()+'-'+g())"`

**SLA:** email con la clave en **menos de 24 horas** desde el pago (la landing lo promete).

**Plantilla del email:**

> **Asunto:** Tu licencia de CAPYCHAD — gracias por ser de los primeros
>
> ¡Hola [NOMBRE]! Gracias por apoyar CAPYCHAD.
>
> Tu clave [PLAN]: `CAPY-XXX-XXXX-XXXX-XXXX`
>
> La app es tuya [para siempre / por un año], con todas las actualizaciones. Por ahora no hace falta ingresarla en ningún lado — guardala: cuando la activación llegue en una próxima versión, esta clave ya vale. Tus guiones viven en tu computadora; nada nuestro los toca.
>
> Un pedido de fundador a fundador: si algo no funciona con tu lector de pantalla o te falta una opción, apretá Alt+Shift+F dentro de la app y contámelo — los reportes de accesibilidad van primero en la cola, siempre.
>
> — Santiago · TRUEGOTDF

**Registro privado (llevar en una planilla NO compartida):** fecha · nombre · email · plan · clave · medio de pago · monto. Ese registro es la fuente para el grandfathering cuando llegue la verificación Ed25519.

**Reembolsos:** 14 días sin preguntas. Se pierde una venta, se gana la reputación.
