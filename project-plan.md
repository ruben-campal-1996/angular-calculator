# Plan de desarrollo del proyecto

## 1. Objetivo general
Crear una aplicación web en Vue 3 que funcione como una calculadora multifuncional, integrando tres partes importantes en una sola vista:

- una calculadora con operaciones básicas,
- un conversor de divisas,
- y un bloque de información meteorológica.

La aplicación debe ser responsive, usable en móviles y con una experiencia clara para el usuario.

## 2. Recomendaciones de instalación y entorno
Antes de empezar, conviene preparar el entorno de desarrollo correctamente.

### Requisitos previos
- Instalar Node.js 20 o superior.
- Usar npm o pnpm como gestor de paquetes.
- Tener Git instalado y un editor como VS Code.

### Dependencias recomendadas
Al iniciar el proyecto conviene instalar:

- Vue 3 y Vite
- Axios para las llamadas a APIs
- Pinia para guardar la memoria de la calculadora
- Vitest para pruebas unitarias
- Playwright para pruebas end-to-end
- Bootstrap, Vuetify o una librería CSS similar para el diseño

### Comandos de instalación sugeridos
- Crear el proyecto:
  - `npm create vue@latest`
- Instalar dependencias base:
  - `npm install`
- Instalar peticiones y estado:
  - `npm install axios pinia`
- Instalar pruebas:
  - `npm install -D vitest playwright @playwright/test`
- Instalar estilos:
  - `npm install bootstrap`
  o bien `npm install vuetify`

## 3. Plan de desarrollo por fases

### Fase 1: Preparación inicial
- Crear la estructura base del proyecto.
- Organizar carpetas para componentes, vistas, stores y servicios.
- Configurar el proyecto para que sea fácil de mantener.

### Fase 2: Diseño de la interfaz
- Crear una vista única y clara.
- Diseñar la interfaz pensando primero en móviles.
- Distribuir visualmente la calculadora, el conversor y el bloque del tiempo.
- Asegurarse de que todo sea legible y usable.

### Fase 3: Implementación de la calculadora
- Añadir operaciones básicas: suma, resta, multiplicación y división.
- Incluir teclas numéricas del 0 al 9.
- Añadir el punto decimal, el botón igual, CE y control de errores.
- Gestionar situaciones como división por cero o entradas inválidas.

### Fase 4: Memoria de la calculadora
- Implementar las teclas M+, MR y MC.
- Guardar el valor en memoria con Pinia.
- Asegurar que el valor se recupere y se borre correctamente.

### Fase 5: Conversor de divisas
- Conectar la aplicación con la API de divisas mediante Axios.
- Soportar al menos Euro, Dólar y Yen.
- Mostrar los resultados de forma clara en la interfaz.
- Gestionar estados de carga y errores.

### Fase 6: Información meteorológica
- Conectar la app con la API del tiempo mediante Axios.
- Mostrar información relevante de una ubicación concreta, por ejemplo Asturias.
- Mostrar una imagen según el estado del cielo, si la API lo permite.
- Preparar la vista para que los datos se muestren de forma simple y visual.

### Fase 7: Pruebas
- Crear pruebas unitarias para la lógica de la calculadora.
- Añadir pruebas end-to-end para verificar el flujo de la aplicación.
- Comprobar que la interfaz funcione bien en pantallas pequeñas y grandes.

### Fase 8: Pulido final y despliegue
- Revisar que todo funcione correctamente.
- Ajustar estilos, mensajes de error y experiencia de usuario.
- Preparar la app para desplegarla en GitHub Pages o en otra plataforma.

## 4. Recomendaciones de desarrollo
- Mantener el código organizado desde el inicio.
- Separar la lógica de la interfaz y las llamadas a API.
- Priorizar una arquitectura sencilla para que el proyecto sea fácil de ampliar.
- Usar nombres claros en componentes y funciones.
- Hacer pruebas desde las primeras fases, no esperar al final.

## 5. Entregables finales
- Aplicación funcional en Vue 3.
- Calculadora operativa con memoria.
- Conversor de divisas integrado.
- Panel del tiempo visible en la misma vista.
- Pruebas unitarias y de extremo a extremo.
- Repositorio en GitHub y aplicación desplegada.
