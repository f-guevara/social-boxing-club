// Social Boxing Club — comportamiento del sitio (sin base de datos: el formulario abre WhatsApp).

const CLUB = {
  whatsapp: '50378694928', // +503 7869 4928 (número publicado por el club)
  nombre: 'Social Boxing Club'
};

function waLink(text) {
  return `https://wa.me/${CLUB.whatsapp}?text=${encodeURIComponent(text)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Menú móvil
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });

  // Todos los elementos con data-wa abren WhatsApp con ese mensaje
  document.querySelectorAll('[data-wa]').forEach((el) => {
    el.setAttribute('href', waLink(el.dataset.wa));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  // Formulario de primera clase gratis → mensaje de WhatsApp
  const form = document.getElementById('trialForm');
  const err = document.getElementById('formErr');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const telefono = form.telefono.value.trim();
    const quien = form.quien.value;
    const horario = form.horario.value.trim();
    const digits = telefono.replace(/\D/g, '');

    if (nombre.length < 2) return showErr('Escribe tu nombre.', form.nombre);
    if (digits.length < 8) return showErr('Escribe un teléfono válido (al menos 8 dígitos).', form.telefono);
    err.hidden = true;

    let msg = `Hola, soy ${nombre}. Quiero agendar mi primera clase gratis en ${CLUB.nombre}. Va a entrenar: ${quien}.`;
    if (horario) msg += ` Horario que me funciona: ${horario}.`;
    msg += ` Mi teléfono: ${telefono}.`;
    window.open(waLink(msg), '_blank', 'noopener');
  });
  function showErr(text, field) {
    err.textContent = text;
    err.hidden = false;
    field.focus();
  }

  // Galería con lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  document.getElementById('gallery').addEventListener('click', (e) => {
    const b = e.target.closest('.g');
    if (!b) return;
    lbImg.src = b.dataset.src;
    lbImg.alt = b.dataset.alt || '';
    lb.hidden = false;
  });
  function closeLb() { lb.hidden = true; lbImg.src = ''; }
  document.getElementById('lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLb(); closeMenu(); } });

  // Revelado al hacer scroll
  const targets = document.querySelectorAll('.section-head, .sched__card, .plan, .event, .carlos > *, .g, .contact > *, .values__grid > div');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    targets.forEach((t) => { t.classList.add('reveal'); io.observe(t); });
  }
});
