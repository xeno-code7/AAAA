export const encodeWA = (text) => {
  return encodeURIComponent(text)
    .replace(/%20/g, "+"); // biar lebih rapi seperti pesan WA asli
};
