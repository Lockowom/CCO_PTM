import '@testing-library/jest-dom';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock window.addEventListener for online/offline events
const originalAddEventListener = window.addEventListener;
window.addEventListener = vi.fn((...args) => {
  // Skip online/offline listeners from syncManager during tests
  if (args[0] === 'online' || args[0] === 'offline') return;
  return originalAddEventListener.apply(window, args);
});

// Suppress toast notifications in tests
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));
