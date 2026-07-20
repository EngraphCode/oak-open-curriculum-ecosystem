import { defaultOwaRoot, emitJson, parseArgs, resolveFromCwd, usageError } from '../lib/cli.js';
import { buildOwaArchitectureInventory } from '../lib/owa-architecture-inventory.js';

const usage = `Usage: pnpm exec tsx scripts/owa-architecture-inventory.ts [options]

Options:
  --owa <path>     OWA checkout (default: sibling Oak-Web-Application)
  --output <path>  Write JSON to this path instead of stdout`;

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const owaArgument = typeof args.owa === 'string' ? args.owa : undefined;
  const owaRoot = resolveFromCwd(owaArgument, defaultOwaRoot);
  const result = await buildOwaArchitectureInventory(owaRoot);
  const outputArgument = typeof args.output === 'string' ? args.output : undefined;
  await emitJson(result, outputArgument);
}

void main().catch((error: unknown) => {
  const details = error instanceof Error ? (error.stack ?? error.message) : String(error);
  usageError(details, usage);
});
