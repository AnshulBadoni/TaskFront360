let authenticatedUser:boolean | null = null;
export function setAuthenticatedUser(user: any) {
    try {
        authenticatedUser = user;
        return authenticatedUser;
    } catch (error) {
        return "Unable to set user";
    }

}
export function getAuthenticatedUser() {
    const user = authenticatedUser
    return user;
}

export const getMediaType = (url: string): 'image' | 'video' | 'audio' | 'document' | null => {
  if (/\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(url)) return 'image';
  if (/\.(mp4|mov|avi|webm|mkv)$/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg|flac)$/i.test(url)) return 'audio';
  if (/\.(pdf|docx?|xlsx?|pptx?|txt)$/i.test(url)) return 'document';
  return null;
};
