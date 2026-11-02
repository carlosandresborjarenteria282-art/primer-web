/*
  ARCHIVO: main.js
  PROPÓSITO: Lógica e interactividad del portafolio.
  QUÉ HACE: Controla el modo oscuro (con persistencia), el menú móvil,
            la carga de proyectos desde JSON (fetch), el filtro en vivo
            y la validación del formulario de contacto.
  PARA QUÉ SIRVE: Hace la página interactiva y dinámica.
*/

// ============================================================
// 1. TEMA OSCURO (MODO DARK) - persistencia en localStorage
// ============================================================
// Clave usada para guardar la preferencia del usuario en localStorage
const THEME_KEY = 'portfolio-theme';

// Aplica un tema ('dark' o 'light'): agrega o quita la clase 'dark'
// en el elemento <html>, lo que activa los estilos dark: de Tailwind.
// También actualiza el icono (sol/luna) en el botón de escritorio y móvil.
function applyTheme(theme) {
  const root = document.documentElement;          // elemento <html>
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  const icon = theme === 'dark' ? '☀️' : '🌙';   // icono según tema
  // Actualiza el icono del botón de escritorio
  document.querySelectorAll('#themeIcon, #themeToggleMobile').forEach(el => {
    if (el.id === 'themeIcon') el.textContent = icon;
  });
  // Actualiza el botón móvil
  const mobileBtn = document.getElementById('themeToggleMobile');
  if (mobileBtn) mobileBtn.textContent = icon;
}

// Al cargar la página: usa el tema guardado o la preferencia del sistema
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);          // tema guardado
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // preferencia del SO
  applyTheme(saved ? saved : (prefersDark ? 'dark' : 'light'));
}

// Alterna entre claro y oscuro y guarda la elección
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const next = isDark ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);   // guarda preferencia
  applyTheme(next);                        // aplica el nuevo tema
}

// Inicializa el tema al cargar y registra los botones
initTheme();
document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
document.getElementById('themeToggleMobile')?.addEventListener('click', toggleTheme);


// ============================================================
// 2. MENÚ MÓVIL (hamburguesa)
// ============================================================
const menuBtn = document.getElementById('menuBtn');       // botón hamburguesa
const mobileMenu = document.getElementById('mobileMenu'); // contenedor del menú

// Al hacer clic, muestra/oculta el menú móvil y actualiza aria-expanded
menuBtn?.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('hidden'); // estado actual
  mobileMenu.classList.toggle('hidden');                // muestra/oculta
  menuBtn.setAttribute('aria-expanded', String(!open));  // accesibilidad
});

// Cierra el menú móvil al hacer clic en un enlace
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.add('hidden');
  menuBtn.setAttribute('aria-expanded', 'false');
}));


// ============================================================
// 3. CARGA DE PROYECTOS CON FETCH DESDE JSON
// ============================================================
let allProjects = [];                  // arreglo con todos los proyectos
const container = document.getElementById('projectsContainer'); // contenedor de tarjetas
const noResults = document.getElementById('noResults');         // mensaje "sin resultados"
const filterInput = document.getElementById('filterInput');    // campo de búsqueda

// Respaldo local por si fetch falla (ej. abrir con file://)
const FALLBACK_PROJECTS = [
  {"title":"ViaSegura · Educación Vial","description":"Plataforma web educativa sobre seguridad vial: estadísticas, normas de tránsito, señales, simulación y buenas prácticas para conductores y peatones. Incluye autenticación y panel administrativo.","tech":["Python","Flask","MySQL","Materialize","JavaScript"],"image":"https://picsum.photos/seed/viasegura/600/400","demo":"#","repo":"#"}
];

// Dibuja las tarjetas de proyecto en el contenedor
function renderProjects(list) {
  container.innerHTML = '';               // limpia el contenedor
  if (!list.length) {                     // si no hay resultados
    noResults.classList.remove('hidden');  // muestra mensaje
    return;
  }
  noResults.classList.add('hidden');       // oculta mensaje
  list.forEach(p => {                     // por cada proyecto
    const card = document.createElement('article'); // crea tarjeta
    card.className = 'project-card';
    card.setAttribute('role', 'listitem');
    // Plantilla HTML de la tarjeta con datos del proyecto
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" loading="lazy" />
      <div class="p-5 flex-1 flex flex-col">
        <h3 class="text-lg font-bold mb-1">${p.title}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">${p.description}</p>
        <div class="flex flex-wrap gap-1 mb-3">
          ${p.tech.map(t => `<span class="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-gray-700 dark:text-gray-200">${t}</span>`).join('')}
        </div>
        <div class="flex gap-3 text-sm">
          ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="text-brand-600 hover:underline">Demo</a>` : ''}
          ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener" class="text-brand-600 hover:underline">Código</a>` : ''}
        </div>
      </div>
    `;
    container.appendChild(card);           // agrega la tarjeta al DOM
  });
}

// Carga los proyectos desde el archivo JSON usando fetch
async function loadProjects() {
  try {
    const res = await fetch('data/proyectos.json'); // petición al JSON
    if (!res.ok) throw new Error('HTTP ' + res.status); // error HTTP
    allProjects = await res.json();         // convierte a arreglo JS
    renderProjects(allProjects);            // dibuja las tarjetas
  } catch (err) {
    // Si falla (ej. file://), usa el respaldo local
    allProjects = FALLBACK_PROJECTS;
    renderProjects(allProjects);
    const note = document.createElement('p');
    note.className = 'text-xs text-gray-400 mt-4 text-center';
    note.textContent = 'Nota: proyectos cargados desde respaldo local (servidor no disponible).';
    container.parentElement.appendChild(note);
  }
}
loadProjects();   // ejecuta la carga al iniciar


// ============================================================
// 4. FILTRO DE PROYECTOS EN VIVO
// ============================================================
// Al escribir en el buscador, filtra los proyectos por título,
// descripción o tecnología y vuelve a renderizar.
filterInput?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();   // texto buscado
  const filtered = allProjects.filter(p =>
    p.title.toLowerCase().includes(q) ||           // coincide título
    p.description.toLowerCase().includes(q) ||     // coincide descripción
    p.tech.some(t => t.toLowerCase().includes(q))  // coincide tecnología
  );
  renderProjects(filtered);                        // muestra filtrados
});


// ============================================================
// 5. VALIDACIÓN DEL FORMULARIO DE CONTACTO
// ============================================================
const form = document.getElementById('contactForm');

// Muestra el mensaje de error bajo un campo y marca el borde en rojo
function showError(field, msg) {
  const el = document.querySelector(`.error-msg[data-for="${field}"]`);
  const input = document.getElementById(field);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  if (input) input.classList.add('input-error');
}

// Limpia el error de un campo
function clearError(field) {
  const el = document.querySelector(`.error-msg[data-for="${field}"]`);
  const input = document.getElementById(field);
  if (el) { el.textContent = ''; el.classList.add('hidden'); }
  if (input) input.classList.remove('input-error');
}

// Valida el formato de un email con expresión regular
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

// Al enviar el formulario: valida todos los campos
form?.addEventListener('submit', (e) => {
  e.preventDefault();   // evita envío real (solo demo)
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const asunto = document.getElementById('asunto').value.trim();
  const mensaje = document.getElementById('mensaje').value.trim();
  let ok = true;
  ['nombre','email','asunto','mensaje'].forEach(clearError); // limpia errores previos

  // Validaciones individuales
  if (nombre.length < 2) { showError('nombre', 'Ingresa un nombre válido (mín. 2 caracteres).'); ok = false; }
  if (!validateEmail(email)) { showError('email', 'Ingresa un email válido.'); ok = false; }
  if (asunto.length < 3) { showError('asunto', 'El asunto debe tener al menos 3 caracteres.'); ok = false; }
  if (mensaje.length < 10) { showError('mensaje', 'El mensaje debe tener al menos 10 caracteres.'); ok = false; }

  if (!ok) {                      // si hay errores
    alert('Por favor corrige los campos marcados en rojo.');
    return;
  }
  alert('¡Mensaje enviado con éxito! Gracias por contactarme.'); // éxito
  form.reset();                   // limpia el formulario
});

// Limpia el error de un campo mientras el usuario escribe
['nombre','email','asunto','mensaje'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => clearError(id));
});
