import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, assertSameOrigin, requestIdentity } from "@/lib/http";
import { approveRequest } from "@/lib/service";
import { publicRequest } from "../../route";

const schema = z.object({ confirmation: z.string().max(80).optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { id } = await params;
    const identity = requestIdentity(request);
    const body = schema.parse(await request.json().catch(() => ({})));
    const result = await approveRequest(id, identity.sessionHash, body.confirmation);
    return NextResponse.json({ request: publicRequest(result) });
  } catch (error) { return apiError(error); }
}
