export function getSafeImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return "/placeholder.png";

  try {
    const url = new URL(imageUrl);

    const allowedHosts = ["res.cloudinary.com", "images.unsplash.com"];

    if (allowedHosts.includes(url.hostname)) {
      return imageUrl;
    }

    return "/placeholder.png";
  } catch {
    return "/placeholder.png";
  }
}