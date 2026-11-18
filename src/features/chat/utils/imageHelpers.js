/**
 * Normalizes an image representation into a valid React Native Image source URI.
 * Supports data URIs, raw base64, remote URLs, and local file URIs.
 */
export function normalizeImageUri(imageInfo) {
  if (!imageInfo || typeof imageInfo !== 'string') return null;

  const trimmed = imageInfo.trim();
  if (!trimmed) return null;

  // Already a data URI
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Remote or local URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('ph://')
  ) {
    return trimmed;
  }

  // Check if string looks like raw base64
  const cleaned = trimmed.replace(/\s/g, '');
  return `data:image/jpeg;base64,${cleaned}`;
}

/**
 * Checks if a string is a probable base64 string
 */
export function isBase64String(str) {
  if (!str || typeof str !== 'string') return false;
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  const cleaned = str.replace(/\s/g, '');
  return cleaned.length > 50 && base64Regex.test(cleaned.slice(0, 100));
}
