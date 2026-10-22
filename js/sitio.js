/*
 * Lo común a todas las páginas del sitio. Se carga después de la etiqueta de Google.
 *
 * 1) Año del pie: el «© 2026» de cada página se actualiza solo con el año en curso
 *    (<span data-anio-actual>). Si este archivo no carga, queda el escrito en la página.
 *
 * 2) Medición de contactos en Google Analytics (G-VK3JP82CXM):
 *    contacto_whatsapp   clic en cualquier enlace a WhatsApp
 *    contacto_telefono   clic en un número de teléfono
 *    contacto_email      clic en la dirección de correo
 *    generate_lead       llegada a gracias.html, que es adonde el CRM manda después de guardar la consulta
 *    Cada evento lleva «ubicacion»: de qué parte de la página salió el clic (pie, encabezado,
 *    boton_flotante, la sección…). Para usarlos como conversión en Google Ads, se marcan como
 *    «evento clave» en Analytics y se importan desde Ads.
 */
(function () {
  document.querySelectorAll('[data-anio-actual]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  if (typeof window.gtag !== 'function') return;

  function ubicacion(el) {
    if (el.dataset.ubicacion) return el.dataset.ubicacion;
    if (el.closest('.whatsapp-cta-banner')) return 'cartel_flotante';
    if (el.closest('.whatsapp-cta, .whatsapp-float')) return 'boton_flotante';
    if (el.closest('header')) return 'encabezado';
    if (el.closest('footer')) return 'pie';
    var seccion = el.closest('section');
    if (seccion) return seccion.id || (seccion.className || '').split(' ')[0] || 'seccion';
    return 'otro';
  }

  function tipoDeEnlace(href) {
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href)) return 'contacto_whatsapp';
    if (/^tel:/i.test(href)) return 'contacto_telefono';
    if (/^mailto:/i.test(href)) return 'contacto_email';
    return null;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var evento = tipoDeEnlace(a.getAttribute('href'));
    if (!evento) return;
    // beacon: el pedido sale aunque el enlace abra WhatsApp o cambie de página en el mismo instante
    window.gtag('event', evento, { ubicacion: ubicacion(a), transport_type: 'beacon' });
  }, true);

  if (/\/gracias(\.html)?$/.test(location.pathname)) {
    window.gtag('event', 'generate_lead', { ubicacion: 'formulario_de_consulta' });
  }
})();
