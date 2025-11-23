import { generateKeyPair } from "../services/openbadges";

/**
 * Generate Ed25519 keypair for OpenBadges 3.0 signing
 * Run this script to generate keys for your organization
 *
 * Usage: bun run src/scripts/generate-keys.ts
 */

async function main() {
  console.log("Generating Ed25519 keypair for OpenBadges 3.0...\n");

  const keys = await generateKeyPair();

  console.log("=".repeat(60));
  console.log("PUBLIC KEY (store in organization database record):");
  console.log("=".repeat(60));
  console.log(keys.publicKey);
  console.log("\n");
}

main().catch(console.error);
