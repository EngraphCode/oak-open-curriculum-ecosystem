import { type AnySchema, type ValidateFunction } from 'ajv';
import Ajv from 'ajv/dist/2020.js';

import { err, ok, type Result } from '@oaknational/result';
import { type WireContract, type WireShapeName } from './types.js';

// Compiled shape validators are cached per loaded contract OBJECT (WeakMap
// identity): callers that retain one loaded contract get the cache; callers
// that reload per call recompile every time. Only the `$defs` subset is
// passed to ajv, so the document's root annotation keys (version,
// $comment_*) never reach the compiler and strict mode stays ON — a typo'd
// schema keyword in the contract fails compilation loudly instead of
// silently weakening the wire.
const validatorCache = new WeakMap<WireContract, Map<WireShapeName, ValidateFunction>>();

function compiledValidator(
  contract: WireContract,
  shape: WireShapeName,
): Result<ValidateFunction, string> {
  const cached = validatorCache.get(contract)?.get(shape);
  if (cached !== undefined) {
    return ok(cached);
  }
  const defs = contract.document['$defs'];
  const schema: AnySchema = {
    $ref: `#/$defs/${shape}`,
    $defs: defs,
  };
  try {
    const ajv = new Ajv({ strict: true, allErrors: true });
    const validate = ajv.compile(schema);
    const perContract = validatorCache.get(contract) ?? new Map<WireShapeName, ValidateFunction>();
    perContract.set(shape, validate);
    validatorCache.set(contract, perContract);
    return ok(validate);
  } catch (error) {
    return err(
      `wire shape ${shape} did not compile from the contract (family ${contract.family}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Validate a value against one wire shape of the contract. Within-family
 * tolerance is built into the contract itself (wire $defs tolerate unknown
 * fields); a failure here means the value violates what the family
 * guarantees, and the error names every violated site.
 */
export function validateWireValue(
  contract: WireContract,
  shape: WireShapeName,
  value: unknown,
): Result<undefined, string> {
  const validator = compiledValidator(contract, shape);
  if (!validator.ok) {
    return validator;
  }
  if (validator.value(value)) {
    return ok(undefined);
  }
  const issues = (validator.value.errors ?? [])
    .map((issue) => `${issue.instancePath || '(root)'} ${issue.message ?? 'invalid'}`)
    .join('; ');
  return err(`wire shape ${shape} (contract ${contract.version}) refused the value: ${issues}`);
}
