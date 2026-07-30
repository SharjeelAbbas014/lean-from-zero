import { compressToEncodedURIComponent } from "lz-string";

const LEAN_PLAYGROUND = "https://live.lean-lang.org";

export function buildLeanPlaygroundUrl(code: string, mobile = false): string {
  const plain = `#code=${encodeURIComponent(code)}`;
  const compressed = `#codez=${compressToEncodedURIComponent(code)}`;
  const hash = compressed.length < plain.length ? compressed : plain;
  const params = mobile ? "?mobile=true" : "";
  return `${LEAN_PLAYGROUND}/${params}${hash}`;
}

export const LEAN_PLAYGROUND_ORIGIN = LEAN_PLAYGROUND;
