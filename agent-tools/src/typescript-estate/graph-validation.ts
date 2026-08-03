import { err, ok, type Result } from '@oaknational/result';

import { EstateReviewError } from './errors.js';

export { compareUtf16 as compareGraphText } from './utf16-order.js';

export function validateGraphRepoPath(value: string): Result<undefined, EstateReviewError> {
  return value.length > 0 && !value.startsWith('/') && !value.split('/').includes('..')
    ? ok(undefined)
    : err(new EstateReviewError('VALIDATION_FAILED', 'repo path must be non-empty and contained'));
}
