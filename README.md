# Sitio Web Personal Interactivo (Hoja de Vida)

Proyecto para la Actividad Práctica · Módulo 2.

## Elección de framework CSS: Tailwind CSS (CDN)

Se eligió **Tailwind CSS** en lugar de Bootstrap porque:
- Enfoque *utility-first* que permite personalizar el diseño sin sobrescribir estilos de componentes predefinidos.
- Mejor control del responsive design con breakpoints (`sm`, `md`, `lg`) explícitos en las clases.
- Modo oscuro integrado mediante la estrategia `class` (toggle manual + preferencia del sistema).
- No requiere paso de build para esta entrega (se usa el CDN), manteniendo la carpeta del proyecto simple.

## Estructura
```
trabajo herra/
├── index.html
├── css/styles.css
├── js/main.js
└── data/proyectos.json
```

## Requisitos cumplidos
- HTML5 semántico: `header`, `nav`, `main`, `footer`, `section`, `article`.
- Secciones: Sobre mí, Proyectos, Contacto (además de Habilidades).
- Layout con Flexbox/Grid en 3 tamaños (mobile, tablet, desktop).
- Tailwind CSS.
- Formulario de contacto con validación (JS + alert).
- Transiciones/animaciones (fade-in, hover cards).
- JS: menú móvil, modo oscuro, filtro de proyectos.
- Proyectos cargados con `fetch` desde `data/proyectos.json`.

## Ejecución
Abrir `index.html` en el navegador. Para que `fetch` funcione correctamente, servir la carpeta con un servidor local, por ejemplo:
```
python -m http.server 8000
```
y abrir http://localhost:8000

## Sustentación
- Semántica/accesibilidad: etiquetas semánticas, `aria-label`, `aria-live`, `alt`.
- Responsivo: grid de 1/2/3 columnas según breakpoint.
- Interactividad: menú móvil, tema, filtro, validación con alert.
