// Polyfill crypto.randomUUID for non-secure contexts (HTTP dev).
// crypto.randomUUID() requires HTTPS; this uses crypto.getRandomValues() which works over HTTP.
if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID !== "function") {
  globalThis.crypto.randomUUID = () =>
    "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
    ) as `${string}-${string}-${string}-${string}-${string}`;
}
