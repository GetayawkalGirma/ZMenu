import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const STORAGE_ROOT = path.join(process.cwd(), "public", "storage");

/**
 * Ensures the storage root exists.
 */
export async function ensureStorageRoot() {
  try {
    await fs.access(STORAGE_ROOT);
  } catch {
    await fs.mkdir(STORAGE_ROOT, { recursive: true });
  }
}

/**
 * Calculates SHA-256 hash of a buffer.
 */
export function calculateHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Gets the relative and absolute path for a file based on its hash.
 * Uses a 2-level nested directory structure: storage/ab/cd/hash.ext
 */
export function getFilePaths(hash: string, extension: string) {
  const dir1 = hash.substring(0, 2);
  const dir2 = hash.substring(2, 4);
  const filename = `${hash}${extension ? `.${extension}` : ""}`;
  
  const relativePath = path.join(dir1, dir2, filename);
  const absolutePath = path.join(STORAGE_ROOT, relativePath);
  
  return { relativePath, absolutePath };
}

/**
 * Saves a file to the storage directory.
 */
export async function saveToDisk(buffer: Buffer, hash: string, extension: string): Promise<string> {
  const { relativePath, absolutePath } = getFilePaths(hash, extension);
  
  // Ensure the subdirectory exists
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  
  // Check if file already exists to avoid redundant writes
  try {
    await fs.access(absolutePath);
  } catch {
    await fs.writeFile(absolutePath, buffer);
  }
  
  return relativePath;
}

/**
 * Deletes a file from the disk.
 */
export async function deleteFromDisk(relativePath: string) {
  const absolutePath = path.join(STORAGE_ROOT, relativePath);
  try {
    await fs.unlink(absolutePath);
    // Optionally cleanup empty parent directories
  } catch (error) {
    console.warn(`Failed to delete file at ${absolutePath}:`, error);
  }
}

/**
 * Reads a file from the disk.
 */
export async function readFromDisk(relativePath: string): Promise<Buffer> {
  const absolutePath = path.join(STORAGE_ROOT, relativePath);
  return await fs.readFile(absolutePath);
}
