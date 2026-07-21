# CALCULATOR with Currency Converter and The Weather

## Stack Tecnológico

* Framework: Angular
* Llamadas API: Axios
* LocalStorage: Pinia
* Test unitarios: Vitest y e2e Playwright
* CSS: Libre- Bootstrap, Vuetify o cualquier otra libreria CSS

APIS a trabajar:
Conversor monedas: https://currencyfreaks.com/
Tiempo: https://www.el-tiempo.net/api

---

## Descripción de Ejercicio

**Objetivo:**

Crear una calculadora multifuncional con el framework VUE.

**Requisitos mínimos Calculadora:**

La calculadora deberá poder realizar las operaciones básicas: suma, resta, multiplica, división

**Teclas obligatorias:**
- númericas del 0 al 9
- suma, resta, multiplicar, división
- signo "igual"
- signo "." para la coma
- CE (para resetear)
- Control de errores

**​Requisitos mínimos Conversor de Divisas:**

Deberá estar integrado en la calculadora
Divisas a utilizar : Euro (€), Dólar ($), Yen (¥)
Se deberá utilizar la siguiente API: https://currencyfreaks.com/

**Requisitos mínimos - El Tiempo:**

Se deberá utilizar la siguiente API: https://www.el-tiempo.net/api
Mostrar una imagen en función del "StateSky"
Se puede elegir entre la información nacional o de una provincia (Asturias)

**Requisitos de desarrollo:**

- Mobil First
- Usar Axios para realizar llamadas API
- Tests unitario
- Tests e2e
- Extras de calculadora:

Tecla M+ para poner en memoria el número actual (se deberá utilizar Pinia para almacenar la info)
Tecla MR para recuperar el dato almacenado
Tecla MC para borrar los datos guardados en memoria
Stack a utilizar:

Se deberá realizar la aplicación con Vue 3, para los test unitarios Vitest  y e2e Playwright. Se podrá utilizar Bootstrap, Vuetify o cualquier otra librería CSS.

**Nota:** Todos los elementos deberían estar presentes en una sola vista.

## Herramientas de desarrollo asistido por IA

Este proyecto incluye guardarraíles y prompts para asistentes de código (Codex, GitHub
Copilot, Continue + Ollama). Convenciones completas en [`AGENTS.md`](./AGENTS.md); guía de
instalación/activación por herramienta en [`docs/LLM_SETUP.md`](./docs/LLM_SETUP.md).


## Entregables:
Enlace al repositorio de GitHub
Enlace a la aplicación desplegada en GitHub Pages

---


angular-calculator
├─ .angular                          # Caché interna del CLI de Angular (no tocar)
├─ .claude
│  └─ settings.local.json            # Config local de Claude (ignorada por git)
├─ .editorconfig                     # Reglas de formato del editor (indentación, charset…)
├─ .postcssrc.json                   # Config de PostCSS para integrar Tailwind CSS v4
├─ .prettierrc                       # Reglas de formateo automático de código
├─ angular.json                      # Config central del CLI: build, serve, test
├─ Angular_learning.md               # Notas de aprendizaje Angular del desarrollador
├─ CLAUDE.md                         # Instrucciones del proyecto para el agente de IA
├─ package-lock.json                 # Árbol de dependencias exacto (reproducibilidad)
├─ package.json                      # Dependencias y scripts npm del proyecto
├─ project-plan.md                   # Plan de fases del proyecto (actualmente desactualizado)
├─ public
│  ├─ assets
│  │  └─ icons                       # SVGs meteorológicos servidos como assets estáticos
│  │     ├─ cloudy.svg               # Icono: nublado
│  │     ├─ fog.svg                  # Icono: niebla
│  │     ├─ overcast.svg             # Icono: muy nublado
│  │     ├─ partly-cloudy.svg        # Icono: parcialmente nublado
│  │     ├─ rain.svg                 # Icono: lluvia
│  │     ├─ snow.svg                 # Icono: nieve
│  │     ├─ storm.svg                # Icono: tormenta
│  │     └─ sunny.svg                # Icono: soleado
│  └─ favicon.ico                    # Icono de la pestaña del navegador
├─ README.md                         # Documentación pública del proyecto
├─ src
│  ├─ app
│  │  ├─ app.config.ts               # Bootstrap: registra Router, HttpClient y error listeners
│  │  ├─ app.html                    # Shell raíz: header + <router-outlet> + footer
│  │  ├─ app.routes.ts               # Tabla de rutas de la aplicación (actualmente vacía)
│  │  ├─ app.spec.ts                 # Test: verifica que header, router-outlet y footer renderizan
│  │  ├─ app.ts                      # Componente raíz que compone el shell de la aplicación
│  │  ├─ features
│  │  │  └─ pages                    # Vistas completas asociadas a rutas
│  │  │     ├─ home-page
│  │  │     │  └─ home-view
│  │  │     │     ├─ home-view.html  # Layout de la home: coloca Calculator y Conversor
│  │  │     │     ├─ home-view.spec.ts # Test de creación del componente home-view
│  │  │     │     └─ home-view.ts    # Componente contenedor de la página principal
│  │  │     └─ weather
│  │  │        └─ weather-view
│  │  │           ├─ weather-view.html # UI del tiempo: selector provincia/nacional + lista ciudades
│  │  │           ├─ weather-view.spec.ts # Test de creación del componente weather-view
│  │  │           └─ weather-view.ts # Componente que consume WeatherService y gestiona el modo
│  │  └─ shared                      # Piezas reutilizables entre features
│  │     ├─ components               # Componentes UI atómicos
│  │     │  ├─ calculator
│  │     │  │  ├─ calculator.html    # Grid de botones (CE, operadores, dígitos, =)
│  │     │  │  ├─ calculator.spec.ts # Test de creación del componente (smoke test)
│  │     │  │  └─ calculator.ts      # Lógica completa: inputDigit, setOperator, calculate, clear
│  │     │  ├─ conversor
│  │     │  │  ├─ conversor.html     # Formulario: cantidad + selects de divisa + resultado
│  │     │  │  ├─ conversor.spec.ts  # Test de creación del componente (smoke test)
│  │     │  │  └─ conversor.ts       # Consume CurrencyService; computed para el importe convertido
│  │     │  ├─ logo-header
│  │     │  │  ├─ logo-header.html   # Logotipo SVG + "Calcu" (bold azul) + "Weather" (light gris)
│  │     │  │  ├─ logo-header.spec.ts # Test de creación del componente logo
│  │     │  │  └─ logo-header.ts     # Componente presentacional del logo de la app
│  │     │  └─ nav-header
│  │     │     ├─ nav-header.html    # Lista <nav><ul> con enlaces Calculator y Weather
│  │     │     ├─ nav-header.spec.ts # Test de creación del componente nav
│  │     │     └─ nav-header.ts      # Componente de navegación principal (usa SITE_NAV_LINK_CLASSES)
│  │     ├─ footer-component
│  │     │  ├─ footer-component.html # Pie de página de la aplicación
│  │     │  ├─ footer-component.spec.ts # Test de creación del footer
│  │     │  └─ footer-component.ts   # Componente presentacional del pie de página
│  │     ├─ header-component
│  │     │  ├─ header-component.html # Barra superior: flex con logo a la izquierda y nav a la derecha
│  │     │  ├─ header-component.spec.ts # Test de creación del header
│  │     │  └─ header-component.ts   # Componente contenedor que compone LogoHeader + NavHeader
│  │     ├─ services                 # ← AQUÍ ESTÁN LAS LLAMADAS A LAS APIs
│  │     │  ├─ currency
│  │     │  │  └─ currency.ts        # 🌐 API CurrencyFreaks: loadRates() + convert() entre EUR/USD/JPY
│  │     │  └─ weather
│  │     │     └─ weather.ts         # 🌐 API el-tiempo.net: loadProvinces(), loadProvinceForecast(), loadNationalForecast()
│  │     └─ utils                    # Funciones puras auxiliares (sin estado, sin Angular)
│  │        ├─ fix-mojibake.ts       # Corrige texto mal codificado que devuelve la API del tiempo
│  │        ├─ site-nav-link-classes.ts # Constante con las clases Tailwind de los enlaces del nav
│  │        └─ sky-icon.ts           # Mapea el código de cielo de la API al nombre del SVG correcto
│  ├─ environments
│  │  └─ environment.example.ts      # 🔑 Plantilla de API keys: CurrencyFreaks + el-tiempo.net (sin datos reales)
│  ├─ index.html                     # HTML raíz que Angular usa como punto de montaje
│  ├─ main.ts                        # Punto de entrada: bootstrapApplication(App, appConfig)
│  ├─ styles
│  │  ├─ breakpoints.css             # Variables CSS con los breakpoints responsive
│  │  ├─ reset.css                   # Reset de estilos del navegador
│  │  ├─ typography.css              # Fuente base y escala tipográfica global
│  │  └─ variables.css               # Design tokens: paleta de colores, tamaños, pesos
│  └─ styles.css                     # Hoja de entrada global que importa las anteriores
├─ tsconfig.app.json                 # Config TypeScript para el bundle de producción
├─ tsconfig.json                     # Config TypeScript base con opciones estrictas
└─ tsconfig.spec.json                # Config TypeScript para los tests
