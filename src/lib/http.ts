import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { opaqueHash } from "./security";

export function requestIdentity(request: NextRequest) {
  const session = request.cookies.get("clearance_session")?.value || randomUUID();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return { session, sessionHash: opaqueHash(session), ipHash: opaqueHash(`ip:${forwarded}`), isNew: !request.cookies.has("clearance_session") };
}

export function withSession<T>(response: NextResponse<T>, session: string, isNew: boolean) {
  if (isNew) response.cookies.set("clearance_session", session, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24, path: "/" });
  return response;
}

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_APP_URL;
  if (origin && expected && new URL(origin).origin !== new URL(expected).origin) throw new Error("Cross-origin request rejected");
}

export function apiError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Unexpected request failure";
  return NextResponse.json({ error: message }, { status });
}

export function publicRequest<T extends { sessionHash: string; ipHash: string }>(request: T) {
  const { sessionHash: _sessionHash, ipHash: _ipHash, ...safe } = request;
  return safe;
}
