import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Unmount React trees rendered by `@testing-library/react` after every test
 * so `happy-dom`'s document does not leak nodes across tests.
 */
afterEach(() => {
  cleanup();
});
