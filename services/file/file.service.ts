import prisma from "@/lib/prisma";
import { 
  calculateHash, 
  ensureStorageRoot, 
  saveToDisk, 
  deleteFromDisk,
  getFilePaths 
} from "@/lib/storage/core";
import path from "node:path";

export class FileService {
  private static instance: FileService;

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Upload a file with deduplication.
   * Receives a Buffer or a File-like object.
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ) {
    await ensureStorageRoot();

    const hash = calculateHash(buffer);
    const extension = path.extname(filename).replace(".", "");
    const size = buffer.length;

    // 1. Check if file already exists in DB
    const existingFile = await prisma.file.findUnique({
      where: { hash }
    });

    if (existingFile) {
      return existingFile;
    }

    // 2. Save to disk
    const relativePath = await saveToDisk(buffer, hash, extension);

    // 3. Create record in DB
    const newFile = await prisma.file.create({
      data: {
        hash,
        filename,
        extension,
        mimeType,
        size,
        path: relativePath,
      }
    });

    return {
      ...newFile,
      url: `/storage/${relativePath.replace(/\\/g, "/")}`
    };
  }

  /**
   * Helper to get public URL from internal path.
   */
  getPublicUrl(relativePath: string): string {
    return `/storage/${relativePath.replace(/\\/g, "/")}`;
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string) {
    return await prisma.file.findUnique({
      where: { id }
    });
  }

  /**
   * Delete a file (record and potentially disk if no other references exist)
   * Note: In a deduplicated system, we should ideally count references.
   * For now, we'll just delete the record. Permanent disk deletion might 
   * need a background job or reference counting.
   */
  async deleteFile(id: string) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return false;

    // Delete record
    await prisma.file.delete({ where: { id } });

    // Check if any other records use the same hash
    const otherReferences = await prisma.file.findFirst({
      where: { hash: file.hash }
    });

    if (!otherReferences) {
      await deleteFromDisk(file.path);
    }

    return true;
  }
}

export const fileService = FileService.getInstance();
