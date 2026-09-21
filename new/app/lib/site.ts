export const SITE_NAME = "BukitJalilStadium.com";
export const SITE_URL = "https://bukitjalilstadium.com";

const STORAGE_URL = "https://storage.bukitjalilstadium.com";

export function photoUrl(objectKey: string): string {
  return `${STORAGE_URL}/${objectKey}`;
}
