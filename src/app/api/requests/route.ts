import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, assertSameOrigin, publicRequest, requestIdentity, withSession } from "@/lib/http";
import { createRequest } from "@/lib/service";

const bodySchema = z.object({ prompt: z.string().min(8).max(600) });

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const identity = requestIdentity(request);
    const { prompt } = bodySchema.parse(await request.json());
    const result = await createRequest(prompt, identity.sessionHash, identity.ipHash);
    return withSession(NextResponse.json({ request: publicRequest(result) }, { status: 201 }), identity.session, identity.isNew);
  } catch (error) { return apiError(error); }
}
