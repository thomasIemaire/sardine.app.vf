export type FileType = 'image' | 'pdf' | 'doc' | 'xls' | 'other';

export function getFileIcon(type: FileType): string {
  switch (type) {
    case 'image': return 'fa-duotone fa-solid fa-file-image';
    case 'pdf': return 'fa-duotone fa-solid fa-file-pdf';
    case 'doc': return 'fa-duotone fa-solid fa-file-word';
    case 'xls': return 'fa-duotone fa-solid fa-file-excel';
    default: return 'fa-duotone fa-solid fa-file';
  }
}

export function getFileIconColor(type: FileType): string {
  switch (type) {
    case 'image': return '#8b5cf6';
    case 'pdf': return '#ef4444';
    case 'doc': return '#3b82f6';
    case 'xls': return '#22c55e';
    default: return '#6b7280';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

export function getFileTypeFromMime(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
  return 'other';
}

export function getFileTypeFromName(fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext ?? '')) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext ?? '')) return 'doc';
  if (['xls', 'xlsx', 'ods', 'csv'].includes(ext ?? '')) return 'xls';
  return 'other';
}
