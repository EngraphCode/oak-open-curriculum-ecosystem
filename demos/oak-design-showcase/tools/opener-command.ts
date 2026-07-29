/**
 * The platform-appropriate command to open a URL in the default browser:
 * macOS `open`, Windows `cmd /c start` (the empty string is the window
 * title `start` would otherwise steal the URL for), everything else
 * `xdg-open`. Pure: the caller resolves the platform at its composition
 * root and passes it in (ADR-078).
 */
export function openerCommand(
  url: string,
  osPlatform: NodeJS.Platform,
): { command: string; args: readonly string[] } {
  switch (osPlatform) {
    case 'darwin':
      return { command: 'open', args: [url] };
    case 'win32':
      return { command: 'cmd', args: ['/c', 'start', '', url] };
    default:
      return { command: 'xdg-open', args: [url] };
  }
}
