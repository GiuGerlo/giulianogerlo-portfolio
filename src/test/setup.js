import '@testing-library/jest-dom/vitest';

// jsdom (el DOM falso de los tests) NO implementa IntersectionObserver.
// La librería Motion lo usa para `whileInView` (el efecto Reveal de
// scroll). Sin este mock, cualquier test que renderice un componente
// con <Reveal>/<SectionHeading> tira "IntersectionObserver is not
// defined".
//
// El mock es un no-op: registra el callback pero nunca lo dispara. En
// los tests el contenido igual queda en el DOM (Motion renderiza los
// children siempre), así que las queries de Testing Library lo
// encuentran — solo no "anima". Suficiente para tests.
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.IntersectionObserver = IntersectionObserverMock;

// jsdom tampoco implementa ResizeObserver. Lo usa Lenis (scroll suave),
// que se monta en Layout → cualquier test que renderice una página
// crashearía sin este mock. Mismo patrón no-op.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;
