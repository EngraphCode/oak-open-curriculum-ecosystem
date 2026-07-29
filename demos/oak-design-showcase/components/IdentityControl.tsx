/**
 * Identity (white-label) select — props-only view, same labelled-select
 * shape as the theme controls. Option labels are the studio switchboard's
 * identity names (Oak, the two counter-brands that triangulate the
 * contract's range).
 */
import type { ReactElement } from 'react';

const IDENTITY_LABELS: Record<string, string> = {
  oak: 'Oak',
  freedonia: 'Freedonia DSE',
  creature: 'EMC²',
};

export interface IdentityControlProps {
  readonly identity: string;
  readonly identities: readonly string[];
  readonly onChange: (value: string) => void;
}

export function IdentityControl({
  identity,
  identities,
  onChange,
}: IdentityControlProps): ReactElement {
  return (
    <div className="oak-cluster oak-cluster--s">
      <label className="oak-body-3" htmlFor="oak-identity-select">
        Identity
      </label>
      <select
        className="oak-select"
        id="oak-identity-select"
        value={identity}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {identities.map((slug) => (
          <option key={slug} value={slug}>
            {IDENTITY_LABELS[slug] ?? slug}
          </option>
        ))}
      </select>
    </div>
  );
}
