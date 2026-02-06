type AuthenticatedUser = Record<string, unknown> | null;

let authenticatedUser: AuthenticatedUser = null;

export function setAuthenticatedUser(user: AuthenticatedUser) {
  authenticatedUser = user;
  return authenticatedUser;
}

export function getAuthenticatedUser() {
  return authenticatedUser;
}

export const getMediaType = (url: string): 'image' | 'video' | 'audio' | 'document' | null => {
  if (/\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(url)) return 'image';
  if (/\.(mp4|mov|avi|webm|mkv)$/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg|flac)$/i.test(url)) return 'audio';
  if (/\.(pdf|docx?|xlsx?|pptx?|txt)$/i.test(url)) return 'document';
  return null;
};
