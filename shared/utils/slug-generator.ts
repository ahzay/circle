export const generateSlug = (name: string): string => {
  return name.toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '')     // Trim hyphens from start and end
    + '-' + Math.random().toString(36).substring(2, 8); 
};