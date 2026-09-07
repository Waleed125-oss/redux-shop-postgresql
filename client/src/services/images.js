const API_ORIGIN = import.meta.env.VITE_API_URL;

export const getImageUrl = (image) => {
  if (!image) return "";
  return image.startsWith("http") ? image : `${API_ORIGIN}${image}`;
};
