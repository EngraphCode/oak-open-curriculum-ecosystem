/**
 * The one labelled-select view the switchboard composes three times — the
 * kit's shipped switcher markup (label.oak-body-3 + select.oak-select in a
 * cluster), props-only. `placeholderLabel` renders a disabled, hidden
 * option shown only while `value` is the empty no-choice sentinel: the
 * select then reads truthfully ("Page default") AND the first real choice
 * fires a change event — a value pinned to a real option would make that
 * first click a dead control.
 */
import type { ReactElement } from 'react';

export interface LabelledSelectProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly string[];
  readonly labels: Readonly<Record<string, string>>;
  readonly placeholderLabel?: string;
  readonly onChange: (value: string) => void;
}

export function LabelledSelect({
  id,
  label,
  value,
  options,
  labels,
  placeholderLabel,
  onChange,
}: LabelledSelectProps): ReactElement {
  return (
    <div className="oak-cluster oak-cluster--s">
      <label className="oak-body-3" htmlFor={id}>
        {label}
      </label>
      <select
        className="oak-select"
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {placeholderLabel !== undefined && (
          <option value="" disabled hidden>
            {placeholderLabel}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}
