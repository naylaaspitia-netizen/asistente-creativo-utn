# Creativos Digitales Offline · Misión Código

Proyecto Educativo Tecnológico para 3.º grado.

## Versión pública
La página pública funciona en GitHub Pages y permite probar:
- 4 misiones: algoritmos, patrones y secuencias, bucles y eventos.
- Gamificación cooperativa con bits, insignias y barra de progreso.
- Asistente Creativo local basado en reglas.
- Progreso guardado con `localStorage`.
- Navegación usable con teclado.

## Panel docente / Administradora
El archivo `admin.html` contiene el panel docente.

Para **seguimiento real entre varias computadoras** se debe ejecutar la versión de aula con Node.js + Socket.IO:

```bash
npm install
npm start
```

Luego:
- Estudiantes: `http://IP-DE-LA-PC-DOCENTE:3000/`
- Docente: `http://IP-DE-LA-PC-DOCENTE:3000/admin.html`

Código docente por defecto: `AULA3`

Se recomienda cambiarlo antes de usarlo mediante la variable de entorno `ADMIN_CODE`.

## Funciones del panel docente
- Ver grupos conectados.
- Ver misión actual, progreso, bits e insignias.
- Recibir pedidos de ayuda.
- Pausar/reanudar a todos.
- Abrir una misión para todos o para un grupo.
- Enviar mensajes.
- Marcar pedidos como atendidos.
- Otorgar la insignia “Equipo que ayuda”.

La sincronización en tiempo real funciona dentro de la red local del aula y no necesita Internet.
