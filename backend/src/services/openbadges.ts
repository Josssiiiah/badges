import * as ed25519 from "@noble/ed25519";
import extract from "png-chunks-extract";
import encode from "png-chunks-encode";

/**
 * OpenBadges 3.0 Service
 * Handles credential generation, signing, and export for OpenBadges 3.0 compliance
 */

// Type definitions for OpenBadges 3.0
export interface Profile {
  id: string;
  type: "Profile";
  name: string;
  url?: string;
  email?: string;
  description?: string;
  image?: string;
}

export interface Criteria {
  narrative?: string;
}

export interface Achievement {
  id: string;
  type: "Achievement";
  name: string;
  description: string;
  criteria: Criteria;
  achievementType?: string;
  image?: string;
  tags?: string[];
  alignment?: any[];
}

export interface AchievementSubject {
  id?: string;
  type: "AchievementSubject";
  achievement: Achievement;
}

export interface DataIntegrityProof {
  type: "DataIntegrityProof";
  cryptosuite: "eddsa-rdfc-2022";
  verificationMethod: string;
  proofPurpose: "assertionMethod";
  proofValue: string;
  created: string;
}

export interface OpenBadgeCredential {
  "@context": string[];
  id: string;
  type: string[];
  issuer: Profile;
  validFrom: string;
  credentialSubject: AchievementSubject;
  name?: string;
  proof?: DataIntegrityProof;
}

/**
 * Generate an Ed25519 keypair for signing credentials
 * Returns base64 encoded private and public keys
 */
export async function generateKeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  // Generate 32 random bytes for Ed25519 private key
  const privateKey = ed25519.etc.randomBytes(32);
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);

  return {
    privateKey: Buffer.from(privateKey).toString("base64"),
    publicKey: Buffer.from(publicKey).toString("base64"),
  };
}

/**
 * Generate an OpenBadgeCredential from badge and user data
 */
export function generateOpenBadgeCredential(params: {
  credentialId: string;
  badgeData: any;
  userData: any;
  organizationData: any;
  earnedAt: Date;
}): OpenBadgeCredential {
  const { credentialId, badgeData, userData, organizationData, earnedAt } =
    params;

  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  const issuerId = `${backendUrl}/api/issuers/${organizationData.id}`;
  const achievementId = `${backendUrl}/api/achievements/${badgeData.id}`;

  // Build the issuer profile
  const issuer: Profile = {
    id: issuerId,
    type: "Profile",
    name: organizationData.name,
    ...(organizationData.url && { url: organizationData.url }),
    ...(organizationData.email && { email: organizationData.email }),
    ...(organizationData.description && {
      description: organizationData.description,
    }),
    ...(organizationData.image && { image: organizationData.image }),
  };

  // Build the achievement
  const achievement: Achievement = {
    id: achievementId,
    type: "Achievement",
    name: badgeData.name,
    description: badgeData.description || "",
    criteria: {
      narrative: badgeData.earningCriteria || "",
    },
    ...(badgeData.achievementType && {
      achievementType: badgeData.achievementType,
    }),
    ...(badgeData.imageData && { image: badgeData.imageData }),
    ...(badgeData.skills && {
      tags: badgeData.skills.split(",").map((s: string) => s.trim()),
    }),
    ...(badgeData.alignments && {
      alignment: JSON.parse(badgeData.alignments),
    }),
  };

  // Build the credential subject
  const credentialSubject: AchievementSubject = {
    type: "AchievementSubject",
    achievement,
    ...(userData.email && { id: `mailto:${userData.email}` }),
  };

  // Build the credential
  const credential: OpenBadgeCredential = {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
    ],
    id: credentialId,
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    issuer,
    validFrom: earnedAt.toISOString(),
    credentialSubject,
    name: badgeData.name,
  };

  return credential;
}

/**
 * Sign an OpenBadgeCredential with Ed25519 signature
 */
export async function signCredential(
  credential: OpenBadgeCredential,
  privateKeyBase64: string,
  verificationMethod: string
): Promise<OpenBadgeCredential> {
  // Create a canonical representation of the credential for signing
  const credentialCopy = JSON.parse(JSON.stringify(credential));
  delete credentialCopy.proof; // Remove any existing proof

  const message = JSON.stringify(credentialCopy);
  const messageBytes = new TextEncoder().encode(message);

  const privateKey = Buffer.from(privateKeyBase64, "base64");
  const signature = await ed25519.signAsync(messageBytes, privateKey);

  const proof: DataIntegrityProof = {
    type: "DataIntegrityProof",
    cryptosuite: "eddsa-rdfc-2022",
    verificationMethod,
    proofPurpose: "assertionMethod",
    proofValue: Buffer.from(signature).toString("base64"),
    created: new Date().toISOString(),
  };

  return {
    ...credential,
    proof,
  };
}

/**
 * Verify a signed OpenBadgeCredential
 */
export async function verifyCredential(
  signedCredential: OpenBadgeCredential,
  publicKeyBase64: string
): Promise<boolean> {
  if (!signedCredential.proof) {
    return false;
  }

  try {
    // Create credential without proof
    const credentialCopy = JSON.parse(JSON.stringify(signedCredential));
    delete credentialCopy.proof;

    const message = JSON.stringify(credentialCopy);
    const messageBytes = new TextEncoder().encode(message);

    const signature = Buffer.from(signedCredential.proof.proofValue, "base64");
    const publicKey = Buffer.from(publicKeyBase64, "base64");

    return await ed25519.verifyAsync(signature, messageBytes, publicKey);
  } catch (error) {
    console.error("Verification error:", error);
    return false;
  }
}

/**
 * Embed credential JSON into PNG image metadata
 * This creates a "baked badge" - a portable image with embedded credential
 */
export async function generateBakedPNG(
  imageDataUrl: string,
  credential: OpenBadgeCredential
): Promise<Buffer> {
  // Extract base64 data from data URL
  const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");

  // Extract existing chunks from the PNG
  // @ts-ignore - no type definitions available
  const chunks = extract(imageBuffer);

  // Create iTXt chunk with OpenBadges credential
  // iTXt chunk format: keyword, compression flag, compression method, language tag, translated keyword, text
  const credentialJson = JSON.stringify(credential);
  const keyword = "openbadges";

  // Create iTXt chunk data
  const iTXtData = Buffer.concat([
    Buffer.from(keyword, "latin1"),
    Buffer.from([0]), // null separator
    Buffer.from([0]), // compression flag (0 = uncompressed)
    Buffer.from([0]), // compression method (must be 0 when uncompressed)
    Buffer.from([0]), // null separator (language tag)
    Buffer.from([0]), // null separator (translated keyword)
    Buffer.from(credentialJson, "utf8"),
  ]);

  // Create iTXt chunk
  const iTXtChunk = {
    name: "iTXt",
    data: iTXtData,
  };

  // Insert iTXt chunk before the first IDAT chunk (or before IEND if no IDAT found)
  // This ensures metadata is readable by viewers that stop after image data
  const firstIdatIndex = chunks.findIndex((chunk: any) => chunk.name === "IDAT");
  const insertIndex = firstIdatIndex !== -1 ? firstIdatIndex : chunks.length - 1;
  
  chunks.splice(insertIndex, 0, iTXtChunk);

  // Encode the chunks back into a PNG buffer
  // @ts-ignore - no type definitions available
  return Buffer.from(encode(chunks));
}

/**
 * Generate SVG with embedded credential
 */
export function generateBakedSVG(
  svgContent: string,
  credential: OpenBadgeCredential
): string {
  const credentialJson = JSON.stringify(credential);

  // OpenBadges spec requires credential in <openbadges> element or as base64 in verify attribute
  // Using the verify attribute method which is more widely supported
  const credentialBase64 = Buffer.from(credentialJson).toString('base64');

  // Insert openbadges verify attribute in the opening svg tag
  return svgContent.replace(
    /<svg([^>]*)>/,
    `<svg$1 xmlns:openbadges="https://purl.imsglobal.org/ob/v3p0" openbadges:verify="${credentialBase64}">`
  );
}

/**
 * Convert image data URL to SVG (simple wrapper)
 */
export function imageToSVG(imageDataUrl: string, width = 512, height = 512): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image href="${imageDataUrl}" width="${width}" height="${height}" />
</svg>`;
}
