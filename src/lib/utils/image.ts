export function getProductThumbnail(imageString?: string | null): string {
  if (!imageString) {
    return 'https://images.unsplash.com/photo-1590748152599-2a2ec96a40a4?auto=format&fit=crop&w=400&q=80';
  }
  try {
    const parsed = JSON.parse(imageString);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
  } catch (e) {
    // If it's not a JSON string, assume it's a direct URL string
    return imageString;
  }
  return 'https://images.unsplash.com/photo-1590748152599-2a2ec96a40a4?auto=format&fit=crop&w=400&q=80';
}

export function getProductImages(imageString?: string | null): string[] {
  if (!imageString) {
    return [];
  }
  try {
    const parsed = JSON.parse(imageString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Fallback if it's a direct URL
    return [imageString];
  }
  return [];
}
