import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { calculateHash } from "@/lib/storage/core";
import path from "node:path";

export class FileService {
  private static instance: FileService;
  private readonly BUCKET_NAME = "zmenu-storage";

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Upload a file with deduplication to Supabase Storage.
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ) {
    const hash = calculateHash(buffer);
    const extension = path.extname(filename).replace(".", "");
    const size = buffer.length;

    // 1. Check if file already exists in DB (Deduplication)
    const existingFile = await prisma.file.findUnique({
      where: { hash }
    });

    if (existingFile) {
      return {
        ...existingFile,
        url: this.getPublicUrl(existingFile.path)
      };
    }

    // 2. Upload to Supabase Storage
    const storagePath = `${hash}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      throw new Error(`Failed to upload file to Supabase: ${error.message}`);
    }

    // 3. Create record in DB
    const newFile = await prisma.file.create({
      data: {
        hash,
        filename,
        extension,
        mimeType,
        size,
        path: data.path, // Store the bucket path
      }
    });

    return {
      ...newFile,
      url: this.getPublicUrl(newFile.path)
    };
  }

  /**
   * Helper to get public URL from Supabase Storage.
   */
  getPublicUrl(storagePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(storagePath);
      
    return data.publicUrl;
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string) {
    const file = await prisma.file.findUnique({
      where: { id }
    });
    
    if (file) {
      return {
        ...file,
        url: this.getPublicUrl(file.path)
      };
    }
    return null;
  }

  /**
   * Delete a file from Supabase and DB
   */
  async deleteFile(id: string) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return false;

    // Delete record from DB
    await prisma.file.delete({ where: { id } });

    // Check if any other records use the same hash
    const otherReferences = await prisma.file.findFirst({
      where: { hash: file.hash }
    });

    // If no more references, delete from Supabase Storage
    if (!otherReferences) {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([file.path]);
        
      if (error) {
        console.error("Failed to delete from Supabase Storage:", error);
      }
    }

    return true;
  }
}

export const fileService = FileService.getInstance();
