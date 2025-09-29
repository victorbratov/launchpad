// jest.setup.ts
import '@testing-library/jest-dom';
import * as ReactDOM from 'react-dom';
import { ReactNode } from 'react';

jest.spyOn(ReactDOM, 'createPortal').mockImplementation(
  (element: ReactNode) => element as any
);

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver as any;

window.HTMLElement.prototype.scrollIntoView = function() {};
