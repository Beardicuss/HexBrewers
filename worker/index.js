const APP_PREFIX = "releases/current/app";
const R2_PUBLIC_ORIGIN = "https://pub-7b92547fbe944d259e437d18c1c425d4.r2.dev";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    let object = await env.RELEASE_BUCKET.get(`${APP_PREFIX}/${requestedPath}`);

    if (!object && !requestedPath.includes(".")) {
      object = await env.RELEASE_BUCKET.get(`${APP_PREFIX}/index.html`);
    }
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("x-content-type-options", "nosniff");
    headers.set("x-frame-options", "DENY");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    headers.set("content-security-policy", [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${R2_PUBLIC_ORIGIN}`,
      `media-src 'self' blob: ${R2_PUBLIC_ORIGIN}`,
      `connect-src 'self' ${R2_PUBLIC_ORIGIN}`,
      "font-src 'self' data:",
      "worker-src 'self' blob:",
    ].join("; "));
    headers.set("cache-control", requestedPath === "index.html"
      ? "no-cache"
      : "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  },
};
