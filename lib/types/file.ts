export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileUploadOptions {
  allowedTypes: string[];
  maxSizeMB?: number;
  folder?: string;
}
