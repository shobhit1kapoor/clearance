import { NextRequest, NextResponse } from "next/server";
import { apiError, assertSameOrigin, publicRequest, requestIdentity } from "@/lib/http";
import { retryAudit } from "@/lib/service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { id } = await params;
    const identity = requestIdentity(request);
    return NextResponse.json({ request: publicRequest(await retryAudit(id, identity.sessionHash)) });
  } catch (error) { return apiError(error); }
}
