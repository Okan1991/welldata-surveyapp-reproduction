/**
 * URL resolution utilities for handling questionnaire references
 */

/**
 * Validates and normalizes a URL
 * @param url The URL to validate and normalize
 * @returns The normalized URL or null if invalid
 */
export function normalizeUrl(url: string): string | null {
  try {
    const normalizedUrl = new URL(url);
    return normalizedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Resolves a questionnaire URL based on the current environment
 * @param url The URL to resolve
 * @param isDevelopment Whether we're in development mode
 * @returns The resolved URL
 */
export function resolveQuestionnaireUrl(url: string, isDevelopment: boolean = false): string {
  if (isDevelopment) {
    // In development, use local URLs
    return url.startsWith('http') ? url : `http://localhost:5176/surveys/${url}`;
  }
  
  // In production, ensure full URLs
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) {
    throw new Error(`Invalid questionnaire URL: ${url}`);
  }
  return normalizedUrl;
}

/**
 * Extracts version information from a URL if present
 * @param url The URL to extract version from
 * @returns The version string or null if not found
 */
export function extractVersion(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const version = urlObj.searchParams.get('version');
    return version || null;
  } catch {
    return null;
  }
}

/**
 * Validates if a URL is a valid questionnaire reference
 * @param url The URL to validate
 * @returns Whether the URL is valid
 */
export function isValidQuestionnaireUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Add any specific validation rules here
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Creates a versioned URL for a questionnaire
 * @param baseUrl The base URL of the questionnaire
 * @param version The version to add
 * @returns The versioned URL
 */
export function createVersionedUrl(baseUrl: string, version: string): string {
  const urlObj = new URL(baseUrl);
  urlObj.searchParams.set('version', version);
  return urlObj.toString();
} 