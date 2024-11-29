export function getCloudinaryUrl(path, options = {}) {
  if (!path) return '';
  
  if (path.startsWith('https://res.cloudinary.com')) {
    return path;
  }

  if (path.startsWith('/')) {
    return path;
  }

  const { width = 1000, height = 1000, quality = 'auto' } = options;
  
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_limit,w_${width},h_${height},q_${quality}/${path}`;
} 