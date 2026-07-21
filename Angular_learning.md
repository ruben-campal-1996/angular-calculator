# Angular Learning — cómo se construyó este proyecto

Este documento es un recorrido explicado de cómo se ha ido montando la aplicación, componente a componente, y sobre todo *por qué* se tomó cada decisión. No es un changelog técnico frío: es la versión "te lo explico como si estuviéramos delante de una pizarra" de todo el trabajo hecho en este proyecto.

La app es una calculadora multifunción (calculadora + conversor de divisas + el tiempo) hecha en **Angular 22**, con **signals** como mecanismo de estado, **standalone components** en todas partes (nada de `NgModule`), y **Tailwind CSS v4** para los estilos.

---

## 1. La estructura general: routing y layout persistente

Lo primero que hubo que resolver fue cómo encajaban las piezas. La app tiene tres bloques (calculadora, conversor, tiempo) pero solo dos vistas navegables: `/calculator` (que muestra calculadora + conversor juntos) y `/weather`. El header y el footer, en cambio, tienen que verse siempre, en ambas rutas.

La forma "ingenua" de hacer esto sería meter `<app-home-view/>` directamente en el template de `App` y ya está — pero entonces no hay forma de cambiar a la vista de tiempo sin recargar toda la página o hacer trampas. La solución correcta en Angular es `RouterOutlet`:

```html
<!-- app.html -->
<app-header-component/>
<router-outlet/>
<app-footer-component/>
```

Aquí está la clave: `<router-outlet/>` no es un contenedor que envuelve contenido, es más bien un *marcador de posición*. Cuando cambias de ruta, Angular inserta el componente de esa ruta como **hermano** del propio `<router-outlet/>` en el DOM, no dentro de él. Esto explica un problema que nos costó un rato depurar más adelante (lo cuento en la sección del footer).

Las rutas usan **lazy loading** (`loadComponent: () => import(...)`), no porque la app sea grande — es diminuta — sino porque es la práctica recomendada desde el principio: cada vista solo se descarga cuando el usuario navega a ella. Si mañana la vista de tiempo cargara una librería de gráficos pesada, ese peso nunca tocaría a quien solo usa la calculadora.

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'calculator', pathMatch: 'full' },
  { path: 'calculator', loadComponent: () => import('./features/pages/home-page/home-view/home-view').then(m => m.HomeView) },
  { path: 'weather', loadComponent: () => import('./features/pages/weather/weather-view/weather-view').then(m => m.WeatherView) },
];
```

---

## 2. La calculadora: por qué signals y no un objeto de estado cualquiera

El componente `Calculator` es, en esencia, una pequeña máquina de estados. En cualquier momento necesita saber:
- qué hay en pantalla (`display`)
- si hay un valor "guardado" esperando una operación (`previousValue`)
- qué operación está pendiente (`operator`)
- si la siguiente tecla que se pulse debe *reemplazar* la pantalla o *añadirse* a ella (`waitingForNewValue`)
- si estamos en un estado de error

Cada uno de estos es un `signal()` independiente. La alternativa habría sido un único objeto `{display, previousValue, operator, ...}` en un solo signal, pero eso obliga a reconstruir el objeto entero cada vez que cambia un solo campo (`this.state.update(s => ({...s, display: nuevo}))`), lo cual es más ruido para no ganar nada — aquí los campos no están relacionados entre sí de una forma que se beneficie de agruparlos.

La lógica de "calculadora de escritorio" clásica (con memoria de un solo paso, no una pila) se resolvió así:
- **`inputDigit`**: si estamos "esperando nuevo valor" (justo después de pulsar un operador), el dígito *reemplaza* la pantalla en vez de añadirse. Si no, se concatena — con el caso especial de que si la pantalla es `"0"`, el primer dígito lo sustituye en vez de dejar `"05"`.
- **`setOperator`**: si ya había una operación pendiente y el usuario pulsa otro operador (ej. `5 + 3 ×`), primero se resuelve la suma pendiente y el resultado pasa a ser el nuevo "valor anterior". Así `5 + 3 × 2 =` da `16`, no `11`, que es el comportamiento esperado de una calculadora simple encadenada.
- **División por cero**: en vez de dejar que JavaScript devuelva `Infinity` y que eso se vea en pantalla, `compute()` devuelve `null` en ese caso concreto, y quien la llama entra en `setError()`, que pone la pantalla en `"Error"` y bloquea cualquier tecla salvo `CE`.
- **Redondeo**: los números en JavaScript tienen el clásico problema de `0.1 + 0.2 = 0.30000000000000004`. Se redondea a 10 decimales (`Math.round(value * 1e10) / 1e10`) para que esos casos no se vean feos en pantalla, sin perder precisión real para el uso normal de la calculadora.

El teclado se construyó como una rejilla CSS de 4 columnas donde la tecla `CE` y la tecla `0` ocupan 2 columnas (`col-span-2`), reproduciendo la disposición típica de una calculadora física.

---

## 3. El conversor de divisas: separar "pedir datos" de "mostrar datos"

Aquí entra un patrón que se repite en todo el proyecto: **el componente no sabe hablar con la API, eso es trabajo de un servicio**. `Conversor` (el componente) solo conoce un `CurrencyService` inyectado con `inject()`, y le pide cosas: "cárgame las tasas" (`loadRates()`) y "convérteme esto" (`convert()`).

¿Por qué separar así? Porque el componente tiene una responsabilidad (mostrar un formulario y reaccionar a la interacción del usuario) y el servicio tiene otra (saber la URL de la API, parsear la respuesta, gestionar errores de red). Si mañana cambiamos de proveedor de tasas de cambio, tocamos el servicio y el componente ni se entera.

El servicio expone tres signals de solo lectura (`rates`, `loading`, `errorMessage`) y un método `convert(amount, from, to)`. La API de currencyfreaks.com devuelve las tasas con base en USD (1 USD = X de cada divisa), así que convertir de una divisa A a una divisa B pasa siempre por USD como intermedio:

```
cantidad_en_usd = cantidad / tasa(A)
resultado = cantidad_en_usd * tasa(B)
```

El resultado final en el componente es un `computed()`:

```ts
protected readonly convertedAmount = computed(() =>
  this.currencyService.convert(this.amount(), this.fromCurrency(), this.toCurrency()),
);
```

Esto es importante: **no hay ningún método que se ejecute manualmente al cambiar el importe o la divisa**. Al ser un `computed`, Angular sabe automáticamente que este valor depende de `amount()`, `fromCurrency()` y `toCurrency()`, y lo recalcula solo cuando cualquiera de esos tres cambia. No hace falta un `(input)="recalcular()"` en cada sitio.

### La API key: por qué hay dos archivos de `environment`

Cuando llegó la API key real de currencyfreaks.com, el primer instinto sería pegarla directamente en el código. El problema es que este proyecto vive en un repositorio Git, y una key en texto plano en un commit queda ahí para siempre (aunque se borre después, sigue en el historial).

La solución fue partir el archivo en dos:
- `environment.example.ts` — con un placeholder (`'YOUR_API_KEY_HERE'`), **sí** se sube a Git. Sirve de plantilla para cualquiera que clone el repo.
- `environment.ts` — con la key real, añadido a `.gitignore` para que Git lo ignore por completo.

```
# .gitignore
/src/environments/environment.ts
```

Angular no necesita ninguna configuración especial para esto: simplemente importa `environment.ts` como cualquier otro módulo TypeScript, y ese archivo existe en el disco (porque lo creamos a mano) aunque Git no lo trackee.

---

## 4. El tiempo: el mismo patrón, más un problema de codificación de texto real

`WeatherService` sigue exactamente la misma filosofía que el conversor: el componente pide, el servicio resuelve. Pero aquí apareció algo interesante que vale la pena contar porque es un problema real de integración con APIs de terceros, no algo que uno se inventa para aprender.

### El bug del "mojibake"

Al probar el endpoint nacional de la API (`/general`), el texto de la previsión llegaba así:

```
"Se mantendrÃ¡ la estabilidad..."
```

en vez de:

```
"Se mantendrá la estabilidad..."
```

Esto se llama **mojibake** y pasa cuando un texto que ya estaba correctamente codificado en UTF-8 se *reinterpreta* como si fuera Latin-1 (ISO-8859-1) y luego se vuelve a codificar en UTF-8. El carácter "á" en UTF-8 son los bytes `0xC3 0xA1`; si alguien lee esos dos bytes como si cada uno fuera un carácter Latin-1 por separado, obtiene "Ã" (U+00C3) seguido de "¡" (U+00A1) — que es exactamente lo que se veía.

Lo interesante es que **no todos los campos de la API tenían el problema**: los nombres de ciudades y provincias (`"Avilés"`, `"Cáceres"`) llegaban perfectos, pero los párrafos de texto libre (`today.p`, `tomorrow.p`, `descripcion_prediccion.p`) sí venían corruptos. Esto apunta a que, del lado del servidor de la API, esos párrafos concretos pasan por una tubería de procesamiento distinta a la de los campos estructurados — un bug real de ellos, no nuestro.

La solución es revertir exactamente el proceso que causó el problema: coger cada carácter del texto corrupto, tratarlo como si fuera un byte crudo, y volver a decodificar esos bytes como UTF-8:

```ts
export function fixMojibake(text: string): string {
  if (!/[ÃÂ]/.test(text)) {
    return text; // si no tiene pinta de estar corrupto, no tocarlo
  }
  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return text; // si no es un mojibake real, decode() falla y devolvemos el original
  }
}
```

El `{ fatal: true }` es la parte más importante: hace que `TextDecoder` **lance un error** si los bytes no forman una secuencia UTF-8 válida, en vez de sustituir silenciosamente los caracteres problemáticos por `�`. Eso convierte la función en algo seguro de aplicar "por si acaso": si el texto no estaba corrupto, el intento de revertir el mojibake falla limpiamente y se devuelve el texto original sin tocar. Así, si la API arregla su bug algún día, esta función deja de hacer nada — no hace falta volver a tocar el código.

### Los iconos según `stateSky`

El enunciado pedía mostrar una imagen según el "StateSky" que devuelve la API. La API da un código numérico (por ejemplo `"13"` = intervalos nubosos, `"26"` = cubierto con lluvia) que sigue la nomenclatura de AEMET, pero no da ninguna URL de imagen. En vez de inventarme una URL de un servicio externo de iconos (arriesgado: podría caerse, cambiar, o no tener licencia de uso), se optó por dibujar 8 iconos SVG propios muy simples (sol, parcialmente nublado, nublado, cubierto, lluvia, tormenta, nieve, niebla) y un pequeño mapa que traduce el código de AEMET a uno de esos 8 iconos:

```ts
const ICONS_BY_STATE: Record<string, string> = {
  '11': 'sunny', '12': 'partly-cloudy', '13': 'partly-cloudy',
  '23': 'rain', '26': 'rain', /* ...resto de códigos... */
};
```

Esto también resolvió un matiz que pedía el usuario: al principio la vista "Nacional" solo mostraba texto, sin imágenes, porque pensé que el endpoint nacional no traía datos de cielo por ciudad. Investigando la respuesta completa de la API con más calma, resultó que sí trae un array `ciudades` con 12 ciudades representativas de España (Madrid, Barcelona, Sevilla...), cada una con su propio `stateSky`. Así que el modo Nacional acabó reutilizando exactamente el mismo bloque de "lista de ciudades con icono" que el modo Provincia, solo que alimentado por datos distintos — sin duplicar plantilla, gracias a un `computed()` que decide qué lista de ciudades mostrar según el modo activo:

```ts
protected readonly activeCities = computed(() =>
  this.mode() === 'provincia'
    ? (this.provinceForecast()?.cities ?? [])
    : (this.nationalForecast()?.cities ?? []),
);
```

---

## 5. Header, footer, y el problema de la "línea de tiempo pegada al conversor"

`HeaderComponent` y `FooterComponent` son sencillos: agrupan piezas más pequeñas (`LogoHeader`, `NavHeader`) y no tienen lógica propia. Lo interesante aquí no es el qué, sino un bug de layout que costó una vuelta entender.

### El footer que no se anclaba abajo

El pedido era: "el footer debe estar pegado a la parte inferior de la pantalla, no justo debajo del contenido". La solución clásica de CSS para esto es un layout flex en columna donde el contenedor mide como mínimo toda la altura de la ventana, y el bloque de contenido central tiene `flex: 1` para "absorber" el espacio sobrante:

```css
:host { display: flex; flex-direction: column; min-height: 100dvh; }
router-outlet + * { flex: 1; }
```

El primer intento fue exactamente este, puesto en el CSS propio de `App`. Y no funcionó — el footer seguía pegado justo debajo del conversor en pantallas con poco contenido.

La causa tiene que ver con algo que mencioné en la sección 1: cuando el router inserta `HomeView` o `WeatherView`, los inserta como **hermano** de `<router-outlet/>`, pero ese componente insertado **no forma parte del template de `App`** a efectos de Angular. Angular usa "encapsulación de vistas" (por defecto, `Emulated`): cada componente recibe un atributo HTML único e invisible (algo como `_ngcontent-c0`) que se añade tanto al elemento como a los selectores CSS de su propio archivo `.css`, para que los estilos de un componente no se "escapen" y afecten a otros por accidente.

El problema es que `router-outlet + *` vive en el CSS de `App`, así que Angular reescribe ese selector añadiéndole el atributo de `App`. Pero el elemento insertado por el router (`HomeView`) tiene el atributo de **su propio** componente, no el de `App`. Resultado: el selector nunca coincide con nada, y la regla no se aplica jamás, en silencio, sin ningún error.

La solución que primero probé fue moverlo al CSS global (`styles.css`), que no tiene atributo de encapsulación y sí puede "cruzar" el límite entre componentes. Funcionó. Pero más adelante, al convertir todo a Tailwind, encontré una forma todavía mejor: en vez de depender de un selector CSS que cruza componentes, cada componente enrutado (`HomeView`, `WeatherView`) se declara a sí mismo como "quiero crecer" usando el `host` del propio decorador `@Component`:

```ts
@Component({
  selector: 'app-home-view',
  host: { class: 'flex flex-1 flex-col items-center gap-6 ...' },
})
export class HomeView {}
```

Esto es más robusto porque ya no depende de ningún truco de selectores — cada componente es responsable de su propio comportamiento como "hijo flexible" de quien lo contenga, sin necesitar que nadie desde fuera lo adivine.

---

## 6. El layout responsive de calculadora + conversor

El pedido fue: en móvil, calculadora y conversor van apilados; a partir de tablet (768px) deben intentar ir en la misma línea, y si no caben, el conversor cae a la línea de abajo. Esto es literalmente la definición de `flex-wrap`, así que no hizo falta ninguna media query adicional para el "si no caben, abajo" — eso lo da gratis el propio algoritmo de flexbox:

```
flex flex-col                      /* móvil: columna */
md:flex-row md:flex-wrap           /* tablet+: fila, pero envuelve si no cabe */
```

Cada bloque (`app-calculator`, `app-conversor`) recibe `grow basis-80 max-w-[380px]`: `basis-80` (320px) es el ancho "preferido", `grow` le deja estirarse si sobra espacio, y `max-w-[380px]` evita que crezca demasiado en pantallas muy anchas. Cuando la suma de los dos anchos preferidos no cabe en el contenedor, `flex-wrap` los manda a líneas distintas automáticamente.

---

## 7. La migración a Tailwind: de CSS a mano a utilidades

Todo lo anterior se construyó primero con archivos `.css` propios por componente (clases como `.key`, `.display`, `.city-icon`...) que leían variables CSS (`var(--primary-color-300)`). Más adelante se pidió convertir todo eso a Tailwind, **respetando exactamente el resultado visual**. Esto mereció cuidado extra porque un cambio de sistema de estilos es fácil de hacer mal sin que se note hasta que alguien mira con lupa.

### Paso 1: los tokens de diseño se convierten en el "tema" de Tailwind

Tailwind v4 usa un bloque `@theme` en CSS (ya no hace falta un `tailwind.config.js` con JavaScript). Cada variable de diseño se renombra a un espacio de nombres que Tailwind entiende y a partir del cual genera clases automáticamente:

- `--primary-color-300` → `--color-primary-300` (genera `bg-primary-300`, `text-primary-300`, `border-primary-300`...)
- `--font-size-lg` → `--text-lg` (genera `text-lg`)
- `--line-height-tight` → `--leading-tight` (genera `leading-tight`)
- `--font-family-heading` → `--font-heading` (genera `font-heading`)

Aquí hubo que comparar cada valor con lo que Tailwind trae *por defecto*, porque algunos coincidían exactamente (por ejemplo, nuestro `font-weight-medium: 500` es igual al `font-medium` que ya trae Tailwind) y otros no (nuestro `--line-height-tight: 1.2` no coincide con el `1.25` por defecto de Tailwind, así que había que sobreescribirlo explícitamente o el resultado visual habría cambiado sin que nadie lo pidiera).

### Paso 2: un bug de "cascade layers" que habría roto todo el espaciado

Este es el hallazgo más importante de toda la migración. El proyecto tenía un `reset.css` heredado (de antes de usar Tailwind) con una regla:

```css
*, *::before, *::after { padding: 0; margin: 0; box-sizing: border-box; }
```

Este archivo se importaba de forma "plana", sin capa (`@import "./styles/reset.css";`). CSS moderno tiene un concepto llamado **cascade layers** (`@layer`): cualquier regla que **no** esté dentro de una capa (`@layer`) gana automáticamente sobre **cualquier** regla que sí lo esté, sin importar especificidad ni orden. Y resulta que Tailwind mete todas sus utilidades dentro de capas (`@layer utilities`, `@layer base`...).

Esto significaba que, en el momento en que empezara a usar clases como `p-4` o `gap-3` de Tailwind, esa regla de reset (que no estaba en ninguna capa) las habría anulado silenciosamente — el espaciado de toda la app se habría roto sin ningún error visible, solo un "esto no tiene el padding que le puse". La solución fue importar el reset explícitamente dentro de la misma capa `base` que usa Tailwind:

```css
@import "./styles/reset.css" layer(base);
```

Con esto, el reset sigue haciendo exactamente lo mismo que hacía antes (mismo contenido, cero cambios), pero ahora compite en igualdad de condiciones con las utilidades de Tailwind en vez de ganar siempre por defecto.

### Paso 3: evitar que dos clases se peleen por la misma propiedad

Con utilidades sueltas, es fácil escribir sin querer algo como `class="bg-neutral-100 bg-tertiary-300"` pensando que la segunda "gana" por ir después. Pero Tailwind no funciona como el CSS escrito a mano: el orden en el que aparecen las clases en el HTML **no determina** cuál gana, sino el orden en el que Tailwind las generó internamente en su hoja de estilos — algo que no controlamos directamente.

La solución usada en la calculadora y en el selector de Provincia/Nacional del tiempo fue construir, para cada variante (tecla numérica, tecla de operador, tecla de igual, botón activo, botón inactivo...), un **string de clases completo y sin solapamientos**, en vez de intentar combinar una clase "base" con una "modificadora" que tocan la misma propiedad:

```ts
protected readonly numberKeyClasses = `${KEY_BASE_CLASSES} bg-neutral-100 text-neutral-900 hover:bg-neutral-200`;
protected readonly clearKeyClasses = `${KEY_BASE_CLASSES} bg-tertiary-300 text-white hover:bg-tertiary-400`;
```

`KEY_BASE_CLASSES` deliberadamente **no** incluye ningún `bg-*` ni `text-*`, precisamente para que nunca compita con la variante. Es un patrón pequeño pero importante de tener en la cabeza cuando se generan clases de Tailwind dinámicamente.

---

## 8. Los tests: por qué no hacía falta cambiar nada

En algún momento se pidió revisar que los tests usaran Vitest. La respuesta fue que ya lo hacían: Angular 22 trae un builder nuevo (`@angular/build:unit-test`) que usa Vitest por debajo sin necesidad de configurarlo a mano, y el proyecto no tenía ningún resto de Karma/Jasmine (que era lo habitual en versiones anteriores de Angular). A veces la mejor respuesta a "asegúrate de que X" es comprobar con cuidado y decir honestamente "esto ya estaba bien", en vez de tocar algo que no lo necesitaba.

---

## En resumen: los patrones que se repiten en todo el proyecto

1. **El componente no habla con el mundo exterior directamente** — siempre hay un servicio (`CurrencyService`, `WeatherService`) en medio, inyectado con `inject()`.
2. **El estado vive en signals, y lo derivado se calcula con `computed()`**, nunca se recalcula "a mano" en un método que hay que acordarse de llamar.
3. **Nunca se inventan URLs ni datos** — cuando hacía falta un dato que la API no daba (como un icono), se construyó localmente en vez de arriesgarse a apuntar a un recurso externo no verificado.
4. **Los secretos no van al repositorio** — la API key vive en un archivo excluido de Git, con una plantilla pública al lado.
5. **Cuando algo "no funciona pero no da error"**, casi siempre es un problema de que dos sistemas tienen reglas de prioridad distintas de las que uno asume (la encapsulación de Angular con `router-outlet + *`, las cascade layers con el reset) — vale la pena entender la regla real en vez de simplemente probar cosas hasta que "parezca" funcionar.
