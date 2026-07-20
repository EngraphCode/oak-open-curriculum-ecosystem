import * as React from "react";
/** Oak button — 2px border, 4px radius, signature lemon offset-shadow on hover, press collapses to grey+lemon stack. Matches OakPrimaryButton / OakSecondaryButton / OakPrimaryInvertedButton. */
export interface OakButtonProps {
  children?: React.ReactNode;
  /** "primary" black fill · "secondary" white fill, black border · "inverted" white, borderless, no hover shadow @default "primary" */
  variant?: "primary" | "secondary" | "inverted";
  /** "md" 48px · "sm" 36px @default "md" */
  size?: "md" | "sm";
  /** icon name from assets/icons, e.g. "arrow-right" */
  iconLeft?: string;
  iconRight?: string;
  disabled?: boolean;
  /** renders an <a> instead of <button>; when disabled, the href is dropped and aria-disabled is set */
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** button type for the <button> path (ignored for links) @default "button" — never an implicit form submitter */
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}
export function OakButton(props: OakButtonProps): JSX.Element;
