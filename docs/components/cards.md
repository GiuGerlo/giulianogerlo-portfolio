# Cards — convención de tamaño y disposición

Regla del proyecto: **dentro de una misma grilla, todas las cards quedan
parejas** — mismo alto y los elementos internos alineados entre sí (el
título arriba a la misma altura, el "footer" abajo a la misma altura).

Aplica a las grillas de cards del Home:

- **Skills** (`src/components/sections/Skills.jsx`)
- **Projects** (`src/components/sections/Projects.jsx`)
- **Education** (`src/components/sections/Education.jsx`)

## Por qué pasa el desparejo

CSS Grid ya estira los items a la altura de la fila más alta
(`align-items: stretch`, que es el default). El problema es que la card
puede no *tomar* ese alto, o el contenido puede quedar pegado arriba
dejando un hueco abajo — y entonces el "footer" de cada card (ej.
"Ver caso", "Ver certificado") queda a distinta altura.

## Cómo se resuelve

Tres pasos, de afuera hacia adentro:

1. **La card toma el alto de la fila** → `h-full` en la card (y en el
   wrapper `<Reveal>` si lo hay, porque el `<Reveal>` es el grid item
   real).
2. **El contenido llena la card** → el contenedor interno es
   `flex flex-col h-full` (o `flex-1` si la card tiene partes fijas
   arriba, como la imagen de 180px en Projects).
3. **El footer se ancla abajo** → al elemento que tiene que quedar al
   pie de la card se le pone `mt-auto`. En un flex column, `mt-auto`
   se come todo el espacio sobrante y empuja ese elemento al fondo.

## Ejemplo (patrón Projects)

```jsx
<Reveal className="h-full">                  {/* 1. grid item toma alto */}
  <Link className="flex h-full flex-col ...">  {/* card = flex column */}
    <div className="h-[180px] ...">imagen</div> {/* parte fija */}
    <div className="flex flex-1 flex-col p-6">  {/* 2. body llena el resto */}
      <h3>...</h3>
      <p>...</p>
      <div>...tags...</div>
      <span className="mt-auto ...">Ver caso</span> {/* 3. footer al fondo */}
    </div>
  </Link>
</Reveal>
```

En **Skills** el contenido interno es `flex h-full flex-col p-6` (no
hay footer que anclar, pero el patrón se mantiene por consistencia).

En **Education** el slot del certificado ("Ver certificado" /
"Certificado al finalizar") lleva `mt-auto` para quedar siempre al pie.
Si una card no tiene certificado, ese slot no se renderiza y la card
queda con espacio vacío abajo — es esperado.

## Al sumar una card nueva

Cuando llegue la tanda grande de contenido (más proyectos, etc.),
respetar este patrón: card `h-full`, contenido `flex flex-col`, footer
con `mt-auto`. Así no se rompe el parejo.
