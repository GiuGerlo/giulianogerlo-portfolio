// Plasma — fondo animado WebGL (reactbits.dev, variante JS + CSS).
//
// Renderiza un efecto "plasma" procedural en un fragment shader sobre
// un triángulo full-screen. La librería `ogl` es el wrapper minimalista
// sobre WebGL2 (~9KB gz, no usa Three.js).
//
// Optimización (clave para que NO trabe el scroll del sitio):
//  - IntersectionObserver: pausa el loop cuando el canvas sale de
//    pantalla (scrolleaste pasado el Hero) → GPU libre.
//  - visibilitychange: pausa cuando cambiás de pestaña. (*)
//  - prefers-reduced-motion: si el SO lo pide, 1 frame estático. (*)
//  - webglcontextlost/restored: si el navegador resetea el contexto
//    GL (cambio de GPU, ahorro de energía), no crashea.
//
//  (*) visibilitychange y prefers-reduced-motion son agregados nuestros
//      sobre el componente original de reactbits — el resto es intacto.

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Plasma.css';

// hexToRgb — convierte "#06a352" a [r, g, b] normalizado 0..1, que es
// el formato que espera el shader para el uniform de color. Si el hex
// es inválido devuelve un naranja por defecto.
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

// ===== SHADERS (GLSL ES 3.00 — WebGL2) =====
// Vertex shader trivial: posiciona el triángulo full-screen y pasa el uv.
const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Fragment shader: el efecto plasma. Raymarching procedural animado con
// iTime. Código intacto del componente original de reactbits — no tocar
// la matemática del loop (está afinada para el efecto visual).
const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;

    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }

  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

/**
 * Plasma — fondo plasma animado.
 *
 * @param {string}  color             Hex para tintar el plasma. Sin esto usa colores originales.
 * @param {number}  speed             Multiplicador de velocidad de animación.
 * @param {string}  direction         'forward' | 'reverse' | 'pingpong'.
 * @param {number}  scale             Zoom del patrón (mayor = más cerca).
 * @param {number}  opacity           Opacidad global del efecto (0-1).
 * @param {boolean} mouseInteractive  Si el plasma reacciona al mouse.
 */
export default function Plasma({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
}) {
  // ref del <div> contenedor. El canvas se crea en el effect y se
  // appendea acá adentro.
  const containerRef = useRef(null);
  // Posición del mouse, en un ref para no disparar re-renders.
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const containerEl = containerRef.current;

    // Color: si vino un hex lo usamos (uUseCustomColor = 1).
    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];

    // 'reverse' invierte el sentido de la animación.
    const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;

    // prefers-reduced-motion: si el SO pide "reducir movimiento" no
    // animamos — renderizamos 1 frame estático. Accesibilidad + ahorro
    // total de GPU. (Agregado nuestro sobre el original de reactbits.)
    // El guard `typeof` es por jsdom (entorno de tests): no implementa
    // matchMedia y sin el guard tiraría "window.matchMedia is not a function".
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer WebGL2. dpr capeado a 1.5 (el original usa 2): el shader
    // tiene un loop de 60 iteraciones por pixel, así que bajar el dpr
    // recorta bastante el costo de GPU sin que se note en un fondo
    // borroso detrás de un overlay.
    let renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      });
    } catch {
      return;
    }
    const gl = renderer.gl;
    if (!gl) return;
    const canvas = gl.canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerEl.appendChild(canvas);

    // Triangle = geometría full-screen (1 triángulo que cubre todo el
    // viewport). Program = vertex + fragment + uniforms (los valores
    // que pasamos del JS al shader).
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    // Mouse: actualiza el uniform uMouse con la posición relativa al
    // contenedor. Solo se engancha si mouseInteractive está activo.
    const handleMouseMove = (e) => {
      if (!mouseInteractive) return;
      const rect = containerEl.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
      const mouseUniform = program.uniforms.uMouse.value;
      mouseUniform[0] = mousePos.current.x;
      mouseUniform[1] = mousePos.current.y;
    };
    if (mouseInteractive) {
      containerEl.addEventListener('mousemove', handleMouseMove);
    }

    // setSize: ajusta el canvas + el uniform de resolución cuando el
    // contenedor cambia de tamaño. ResizeObserver lo dispara.
    const setSize = () => {
      const rect = containerEl.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height);
      const res = program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };
    const ro = new ResizeObserver(setSize);
    ro.observe(containerEl);
    setSize();

    let raf = 0;
    let contextLost = false;
    let isVisible = true; // canvas dentro del viewport
    let isTabHidden = false; // pestaña en segundo plano
    const t0 = performance.now();

    // renderActivo — el loop solo corre si NO se perdió el contexto,
    // el canvas está visible Y la pestaña está activa.
    const shouldRun = () => !contextLost && isVisible && !isTabHidden;

    // Loop de animación. requestAnimationFrame se sincroniza con el
    // refresh del monitor (60fps típico).
    const loop = (t) => {
      if (!shouldRun()) return;
      let timeValue = (t - t0) * 0.001;
      if (direction === 'pingpong') {
        // 'pingpong': oscila adelante/atrás con easing suave (smoothstep).
        const pingpongDuration = 10;
        const segmentTime = timeValue % pingpongDuration;
        const isForward =
          Math.floor(timeValue / pingpongDuration) % 2 === 0;
        const u = segmentTime / pingpongDuration;
        const smooth = u * u * (3 - 2 * u);
        const pingpongTime = isForward
          ? smooth * pingpongDuration
          : (1 - smooth) * pingpongDuration;
        program.uniforms.uDirection.value = 1.0;
        program.uniforms.iTime.value = pingpongTime;
      } else {
        program.uniforms.iTime.value = timeValue;
      }
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    // restart — relanza el loop si corresponde (evita loops duplicados
    // cancelando primero el rAF pendiente).
    const restart = () => {
      if (reduceMotion || !shouldRun()) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    // webglcontextlost/restored: el navegador puede resetear el
    // contexto GL (cambio de GPU, ahorro de energía). preventDefault
    // permite recuperarlo después en vez de crashear.
    const handleContextLost = (e) => {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(raf);
    };
    const handleContextRestored = () => {
      contextLost = false;
      restart();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    // IntersectionObserver: pausa el loop cuando el canvas sale de
    // pantalla. Es el ahorro de GPU más importante: scrolleás pasado
    // el Hero y el plasma deja de rendererarse.
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) restart();
      },
      { threshold: 0 },
    );
    io.observe(containerEl);

    // visibilitychange: cambiar de pestaña no saca el canvas del
    // viewport, pero igual deja de verse → también pausamos.
    const onVisibility = () => {
      isTabHidden = document.hidden;
      if (!isTabHidden) restart();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduceMotion) {
      // Modo accesible: 1 frame y el loop nunca arranca.
      program.uniforms.iTime.value = 0;
      renderer.render({ scene: mesh });
    } else {
      raf = requestAnimationFrame(loop);
    }

    // Cleanup: parar el loop + desconectar observers + remover
    // listeners + sacar el canvas. Sin esto el shader seguiría
    // rendereando para siempre = memory + GPU leak.
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener(
        'webglcontextrestored',
        handleContextRestored,
      );
      if (mouseInteractive && containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove);
      }
      try {
        containerEl?.removeChild(canvas);
      } catch {
        // El canvas ya pudo haber sido removido — ignoramos.
      }
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  return <div ref={containerRef} className="plasma-container" />;
}
