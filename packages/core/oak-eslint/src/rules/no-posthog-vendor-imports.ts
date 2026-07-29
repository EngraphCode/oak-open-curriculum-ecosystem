import { createMessage } from '../reappraising-message.js';
import { isPostHogAdapterFile, POSTHOG_VENDOR_PACKAGES } from './boundary.js';
import { createVendorImportRule } from './vendor-import-rule.js';

function isPostHogVendorSpecifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    POSTHOG_VENDOR_PACKAGES.some(
      (packageName) => value === packageName || value.startsWith(`${packageName}/`),
    )
  );
}

/**
 * Enforces the exclusive PostHog vendor-import boundary independently of
 * `no-restricted-imports`.
 *
 * @remarks
 * Flat-config rule values replace earlier values rather than merging them.
 * A dedicated rule therefore keeps this repository-wide boundary active when
 * a workspace later customises `no-restricted-imports` for an unrelated local
 * policy. The sole exemption is the adapter that owns the vendor dependency.
 */
const noPostHogVendorImportsRule = createVendorImportRule({
  description: 'Allow PostHog vendor SDK imports only inside packages/libs/posthog-node.',
  messageId: 'postHogVendorImportBanned',
  messages: {
    postHogVendorImportBanned: createMessage({
      prohibition: 'Importing "{{specifier}}" outside packages/libs/posthog-node is forbidden.',
      reappraisal:
        'Consume Oak provider-neutral product-analytics contracts; keep every PostHog vendor import inside packages/libs/posthog-node.',
    }),
  },
  isExemptFile: isPostHogAdapterFile,
  isVendorSpecifier: isPostHogVendorSpecifier,
});

export { noPostHogVendorImportsRule };
