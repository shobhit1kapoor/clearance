import { NextRequest, NextResponse } from "next/server";
import { apiError, requestIdentity } from "@/lib/http";
import { store } from "@/lib/store";
import { publicRequest } from "../route";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const identity = requestIdentity(request);
    const result = await store.get(id);
    if (!result || result.sessionHash !== identity.sessionHash) return apiError(new Error("Request not found"), 404);
    return NextResponse.json({ request: publicRequest(result) });
  } catch (error) { return apiError(error); }
}
