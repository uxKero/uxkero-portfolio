import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Copy, Lock, ArrowRight, ArrowLeft,
  CheckCircle, AlertTriangle, Lightbulb, Info, Check,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Callout {
  type: 'warning' | 'tip' | 'info';
  title: string;
  text: string;
}

interface Step {
  title: string;
  subtitle?: string;
  content: string;
  code?: string;
  callout?: Callout;
}

interface Quiz {
  question: string;
  options: string[];
  correct: number;
}

interface Module {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  group: string;
  steps: Step[];
  quiz: Quiz;
}

// ─────────────────────────────────────────────────────────────
// MODULE DATA
// ─────────────────────────────────────────────────────────────

const MODULES: Module[] = [
  {
    number: '00',
    title: 'Instalación',
    subtitle: 'Del VPS limpio al primer mensaje en WhatsApp',
    description: 'Antes de configurar cualquier archivo del workspace, OpenClaw tiene que estar corriendo. Este módulo cubre la instalación desde cero.',
    color: '#6366f1',
    group: 'Fundamentos',
    steps: [
      {
        title: 'Prerequisitos',
        subtitle: 'Ubuntu 22.04 + Node.js 22+',
        content: 'OpenClaw es un gateway autohospedado. El programa corre en tu máquina (o en un servidor) y actúa como puente entre tus apps de mensajería y el modelo de IA que elegís. No es un servicio en la nube — vos lo instalás, vos lo controlás.\n\nAntes de instalar, necesitás un servidor con Ubuntu 22.04 LTS y Node.js versión 22 o superior. Si ya tenés Node instalado, verificá con `node -v`.',
        code: '$ sudo apt update && sudo apt upgrade -y\n$ lsb_release -a\n$ node -v\n→ Si devuelve v22.x.x o superior, ya está.',
        callout: { type: 'warning', title: 'Instalar en VPS, no en tu máquina personal', text: 'OpenClaw es software experimental. Instalarlo en un servidor dedicado evita riesgos en tu equipo y permite que corra 24/7.' },
      },
      {
        title: 'Instalación',
        subtitle: 'El script oficial de OpenClaw',
        content: 'El instalador oficial detecta y puede instalar Node.js solo. El comando instala OpenClaw globalmente y lanza el asistente de configuración inicial que te guía paso a paso.',
        code: '$ npm install -g openclaw\n$ openclaw onboard',
        callout: { type: 'tip', title: '¿Usás un usuario no-root?', text: 'Recomendado. OpenClaw guarda todo en el home del usuario que lo instala (~/.openclaw). Instalarlo como root crea problemas de permisos.' },
      },
      {
        title: 'Modelo de IA',
        subtitle: 'API key + elección del modelo',
        content: 'OpenClaw es agnóstico de modelo. Podés conectarlo con OpenRouter (recomendado para empezar), OpenAI, Anthropic, o Ollama para modelos locales.\n\nDurante el `openclaw onboard`, te va a pedir tu API key. OpenRouter es ideal para comenzar porque te da acceso a múltiples modelos con una sola key.',
        code: 'OPENROUTER_API_KEY=sk-or-v1-...\nModel: openai/gpt-4o-mini  ← económico para empezar',
        callout: { type: 'info', title: 'Regla de oro del modelo', text: 'Empezá con un modelo económico. Migrá a modelos más potentes cuando entiendas qué tareas realmente necesitan más capacidad.' },
      },
      {
        title: 'Conectar WhatsApp',
        subtitle: 'QR + primer handshake',
        content: 'OpenClaw se conecta a WhatsApp vía Baileys. El proceso es el mismo que vincular WhatsApp Web: escaneás un código QR con tu teléfono.\n\nUna vez conectado, el agente aparece como un contacto más en tu WhatsApp.',
        code: '$ openclaw start\n→ Abre el QR en pantalla\n→ WhatsApp > Dispositivos vinculados > Vincular dispositivo\n→ Escaneá el QR',
        callout: { type: 'warning', title: 'Usá un número dedicado', text: 'Recomendado usar una SIM separada para el agente, no tu número personal. Esto evita confusiones y es más seguro.' },
      },
      {
        title: 'Verificación',
        subtitle: 'openclaw doctor + primer chat',
        content: 'Antes de empezar a configurar el workspace, verificá que todo esté funcionando. El comando `openclaw doctor` hace un diagnóstico completo del sistema.\n\nSi todo está verde, mandá un mensaje al agente en WhatsApp.',
        code: '$ openclaw doctor\n✓ Node.js 22.x  ✓ Config válida\n✓ WhatsApp conectado  ✓ Modelo respondiendo\n\nMensaje de prueba: "Hola, ¿estás ahí?"',
        callout: { type: 'tip', title: 'Checkpoint', text: 'Si recibís respuesta en WhatsApp, la instalación está completa. Todo lo que sigue es configuración del workspace.' },
      },
    ],
    quiz: {
      question: '¿Por qué la guía recomienda instalar OpenClaw en un VPS y no en tu computadora personal?',
      options: [
        'Para que corra 24/7 sin depender de que tu computadora esté encendida, y porque es software experimental que conviene aislar.',
        'Porque OpenClaw solo funciona en Linux y la mayoría de computadoras personales usan Windows o Mac.',
        'Porque la instalación ocupa demasiado espacio y no es compatible con menos de 32GB de RAM.',
      ],
      correct: 0,
    },
  },
  {
    number: '01',
    title: 'openclaw.json',
    subtitle: 'El cerebro del sistema',
    description: 'Si OpenClaw fuera un auto, openclaw.json sería el tablero de control: modelos, canales, agentes y límites. Todo pasa por acá antes de llegar al workspace.',
    color: '#d97706',
    group: 'Fundamentos',
    steps: [
      {
        title: 'N1 — Funciona y ya',
        subtitle: 'auth, agents, plugins, gateway',
        content: 'El nivel N1 es la configuración mínima funcional. Con ella el agente responde mensajes y tiene las herramientas básicas habilitadas.\n\nEste archivo vive en `~/.openclaw/openclaw.json`, no en el workspace. Es la infraestructura, no la mente del agente.',
        code: '{\n  "gateway": {\n    "bind": "localhost",\n    "port": 18789\n  },\n  "agents": [{\n    "name": "mi-agente",\n    "workspace": "~/.openclaw/workspace/"\n  }]\n}',
        callout: { type: 'warning', title: 'Regla de oro', text: 'Cada vez que modificás openclaw.json, necesitás reiniciar OpenClaw. El agente no lo lee en caliente.' },
      },
      {
        title: 'N2 — Lo personalizo',
        subtitle: 'channels, session, messages, tools',
        content: 'En N2 controlás cómo el agente se comporta con distintos usuarios y canales. Podés definir quién tiene acceso y qué herramientas puede usar cada canal.\n\nEste es el nivel donde la mayoría de usuarios se quedan — es suficiente para el 90% de los casos de uso.',
        code: '"channels": {\n  "whatsapp": {\n    "enabled": true,\n    "pairing": "strict",\n    "allowedNumbers": ["+5491..."]\n  }\n},\n"session": {\n  "maxHistory": 50\n}',
        callout: { type: 'tip', title: 'Pairing strict', text: 'Con "strict", solo los números en allowedNumbers pueden hablar con el agente. Cualquier otro recibe silencio. Es la config más segura.' },
      },
      {
        title: 'N3 — Lo potencio',
        subtitle: 'skills, Whisper, browser',
        content: 'N3 habilita las capacidades más poderosas: transcripción de audios (Whisper), navegación web, y skills específicos. Acá también configurás el routing — qué modelo usar para cada tipo de tarea.',
        code: '"tools": {\n  "bash": true,\n  "browser": true,\n  "whisper": { "model": "base" }\n},\n"routing": {\n  "default": "openai/gpt-4o",\n  "light":   "openai/gpt-4o-mini"\n}',
        callout: { type: 'warning', title: 'Habilitá de a una', text: 'No actives bash, browser y file_system al mismo tiempo desde el día uno. Habilitá una herramienta, probala, y recién avanzá a la siguiente.' },
      },
      {
        title: 'N4 — En producción',
        subtitle: 'seguridad, costos, escalabilidad',
        content: 'N4 es configuración para un agente ya estabilizado. Incluye límites de tokens por día, alertas de costo, sandboxing completo y configuración para múltiples agentes en paralelo.\n\nSi llegaste acá, ya conocés tu agente. Este nivel es sobre control y escala.',
        code: '"limits": {\n  "dailyTokens": 500000,\n  "costAlertUSD": 5.0,\n  "sandbox": true\n},\n"multi": {\n  "agents": ["agente-trabajo", "agente-personal"]\n}',
        callout: { type: 'info', title: 'N1 → N4 no es obligatorio', text: 'Mucha gente vive feliz en N2. Los niveles son una guía de qué configurar cuando necesitás más control, no un camino forzado.' },
      },
    ],
    quiz: {
      question: '¿Qué tenés que hacer obligatoriamente cada vez que modificás openclaw.json?',
      options: [
        'Reiniciar OpenClaw para que los cambios surtan efecto, porque el agente no lee el archivo en caliente.',
        'Enviarle un mensaje al agente diciéndole "recargá tu configuración" para que actualice los parámetros.',
        'Borrar los diarios de memoria del día actual para que el agente arranque con contexto limpio.',
      ],
      correct: 0,
    },
  },
  {
    number: '02',
    title: 'Workspace',
    subtitle: 'El hogar de tu agente',
    description: 'El workspace es la carpeta donde vive la mente de tu agente. No es donde se instala OpenClaw, no es donde se guardan las contraseñas. Es donde están los archivos que definen quién es tu agente.',
    color: '#0d9488',
    group: 'Fundamentos',
    steps: [
      {
        title: 'Las dos carpetas',
        subtitle: 'La confusión más común en los primeros días',
        content: 'Hay dos carpetas relacionadas con OpenClaw en tu sistema. Es crítico entender la diferencia porque editar algo en la carpeta equivocada no tiene efecto — o puede romper cosas.\n\n`~/.openclaw/` es la infraestructura: config técnica, credenciales OAuth, sesiones activas. `~/.openclaw/workspace/` es la mente: AGENTS.md, SOUL.md, memorias, skills personalizados.',
        code: '~/.openclaw/          ← Infraestructura\n├── openclaw.json       ← Config técnica\n├── credentials/        ← OAuth tokens\n└── workspace/          ← La mente del agente\n    ├── AGENTS.md\n    ├── SOUL.md\n    └── memory/',
        callout: { type: 'warning', title: 'Confusión frecuente', text: 'Muchos buscan SOUL.md en ~/.openclaw/ y no lo encuentran. Los archivos del agente están un nivel más adentro, en workspace/. Son carpetas hermanas en roles, no en ubicación.' },
      },
      {
        title: 'Mapa completo de archivos',
        subtitle: 'Qué hace cada uno y cuándo se carga',
        content: 'El workspace tiene archivos con roles muy específicos. Conocer qué hace cada uno te evita poner cosas en el lugar equivocado y entender por qué el agente se comporta de cierta manera.',
        code: 'workspace/\n├── AGENTS.md    ← Cómo opera (siempre)\n├── SOUL.md      ← Quién es (siempre)\n├── TOOLS.md     ← Guía de tools (siempre)\n├── USER.md      ← Quién sos vos (siempre)\n├── IDENTITY.md  ← Nombre del agente (siempre)\n├── MEMORY.md    ← Memoria curada (sesión privada)\n├── HEARTBEAT.md ← Tareas periódicas\n└── memory/      ← Diarios del día (automático)',
        callout: { type: 'info', title: 'Definición oficial', text: '"The workspace is the agent\'s home. It is the only working directory used for file tools and workspace context. Keep it private and treat it as memory."' },
      },
      {
        title: 'Lo que NO va en el workspace',
        subtitle: 'Credenciales, sesiones, skills globales',
        content: 'Tan importante como saber qué va adentro es saber qué no va. El workspace está pensado para la identidad y memoria del agente — no para infraestructura técnica.\n\nPoner credenciales en AGENTS.md o SOUL.md es un error de seguridad. El workspace puede quedar expuesto si compartís el agente.',
        callout: { type: 'warning', title: 'Nunca en el workspace', text: 'API keys, tokens OAuth, contraseñas, credenciales de base de datos. También: skills globales instalados, configuración de canales, sesiones activas. Todo eso vive en ~/.openclaw/.' },
      },
      {
        title: 'Git backup y migración',
        subtitle: 'Cómo proteger la mente de tu agente',
        content: 'El workspace es lo más valioso que tenés en OpenClaw — meses de configuración, memoria acumulada, personalización. Perderlo significa empezar de cero.\n\nLa mejor práctica es tener el workspace bajo control de versiones con git, con un repo privado.',
        code: 'cd ~/.openclaw/workspace\ngit init\ngit remote add origin git@github.com:usuario/mi-agente-privado.git\n\n# Para migrar a otra máquina:\ngit clone git@github.com:usuario/mi-agente-privado.git \\\n  ~/.openclaw/workspace',
        callout: { type: 'tip', title: 'Repo privado siempre', text: 'El workspace contiene la personalidad de tu agente, tus preferencias, y potencialmente resúmenes de conversaciones privadas. Nunca lo publiques en un repo público.' },
      },
    ],
    quiz: {
      question: '¿Cuál es la diferencia clave entre ~/.openclaw/ y ~/.openclaw/workspace/?',
      options: [
        '~/.openclaw/ es la infraestructura técnica (config, credenciales) y workspace/ es la mente del agente (SOUL.md, AGENTS.md, memorias).',
        'Son la misma carpeta — workspace/ es solo un alias que OpenClaw crea por compatibilidad.',
        'workspace/ es para archivos temporales que se borran automáticamente al reiniciar el servidor.',
      ],
      correct: 0,
    },
  },
  {
    number: '03',
    title: 'AGENTS.md',
    subtitle: 'El manual de operaciones de tu agente',
    description: 'AGENTS.md define cómo opera tu agente: rutinas de inicio, protocolos de seguridad, reglas de comportamiento y el orden en que prioriza las instrucciones.',
    color: '#1d4ed8',
    group: 'Arquitectura del agente',
    steps: [
      {
        title: 'El ciclo de bootstrap',
        subtitle: 'Qué pasa antes de que el agente procese tu mensaje',
        content: 'Antes de hablar de AGENTS.md, hay que entender cómo OpenClaw construye el contexto del agente. Cada vez que llega un mensaje, el sistema no simplemente envía ese mensaje al modelo — arma un bloque de instrucciones completo desde cero.',
        code: '1. Lee los archivos del workspace activo\n2. Los concatena en el orden fijo del stack\n3. Los inyecta como system prompt\n4. Agrega el historial de conversación\n5. Agrega tu mensaje\n6. Envía todo al modelo y espera respuesta',
        callout: { type: 'info', title: 'Los archivos no son memoria persistente', text: 'Son instrucciones que se reinyectan frescas en cada arranque. El agente no "recuerda" — lee sus archivos como si fuera la primera vez en cada sesión.' },
      },
      {
        title: 'Stack de inyección — las 12 capas',
        subtitle: 'Orden y peso de cada archivo',
        content: 'El system prompt no es una mezcla aleatoria. Los archivos se insertan en un orden específico que determina cuáles tienen más peso. Las capas de arriba son más autoritativas.\n\nAGENTS.md está en la posición 3 — después de Tooling y Safety (no modificables), y antes de SOUL.md. Las reglas operativas de AGENTS.md tienen más peso que la personalidad.',
        code: '#1  Tooling       ← Herramientas habilitadas (~450 tokens)\n#2  Safety        ← Reglas del sistema, no modificable (~80)\n#3  AGENTS.md     ← Tu manual de operaciones ← ACÁ\n#4  SOUL.md       ← Personalidad del agente\n#5  USER.md       ← Información sobre vos\n#6  IDENTITY.md   ← Nombre y presentación\n...\n#12 Mensaje       ← Tu mensaje del momento',
        callout: { type: 'tip', title: 'Por qué importa el orden', text: 'Si hay conflicto entre AGENTS.md y SOUL.md, gana AGENTS.md. El manual de operaciones tiene más peso que la personalidad.' },
      },
      {
        title: 'Anatomía de AGENTS.md',
        subtitle: 'Qué pertenece aquí',
        content: 'AGENTS.md está pensado para instrucciones operativas: qué hacer al inicio de sesión, cómo manejar pedidos ambiguos, cuándo pedir permiso antes de actuar.\n\nNo va la personalidad (eso es SOUL.md). No van las tools disponibles (eso es TOOLS.md). AGENTS.md es el manual de procesos.',
        code: '# AGENTS.md\n\n## Al iniciar sesión\n- Leer MEMORY.md si es sesión privada\n- Saludar brevemente, no hacer resumen largo\n\n## Antes de ejecutar código\n- Confirmar siempre con el usuario\n- Mostrar el comando antes de correrlo\n\n## Gestión de memoria\n- Al cerrar sesión: flush a memory/HOY.md',
        callout: { type: 'info', title: 'La regla de distinción', text: 'Preguntate: "¿esto describe cómo opera el agente o quién es?" Si describe operaciones → AGENTS.md. Si describe personalidad → SOUL.md.' },
      },
      {
        title: 'Correlaciones con otros archivos',
        subtitle: 'Responsabilidades claras por archivo',
        content: 'AGENTS.md trabaja en conjunto con los otros archivos del workspace. Cada archivo tiene una responsabilidad única y clara. El overlap genera conflictos que el modelo resuelve de forma impredecible.',
        callout: { type: 'info', title: 'Responsabilidades únicas', text: 'AGENTS.md = cómo OPERA. SOUL.md = quién ES. TOOLS.md = qué HERRAMIENTAS. USER.md = quién ERES VOS. MEMORY.md = qué RECUERDA. Cada archivo tiene una sola responsabilidad.' },
      },
    ],
    quiz: {
      question: 'En el ciclo de bootstrap, ¿qué ocurre ANTES de que el agente procese tu mensaje?',
      options: [
        'OpenClaw lee los archivos del workspace, los concatena en el stack de inyección y los envía como system prompt al modelo.',
        'El agente busca en internet información actualizada sobre el tema antes de formular su respuesta.',
        'El modelo recupera automáticamente el historial completo de todas las conversaciones anteriores.',
      ],
      correct: 0,
    },
  },
  {
    number: '04',
    title: 'SOUL.md',
    subtitle: 'El alma de tu agente',
    description: 'SOUL.md es el archivo donde definís quién es tu agente: su nombre, su tono, sus valores, sus límites y cómo se presenta ante el mundo.',
    color: '#db2777',
    group: 'Arquitectura del agente',
    steps: [
      {
        title: 'Qué hace SOUL.md',
        subtitle: 'La distinción fundamental',
        content: 'SOUL.md es el archivo donde definís quién es tu agente: su nombre, su tono, sus valores y sus límites. OpenClaw lo lee en cada sesión y lo inyecta en el system prompt después de AGENTS.md.\n\nLa analogía exacta: SOUL.md es la cultura de la empresa. AGENTS.md es el manual de procesos.',
        callout: { type: 'info', title: 'La distinción fundamental', text: 'AGENTS.md = cómo OPERA tu agente (rutinas, herramientas, protocolos). SOUL.md = quién ES tu agente (personalidad, tono, valores, límites).' },
      },
      {
        title: 'Sin SOUL.md vs con él',
        subtitle: 'Lo que se pierde sin el archivo',
        content: 'El agente no falla si no tenés SOUL.md. OpenClaw inyecta un marcador y el modelo continúa como un LLM genérico. Lo que se pierde es la identidad — y con ella, la consistencia y la confianza.\n\nCon SOUL.md, cada respuesta tiene el mismo tono. Sin él, el modelo infiere el tono según el contexto del momento.',
        code: '# Sin SOUL.md:\nInyecta: [SOUL.md: missing]\nResultado: personalidad genérica del modelo base\nProblema: tono inconsistente entre sesiones\n\n# Con SOUL.md:\nLee el archivo completo\nResultado: personalidad específica que definiste\nBeneficio: mismo tono y valores en cada respuesta',
        callout: { type: 'tip', title: 'SOUL.md es un archivo vivo', text: 'A diferencia de configs estáticas, SOUL.md puede evolucionar. Tu agente puede modificar su propio SOUL.md si le das permiso — aprendiendo qué funciona con el tiempo.' },
      },
      {
        title: 'Estructura del archivo',
        subtitle: 'Qué incluir y en qué orden',
        content: 'SOUL.md no tiene un formato obligatorio, pero la comunidad convergió en una estructura que funciona bien. Las secciones más importantes son la prime directive, los valores core, el estilo de comunicación, y los límites.',
        code: '# SOUL.md\n\n## Prime Directive\nSoy [nombre], el agente personal de [usuario].\nMi propósito es [objetivo central].\n\n## Valores core\n- Claridad sobre exhaustividad\n- Honestidad sobre complacencia\n\n## Estilo de comunicación\n- Respuestas cortas por defecto\n- Bullets solo si hay 3+ items\n\n## Límites\n- No ejecutar código sin confirmación',
        callout: { type: 'info', title: 'Estilo por canal', text: 'Podés definir estilos distintos según el canal. WhatsApp: casual y conciso. Email: formal. Slack: técnico. El agente adapta el tono según de dónde llega el mensaje.' },
      },
      {
        title: 'Cómo crear el tuyo',
        subtitle: 'El método más efectivo',
        content: 'La forma más efectiva de escribir SOUL.md no es empezar de cero — es conversar con el agente. Describile cómo querés que se comporte, pedile que proponga un SOUL.md inicial, y refinalo en iteraciones.\n\nEmpezá simple. Un SOUL.md de 20 líneas bien escrito supera a uno de 200 líneas contradictorio.',
        callout: { type: 'tip', title: 'El método más efectivo', text: 'Escribile al agente: "Quiero definir tu personalidad. Te voy a describir cómo quiero que te comportes, y vos me proponés un SOUL.md." La conversación generará algo mejor que lo que podrías escribir directamente.' },
      },
    ],
    quiz: {
      question: 'AGENTS.md y SOUL.md tienen roles distintos. ¿Cuál describe correctamente la diferencia?',
      options: [
        'AGENTS.md = cómo OPERA el agente (rutinas, protocolos). SOUL.md = quién ES el agente (personalidad, valores, tono).',
        'SOUL.md controla las herramientas técnicas habilitadas y AGENTS.md controla la personalidad y el tono.',
        'Son archivos redundantes — OpenClaw usa el que encuentra primero y descarta el otro.',
      ],
      correct: 0,
    },
  },
  {
    number: '05',
    title: 'TOOLS.md',
    subtitle: 'Las manos del agente',
    description: 'TOOLS.md le explica al agente los detalles de tu entorno: qué skills tenés activos, qué convenciones usás, cómo querés que use cada herramienta en tu contexto.',
    color: '#0ea5e9',
    group: 'Arquitectura del agente',
    steps: [
      {
        title: 'Qué es TOOLS.md (y qué NO)',
        subtitle: 'El error más común',
        content: 'TOOLS.md es pura guía en lenguaje natural — notas para el agente sobre cómo usar las herramientas en tu contexto específico. No tiene lógica técnica, no ejecuta nada, y no reemplaza la configuración de openclaw.json.',
        callout: { type: 'warning', title: 'TOOLS.md NO activa ni desactiva herramientas', text: 'Las herramientas reales del sistema (leer archivos, ejecutar comandos, buscar en la web) se configuran en openclaw.json, no acá. TOOLS.md es solo guía contextual.' },
      },
      {
        title: 'Tools vs Skills',
        subtitle: 'La distinción más importante del módulo',
        content: 'OpenClaw separa dos conceptos que parecen lo mismo pero son completamente distintos.\n\nUna herramienta (tool) es una capacidad técnica: ejecutar comandos, leer email, abrir el browser.\n\nUn skill es un manual que le dice al agente cómo y cuándo usar esas herramientas para un workflow específico.',
        code: '# Herramienta (tool): capacidad técnica\nBash    → ejecutar comandos\nGmail   → leer emails\nBrowser → navegar webs\n\n# Skill: manual de uso\nskill "weekly-report" → combina\n  Gmail + Calendar + Bash\n  para armar el reporte semanal',
        callout: { type: 'tip', title: 'La analogía exacta', text: 'Tener la herramienta Bash es como tener Python instalado. Tener un skill es como tener el script que sabe qué comandos correr, en qué orden, y qué hacer si algo falla.' },
      },
      {
        title: 'Cómo escribir TOOLS.md',
        subtitle: 'Estructura, ejemplos y plantillas',
        content: 'TOOLS.md se escribe en Markdown libre. No hay formato obligatorio. Lo importante es que sea específico para tu entorno: nombres reales de servidores, convenciones de tu proyecto, preferencias de modelo por tarea.\n\nSe inyecta en la posición 5 del stack, después de AGENTS.md, SOUL.md, USER.md e IDENTITY.md.',
        code: '# TOOLS.md\n\n## Servidores disponibles\n- prod.miservidor.com (SSH via ~/.ssh/id_prod)\n- staging.miservidor.com (SSH via ~/.ssh/id_staging)\n\n## Convenciones de código\n- Proyecto: ~/proyectos/backend/\n- Branch principal: main\n\n## Modelo preferido por tarea\n- Análisis de datos: gpt-4o\n- Borradores rápidos: gpt-4o-mini',
        callout: { type: 'info', title: 'Su lugar en el stack', text: 'TOOLS.md se carga en posición 5. El agente ya sabe cómo operar, quién es, con quién habla y tiene nombre antes de leer TOOLS.md.' },
      },
      {
        title: 'Mejores prácticas',
        subtitle: 'Qué poner, qué evitar',
        content: 'Las mejores prácticas de TOOLS.md son simples: específico sobre genérico, contexto real sobre instrucciones genéricas, y separación clara de responsabilidades.\n\nLo que más valor agrega: nombres exactos de servidores, paths reales, convenciones del proyecto, y preferencias de modelo para distintas tareas.',
        callout: { type: 'warning', title: 'Errores frecuentes', text: 'No poner: credenciales reales, rutas con datos sensibles, instrucciones de personalidad (eso va en SOUL.md), ni configuración técnica (eso va en openclaw.json).' },
      },
    ],
    quiz: {
      question: '¿Qué hace realmente TOOLS.md? Elegí la descripción correcta.',
      options: [
        'Es guía en lenguaje natural para el agente sobre su entorno. No activa ni desactiva herramientas — eso se hace en openclaw.json.',
        'Es el archivo donde se habilitan o deshabilitan las herramientas del sistema como Bash, Gmail o el navegador web.',
        'Es el archivo que conecta OpenClaw con APIs externas y define las credenciales de cada integración.',
      ],
      correct: 0,
    },
  },
  {
    number: '06',
    title: 'USER.md + IDENTITY.md',
    subtitle: 'Quién sos vos y quién es él',
    description: 'USER.md le dice al agente quién sos vos. IDENTITY.md define cómo se presenta el agente — su nombre, emoji, tagline. Son archivos complementarios con roles completamente distintos.',
    color: '#7c3aed',
    group: 'Arquitectura del agente',
    steps: [
      {
        title: 'USER.md — Quién sos vos',
        subtitle: 'Contexto del usuario para el agente',
        content: 'USER.md le dice al agente quién sos. Con esta información puede personalizar respuestas, respetar tu zona horaria para tareas programadas, adaptar el nivel técnico de sus explicaciones, y recordar tus proyectos activos sin que tengas que repetírselos.',
        code: '# USER.md\n\n## Identidad\nNombre: Alan\nZona horaria: America/Buenos_Aires\nRol: Product Designer / Developer\n\n## Proyectos activos\n- Portfolio: github.com/usuario/portfolio\n- Cliente X: fase de rediseño UX\n\n## Preferencias\n- Idioma: español rioplatense\n- Respuestas: concisas, sin bullet spam\n- Código: TypeScript preferido',
        callout: { type: 'tip', title: 'Qué incluir', text: 'Lo más valioso en USER.md: zona horaria exacta (para cron jobs), proyectos activos con contexto, preferencias de comunicación, y convenciones personales que usés constantemente.' },
      },
      {
        title: 'IDENTITY.md — Quién es el agente',
        subtitle: 'El nombre y presentación del agente',
        content: 'IDENTITY.md define cómo se llama y presenta tu agente. Es un archivo simple pero que tiene impacto en cómo se siente interactuar con él.\n\nA diferencia de SOUL.md (que define quién es internamente), IDENTITY.md define cómo se presenta hacia afuera.',
        code: '# IDENTITY.md\n\nNombre: Kero\nEmoji: 🦊\nTagline: "Tu agente en OpenAgent.lat"\n\n## Por canal\nWhatsApp: "Hola, soy Kero 🦊"\nTelegram: "@kero_bot — agente personal"\nEmail:    "Kero — Asistente de [Usuario]"\n\n## Tono de presentación\nCasual en mensajería directa\nFormal en respuestas a terceros',
        callout: { type: 'info', title: 'Presentación vs identidad profunda', text: 'IDENTITY.md es la tarjeta de presentación. SOUL.md es la personalidad real. Son complementarios: IDENTITY.md dice cómo se llama, SOUL.md dice cómo piensa y actúa.' },
      },
      {
        title: 'Cascada de resolución',
        subtitle: 'Cuándo tiene prioridad cada archivo',
        content: 'OpenClaw resuelve la identidad del agente en cascada: primero mira la config global (openclaw.json), luego la config del agente específico, y finalmente el IDENTITY.md del workspace.',
        code: 'Orden de resolución:\n1. openclaw.json    → "name": "global-override"\n2. Agente específico → config del agente\n3. IDENTITY.md       ← la mayoría llega acá\n\nSi ninguno define el nombre:\n→ Se usa el nombre de la carpeta del workspace',
        callout: { type: 'tip', title: 'Multi-agente', text: 'Si tenés múltiples agentes, podés tener un USER.md global compartido e IDENTITY.md distintos por agente. Mismo contexto de usuario, distintas presentaciones.' },
      },
      {
        title: 'Cuándo NO cargarlos',
        subtitle: 'Contextos de aislamiento',
        content: 'USER.md y IDENTITY.md se cargan por defecto en sesiones privadas. Pero en grupos o agentes públicos puede ser problemático — la info personal no debería estar disponible para otros participantes del grupo.\n\nLa configuración de qué archivos cargar en qué contextos va en openclaw.json.',
        callout: { type: 'warning', title: 'Cuidado en grupos', text: 'En grupos de WhatsApp o Telegram, USER.md se carga por defecto pero puede contener información personal que no querés compartir con otros. Configurá context_isolation en openclaw.json.' },
      },
    ],
    quiz: {
      question: '¿Qué información va en USER.md versus IDENTITY.md?',
      options: [
        'USER.md = quién sos vos (nombre, zona horaria, proyectos). IDENTITY.md = cómo se presenta el agente (nombre, emoji, tagline).',
        'USER.md es para el username técnico del sistema e IDENTITY.md para la contraseña de autenticación del agente.',
        'Son el mismo archivo con diferentes nombres — solo se usa el que OpenClaw encuentra primero en el workspace.',
      ],
      correct: 0,
    },
  },
  {
    number: '07',
    title: 'MEMORY.md',
    subtitle: 'El agente solo recuerda lo que está escrito en disco',
    description: 'La memoria de OpenClaw no es mágica ni automática. El agente solo recuerda lo que en algún momento se escribió en un archivo Markdown.',
    color: '#0f766e',
    group: 'Sistema avanzado',
    steps: [
      {
        title: 'El principio fundamental',
        subtitle: 'Cada sesión arranca desde cero',
        content: 'Antes de entender cómo funcionan los archivos, hay un concepto que lo cambia todo: el agente no recuerda nada que no esté escrito en disco.\n\nCada sesión arranca desde cero. El agente lee sus archivos de workspace y recién ahí "sabe" algo. Lo que pasó en conversaciones anteriores existe únicamente si en algún momento se escribió en un archivo Markdown.',
        callout: { type: 'warning', title: 'No hay base de datos oculta', text: 'La memoria de OpenClaw son archivos de texto plano que podés abrir, editar y borrar con cualquier editor. No hay entrenamiento adicional. No hay memoria mágica. Solo archivos.' },
      },
      {
        title: 'Dos tipos de memoria',
        subtitle: 'Diario diario vs memoria curada',
        content: 'OpenClaw tiene dos capas de memoria con propósitos completamente distintos.\n\n`memory/YYYY-MM-DD.md` es el diario del día — automático, ruidoso, de corto alcance.\n\n`MEMORY.md` es la memoria de largo plazo — curada, compacta, durable. Solo se carga en sesión privada, nunca en grupos.',
        code: 'memory/2025-03-07.md  ← Diario de HOY\n  Automático, ruidoso, de corto alcance\n  El agente escribe aquí durante el día\n\nMEMORY.md             ← Memoria curada\n  Manual (el agente con tu permiso)\n  Compacta, durable, siempre disponible\n  Solo en sesión privada',
        callout: { type: 'info', title: 'Quién escribe MEMORY.md', text: 'MEMORY.md lo escribe el agente, no vos directamente. Vos le decís "recordá esto" y él decide cómo formularlo para que sea útil a futuro. También podés editarlo manualmente.' },
      },
      {
        title: 'El ciclo completo de memoria',
        subtitle: 'Cómo viaja la info de conversación a long-term',
        content: 'Una pieza de información viaja desde una conversación hasta la memoria de largo plazo en 4 etapas.\n\n1. Durante la conversación, el agente trabaja en RAM — no persiste.\n2. Cuando la sesión se acerca al límite de contexto, ocurre un memory flush automático.\n3. Los diarios acumulan el registro del día.\n4. Con el tiempo, lo más valioso se cura en MEMORY.md — la capa que permanece indefinidamente.',
        callout: { type: 'tip', title: 'Pedile que recuerde', text: 'Si querés que algo quede en MEMORY.md, pedíselo explícitamente: "Recordá que prefiero TypeScript sobre JavaScript para este proyecto." El agente lo curará en el archivo de memoria curada.' },
      },
      {
        title: 'Límites y estrategia de poda',
        subtitle: 'Cómo evitar saturar el contexto',
        content: 'MEMORY.md se inyecta en el system prompt en cada sesión privada. Si crece demasiado, consume tokens que podrían usarse para conversación.\n\nLa regla práctica: MEMORY.md debería tener la información más duradera y de mayor impacto. Detalles efímeros van en los diarios y se descartan naturalmente.',
        callout: { type: 'warning', title: 'Señal para actualizar', text: 'Si MEMORY.md supera las 200-300 líneas, es momento de una sesión de "limpieza de memoria". Le pedís al agente que lo revise y descarte lo que ya no es relevante.' },
      },
    ],
    quiz: {
      question: 'Si querés que el agente recuerde algo importante a largo plazo, ¿qué tenés que hacer?',
      options: [
        'Pedirle al agente que lo escriba en MEMORY.md, porque el agente solo recuerda lo que está escrito en disco.',
        'Repetírselo al principio de cada conversación nueva para que lo tenga disponible en el contexto.',
        'Activar la memoria automática en openclaw.json para que el agente recuerde todas las conversaciones.',
      ],
      correct: 0,
    },
  },
  {
    number: '08',
    title: 'HEARTBEAT.md',
    subtitle: 'El agente que actúa sin que lo pidas',
    description: 'HEARTBEAT.md define las tareas proactivas periódicas: qué revisar, cuándo actuar, y cuándo quedarse en silencio. Convierte al agente de reactivo a autónomo.',
    color: '#dc2626',
    group: 'Sistema avanzado',
    steps: [
      {
        title: 'Cómo funciona el heartbeat',
        subtitle: 'El ciclo periódico de OpenClaw',
        content: 'OpenClaw ejecuta un ciclo de heartbeat cada ~30 minutos (configurable). En cada ciclo, el agente lee HEARTBEAT.md y ejecuta las condiciones definidas.\n\nSi algo necesita atención, el agente actúa y te notifica. Si no hay nada, se queda en silencio. Nunca molesta sin razón.',
        callout: { type: 'info', title: 'La diferencia con un cron job', text: 'Un cron job siempre ejecuta en el horario definido. El heartbeat ejecuta el ciclo, pero el agente decide si hay algo que hacer. La condición "si hay emails urgentes" no se activa si no hay nada urgente.' },
      },
      {
        title: 'Estructura del checklist',
        subtitle: 'Condiciones, acciones y reglas de silencio',
        content: 'HEARTBEAT.md tiene tres secciones clave: las condiciones de activación, las acciones correspondientes, y las reglas de silencio.\n\nLas reglas de silencio son tan importantes como las condiciones — sin ellas, el agente se convierte en ruido.',
        code: '# HEARTBEAT.md\n\n## Checklist cada 30 min\n\n### Email\n- Si hay emails urgentes sin leer → notificar\n- Si hay facturas vencidas → alertar\n\n### Calendario\n- Si hay reunión en < 15 min → recordar\n\n## Reglas de silencio\n- No molestar entre 23:00 y 08:00\n- No molestar si mandé mensaje en < 2h\n- Batching: acumular y mandar 1 resumen',
        callout: { type: 'tip', title: 'Empezá con poco', text: 'Un HEARTBEAT.md con 3-4 condiciones bien definidas es infinitamente mejor que uno con 20 que genera ruido. Cada condición que agregás multiplica el riesgo de falsos positivos.' },
      },
      {
        title: 'Control de token burn',
        subtitle: 'Por qué este archivo debe ser brevísimo',
        content: 'HEARTBEAT.md se ejecuta en cada ciclo del heartbeat. Si tiene 500 tokens, eso es 500 tokens × (ciclos por día) tokens gastados solo en chequear condiciones, aunque no haya nada que hacer.\n\nLa regla de oro: HEARTBEAT.md debería tener menos de 50 líneas.',
        callout: { type: 'warning', title: 'El riesgo del heartbeat detallado', text: 'Un HEARTBEAT.md largo es costoso y lento. Keepealo mínimo: condición → acción. Sin explicaciones largas. Sin contexto redundante.' },
      },
      {
        title: 'Patrones avanzados',
        subtitle: 'Heartbeat condicional, escalamiento, canvas updates',
        content: 'Con la base bien configurada, podés implementar patrones más sofisticados: heartbeat condicional (solo ciertos días u horarios), escalamiento (si no hay respuesta después de X, escalá), y canvas updates (el agente actualiza un documento compartido periódicamente).\n\nEstos patrones combinan HEARTBEAT.md con skills y tools específicos.',
        callout: { type: 'tip', title: 'Heartbeat + Skills', text: 'La combinación más poderosa es HEARTBEAT.md como trigger + un skill como ejecutor. El heartbeat detecta la condición; el skill define exactamente cómo responder.' },
      },
    ],
    quiz: {
      question: '¿Qué tipo de tareas va en HEARTBEAT.md?',
      options: [
        'Tareas proactivas periódicas — cosas que el agente hace por su cuenta según condiciones definidas, sin que vos le pidas.',
        'El historial de conversaciones del día actual, que el agente guarda automáticamente para consultas futuras.',
        'Las reglas de seguridad del sistema que OpenClaw aplica en cada sesión y no se pueden modificar.',
      ],
      correct: 0,
    },
  },
  {
    number: '09',
    title: 'Skills',
    subtitle: 'Enseñale a tu agente a hacer cualquier cosa',
    description: 'Un skill es un playbook — un manual de instrucciones empaquetado que le enseña al agente cómo usar herramientas, llamar APIs, o seguir un proceso específico de forma consistente.',
    color: '#4f46e5',
    group: 'Sistema avanzado',
    steps: [
      {
        title: 'Qué es un skill',
        subtitle: 'La distinción crítica: herramientas vs skills',
        content: 'Todo lo que vimos hasta ahora define cómo el agente es. Los skills definen qué puede hacer más allá de sus capacidades base.\n\nUn skill no es un plugin que ejecuta código solo. No es una integración técnica. Es una carpeta con un archivo Markdown que el agente lee cuando necesita hacer esa tarea.',
        callout: { type: 'info', title: 'La analogía exacta', text: 'Tener la herramienta Bash es como tener Python instalado. Tener un skill es como tener el script que sabe qué comandos correr, en qué orden, con qué parámetros, y qué hacer si algo falla. Sin el skill, el agente improvisa. Con el skill, sigue el mismo proceso confiable siempre.' },
      },
      {
        title: 'Estructura de SKILL.md',
        subtitle: 'Frontmatter, prompt y guardrails',
        content: 'Cada skill vive en una carpeta dentro del workspace, con un archivo `SKILL.md` como núcleo. La estructura tiene tres partes: el frontmatter (metadatos), el prompt principal (las instrucciones), y los guardrails (qué no hacer).',
        code: '---\nname: weekly-report\ndescription: Genera el reporte semanal\ntrigger: "reporte semanal"\ntools: [bash, gmail, calendar]\n---\n\n# Weekly Report\n\n## Proceso\n1. Leer emails de la semana (Gmail)\n2. Revisar calendario de la semana\n3. Correr: git log --since="7 days ago"\n4. Generar resumen en formato definido\n\n## Guardrails\n- No enviar el reporte sin aprobación\n- Si falta alguna fuente, decirlo',
        callout: { type: 'tip', title: 'El frontmatter es clave', text: 'El campo "trigger" define qué frases activan el skill automáticamente. Si escribís "reporte semanal", el agente detecta que debe usar ese skill en lugar de improvisar.' },
      },
      {
        title: 'Sistema de gating',
        subtitle: 'Activar skills condicionalmente',
        content: 'No todos los skills deberían estar disponibles en todos los contextos. El sistema de gating permite activar skills condicionalmente según: el canal, el usuario que habla, variables de entorno presentes, u horario.',
        code: '---\nname: deploy-production\ngating:\n  env: [DEPLOY_KEY]\n  users: ["alan"]\n  hours: "9-18"\n  channels: ["telegram"]\n---\n\n# Deploy a producción\nSolo disponible si:\n- Está configurada la variable DEPLOY_KEY\n- El usuario es "alan"\n- Es entre 9am y 6pm\n- El mensaje viene de Telegram',
        callout: { type: 'warning', title: 'Seguridad por gating', text: 'Para skills que ejecutan acciones irreversibles (deploy, borrar archivos, enviar emails masivos), siempre poné gating estricto por usuario y horario.' },
      },
      {
        title: 'Crear tu primer skill',
        subtitle: 'Paso a paso con ejemplo real',
        content: 'El mejor primer skill es algo que ya hacés repetidamente pero que es lo suficientemente estructurado para documentarlo. Candidatos: el brief del día, la rutina de inicio, o el proceso de revisión de código.\n\nEmpezá simple: un skill de 10-15 líneas que hace una cosa bien supera a uno de 100 líneas que intenta hacerlo todo.',
        code: '# Crear el directorio del skill\nmkdir ~/.openclaw/workspace/skills/daily-brief\ntouch ~/.openclaw/workspace/skills/daily-brief/SKILL.md\n\n# Estructura mínima:\n---\nname: daily-brief\ndescription: Brief de inicio del día\ntrigger: "qué tengo hoy"\n---\n\n# Brief del día\n1. Revisar calendario de hoy\n2. Leer emails sin leer\n3. Listar top 3 tareas del día',
        callout: { type: 'info', title: 'ClawHub para skills comunitarios', text: 'Antes de escribir un skill desde cero, revisá ClawHub (clawhub.dev) — el repositorio comunitario. Probablemente alguien ya resolvió lo que necesitás. Leé el skill antes de instalarlo.' },
      },
    ],
    quiz: {
      question: '¿Cuál es la diferencia exacta entre una herramienta (tool) y un skill en OpenClaw?',
      options: [
        'Una herramienta es una capacidad técnica (ejecutar Bash, leer email). Un skill es un manual que le dice al agente cómo y cuándo usar esas herramientas para un workflow específico.',
        'Los skills son herramientas de pago disponibles en ClawHub y las tools son las gratuitas incluidas en OpenClaw.',
        'No hay diferencia real — son términos intercambiables que OpenClaw usa según la versión del software.',
      ],
      correct: 0,
    },
  },
];

// ─────────────────────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative mt-4 rounded-lg bg-black border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs text-white/30 font-mono">terminal</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-emerald-400/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
    </div>
  );
};

const CalloutBlock: React.FC<{ callout: Callout }> = ({ callout }) => {
  const variants = {
    warning: { bg: 'bg-amber-950/40', border: 'border-amber-500/30', label: 'text-amber-400', Icon: AlertTriangle },
    tip: { bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', label: 'text-emerald-400', Icon: Lightbulb },
    info: { bg: 'bg-blue-950/40', border: 'border-blue-500/30', label: 'text-blue-400', Icon: Info },
  };
  const v = variants[callout.type];
  return (
    <div className={`mt-4 rounded-lg border ${v.bg} ${v.border} p-4`}>
      <div className={`flex items-center gap-2 mb-1.5 font-semibold text-xs uppercase tracking-wide ${v.label}`}>
        <v.Icon size={13} />
        {callout.title}
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{callout.text}</p>
    </div>
  );
};

const StepProgress: React.FC<{ total: number; current: number; color: string; quizDone?: boolean }> = ({
  total, current, color, quizDone,
}) => (
  <div className="flex items-center gap-0 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          className="relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
          style={{
            backgroundColor: i < current || quizDone ? color : i === current ? color : 'rgba(255,255,255,0.08)',
            color: i <= current || quizDone ? '#fff' : 'rgba(255,255,255,0.25)',
            border: `2px solid ${i <= current || quizDone ? color : 'rgba(255,255,255,0.1)'}`,
            opacity: i < current || quizDone ? 1 : i === current ? 1 : 0.5,
          }}
        >
          {i < current || quizDone ? <Check size={11} /> : i + 1}
        </div>
        {i < total - 1 && (
          <div
            className="h-px flex-1 transition-all duration-300"
            style={{ backgroundColor: i < current || quizDone ? color : 'rgba(255,255,255,0.08)' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const QuizSection: React.FC<{
  quiz: Quiz;
  onComplete: () => void;
  color: string;
  alreadyCompleted?: boolean;
}> = ({ quiz, onComplete, color, alreadyCompleted }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (alreadyCompleted) {
    return (
      <div className="mt-6 border border-emerald-800/40 rounded-xl p-5 bg-emerald-950/20 flex items-center gap-3">
        <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-400">Módulo completado</p>
          <p className="text-xs text-white/40 mt-0.5">Podés releer el contenido cuando quieras.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selected === null) return;
    const correct = selected === quiz.correct;
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) setTimeout(onComplete, 1200);
  };

  return (
    <div className="mt-6 border border-white/10 rounded-xl p-5 bg-white/[0.03]">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
          style={{ backgroundColor: color }}
        >?</div>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Check de conocimiento</span>
      </div>
      <p className="text-sm text-white/90 font-medium mb-4 leading-relaxed">{quiz.question}</p>
      <div className="space-y-2.5 mb-4">
        {quiz.options.map((option, i) => (
          <button
            key={i}
            onClick={() => !submitted && setSelected(i)}
            disabled={submitted}
            className={`w-full text-left p-3 rounded-lg border text-sm leading-relaxed transition-all ${
              submitted
                ? i === quiz.correct
                  ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                  : selected === i && !isCorrect
                  ? 'border-red-500/60 bg-red-950/40 text-red-300'
                  : 'border-white/5 text-white/30'
                : selected === i
                ? 'border-white/40 bg-white/10 text-white'
                : 'border-white/10 text-white/65 hover:border-white/25 hover:bg-white/5'
            }`}
          >
            <span className="text-xs font-mono mr-2 text-white/25">{String.fromCharCode(65 + i)}.</span>
            {option}
          </button>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: selected !== null ? color : 'rgba(255,255,255,0.1)' }}
        >
          Verificar respuesta
        </button>
      ) : isCorrect ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle size={15} />
          <span className="text-sm font-medium">¡Correcto! Desbloqueando siguiente módulo…</span>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-red-400/80">Respuesta incorrecta. Revisá el contenido del módulo arriba.</p>
          <button
            onClick={() => { setSelected(null); setSubmitted(false); setIsCorrect(false); }}
            className="px-4 py-2 rounded-lg text-sm border border-white/15 text-white/60 hover:border-white/30 hover:text-white transition-all"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MODULE CARD
// ─────────────────────────────────────────────────────────────

const ModuleCard: React.FC<{
  module: Module;
  index: number;
  isLocked: boolean;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
}> = ({ module, index, isLocked, isCompleted, isExpanded, onToggle, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const step = module.steps[currentStep];

  const handleNext = () => {
    if (currentStep < module.steps.length - 1) {
      setCurrentStep(p => p + 1);
    } else {
      setShowQuiz(true);
    }
  };
  const handlePrev = () => {
    if (showQuiz) setShowQuiz(false);
    else if (currentStep > 0) setCurrentStep(p => p - 1);
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isLocked
          ? 'border-white/5 opacity-40'
          : isCompleted
          ? 'border-white/15'
          : 'border-white/10'
      } bg-white/[0.02] overflow-hidden`}
    >
      {/* Header / trigger */}
      <button
        onClick={!isLocked ? onToggle : undefined}
        disabled={isLocked}
        className={`w-full flex items-center gap-4 p-4 text-left transition-all ${
          isLocked ? 'cursor-not-allowed' : 'hover:bg-white/[0.04] cursor-pointer'
        }`}
      >
        {/* Number badge */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white"
          style={{ backgroundColor: isLocked ? 'rgba(255,255,255,0.04)' : module.color }}
        >
          {isLocked ? (
            <Lock size={15} className="text-white/20" />
          ) : isCompleted ? (
            <Check size={19} />
          ) : (
            module.number
          )}
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: isLocked ? 'rgba(255,255,255,0.15)' : module.color }}
          >
            Módulo {module.number}
          </div>
          <h3 className={`font-bold text-base leading-tight ${isLocked ? 'text-white/20' : 'text-white'}`}>
            {module.title}
          </h3>
          <p className={`text-xs mt-0.5 leading-relaxed ${isLocked ? 'text-white/12' : 'text-white/45'}`}>
            {module.subtitle}
          </p>
        </div>

        {/* Right side */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {isCompleted && (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check size={10} className="text-emerald-400" />
            </div>
          )}
          {!isLocked && (
            <ChevronDown
              size={15}
              className={`text-white/25 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {isExpanded && !isLocked && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 border-t border-white/5 pt-4">
              {/* Step progress */}
              <StepProgress
                total={module.steps.length}
                current={currentStep}
                color={module.color}
                quizDone={isCompleted || (showQuiz && false)}
              />

              {!showQuiz ? (
                <>
                  {/* Step header */}
                  <div className="mb-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-1">
                      Paso {currentStep + 1} / {module.steps.length}
                    </div>
                    <h4 className="text-lg font-bold text-white leading-tight">{step.title}</h4>
                    {step.subtitle && (
                      <p className="text-sm text-white/45 italic mt-0.5">{step.subtitle}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    {step.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm text-white/72 leading-relaxed">{para}</p>
                    ))}
                  </div>
                  {step.code && <CodeBlock code={step.code} />}
                  {step.callout && <CalloutBlock callout={step.callout} />}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <button
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white disabled:opacity-0 transition-colors"
                    >
                      <ArrowLeft size={13} /> Anterior
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: module.color }}
                    >
                      {currentStep < module.steps.length - 1 ? 'Siguiente' : 'Verificar conocimiento'}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <QuizSection
                    quiz={module.quiz}
                    onComplete={onComplete}
                    color={module.color}
                    alreadyCompleted={isCompleted}
                  />
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
                    >
                      <ArrowLeft size={13} /> Volver al último paso
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

const GROUPS = [
  { name: 'Fundamentos', indices: [0, 1, 2] },
  { name: 'Arquitectura del agente', indices: [3, 4, 5, 6] },
  { name: 'Sistema avanzado', indices: [7, 8, 9] },
];

const GuiaPage: React.FC = () => {
  const [completedModules, setCompletedModules] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('openclaw-guide-v1');
      return saved ? new Set<number>(JSON.parse(saved)) : new Set<number>();
    } catch {
      return new Set<number>();
    }
  });
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('openclaw-guide-v1', JSON.stringify([...completedModules]));
  }, [completedModules]);

  const isLocked = (i: number) => i > 0 && !completedModules.has(i - 1);

  const handleToggle = (i: number) =>
    setExpandedModule(prev => (prev === i ? null : i));

  const handleComplete = (i: number) => {
    setCompletedModules(prev => new Set([...prev, i]));
    if (i < MODULES.length - 1) {
      setTimeout(() => setExpandedModule(i + 1), 600);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Reiniciar todo el progreso?')) {
      setCompletedModules(new Set());
      setExpandedModule(null);
      localStorage.removeItem('openclaw-guide-v1');
    }
  };

  const total = completedModules.size;
  const allDone = total === MODULES.length;

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── HERO ─────────────────────────────── */}
      <div className="border-b border-white/5 px-6 pt-16 pb-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-5">
            Guía OpenClaw · KeroClow · www.openagent.lat
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight text-white mb-4">
            Guía Completa<br />
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>de OpenClaw</span>
          </h1>
          <p className="text-lg text-white/55 mb-8 max-w-md leading-relaxed">
            De cero a experto. 10 módulos. Instalación hasta Skills.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full border border-white/10 text-xs text-white/35">KeroClow</span>
            <span className="px-3 py-1 rounded-full border border-white/10 text-xs text-white/35">www.openagent.lat</span>
            {total > 0 && (
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/60 text-xs text-emerald-400">
                {total}/{MODULES.length} módulos completados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── INTRO ARTICLE ────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-14">

        <div className="grid md:grid-cols-[190px_1fr] gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white/70 leading-snug">Por qué<br />esta guía</h2>
          </div>
          <div className="space-y-4 text-white/60 text-sm leading-relaxed">
            <p className="italic text-white/50">"Instalé OpenClaw. Ahora, ¿qué hago con todos estos archivos?"</p>
            <p>Es la pregunta que hace todo el mundo al arrancar. Tenés un workspace vacío, la documentación oficial explica cada archivo por separado, y no queda claro en qué orden leer ni cuánto importa cada cosa.</p>
            <p>Esta guía existe para resolver eso. Cubre todos los archivos del workspace de principio a fin, en el orden que tiene sentido. Cada módulo es independiente — podés leerlos en orden o ir directamente al archivo que necesitás configurar.</p>
          </div>
        </div>

        <hr className="border-white/[0.06]" />

        <div className="grid md:grid-cols-[190px_1fr] gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white/70 leading-snug">Qué vas<br />a aprender</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-white/60 leading-relaxed">
              10 módulos con pasos concretos, ejemplos reales, y un check de conocimiento al final de cada uno.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {[
                { label: 'Fundamentos', items: ['Instalación', 'openclaw.json', 'Workspace'], color: '#6366f1' },
                { label: 'Arquitectura', items: ['AGENTS.md', 'SOUL.md', 'TOOLS.md', 'USER + IDENTITY'], color: '#db2777' },
                { label: 'Sistema avanzado', items: ['MEMORY.md', 'HEARTBEAT.md', 'Skills'], color: '#4f46e5' },
              ].map(g => (
                <div key={g.label} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: g.color }}>{g.label}</div>
                  <ul className="space-y-1">
                    {g.items.map(item => <li key={item} className="text-xs text-white/45">{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-white/[0.06]" />

        <div className="grid md:grid-cols-[190px_1fr] gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white/70 leading-snug">Cómo<br />funciona</h2>
          </div>
          <div className="space-y-4 text-sm text-white/60 leading-relaxed">
            <p>Cada módulo tiene pasos numerados con contenido concreto — no teoría abstracta, sino qué escribir y por qué. Los bloques de código tienen botón de copiar.</p>
            <p>Al final de cada módulo hay un check de conocimiento de una sola pregunta. Necesitás responderla correctamente para desbloquear el siguiente módulo. Si no recordás la respuesta, el contenido está justo arriba.</p>
            <p>Tu progreso se guarda en este navegador. Podés cerrar y volver cuando quieras.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* ── MODULES SECTION ──────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-white/15" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">MÓDULOS</p>
              <p className="text-sm text-white/40 mt-0.5">{total} de {MODULES.length} completados</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress bar */}
            <div className="w-28 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(total / MODULES.length) * 100}%` }}
              />
            </div>
            {total > 0 && (
              <button
                onClick={handleReset}
                className="text-xs text-white/20 hover:text-white/50 transition-colors"
                title="Reiniciar progreso"
              >
                Reiniciar
              </button>
            )}
          </div>
        </div>

        {/* Groups + cards */}
        <div className="space-y-14">
          {GROUPS.map(group => (
            <div key={group.name} className="grid md:grid-cols-[190px_1fr] gap-6 items-start">
              <div className="md:sticky md:top-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">MÓDULOS</p>
                <h3 className="text-lg md:text-xl font-bold text-white/60 leading-snug">{group.name}</h3>
              </div>
              <div className="space-y-3">
                {group.indices.map(idx => (
                  <ModuleCard
                    key={idx}
                    module={MODULES[idx]}
                    index={idx}
                    isLocked={isLocked(idx)}
                    isCompleted={completedModules.has(idx)}
                    isExpanded={expandedModule === idx}
                    onToggle={() => handleToggle(idx)}
                    onComplete={() => handleComplete(idx)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* All done */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-20 text-center p-10 rounded-2xl border border-emerald-800/40 bg-emerald-950/20"
            >
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Guía completada!</h3>
              <p className="text-white/55 text-sm max-w-sm mx-auto leading-relaxed">
                Completaste los 10 módulos de la Guía OpenClaw. Tenés el conocimiento para configurar y personalizar tu agente de principio a fin.
              </p>
              <a
                href="https://www.openagent.lat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
              >
                Ver más en openagent.lat <ArrowRight size={14} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER ───────────────────────────── */}
      <div className="border-t border-white/[0.06] mt-8 py-8 px-6 text-center">
        <p className="text-xs text-white/20">
          Guía OpenClaw · KeroClow ·{' '}
          <a href="https://www.openagent.lat" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">
            www.openagent.lat
          </a>
        </p>
      </div>
    </div>
  );
};

export default GuiaPage;
