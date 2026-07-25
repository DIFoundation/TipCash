import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyAccessToken } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  sendTransaction,
  // validateAddress
} from "@/lib/zcash";
import { z } from "zod";

const proposeSchema = z.object({
  toAddress: z.string(),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 },
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = proposeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.flatten() },
        { status: 400 },
      );
    }

    const { toAddress, amount } = validationResult.data;

    // Validate recipient address
    // const recipientValid = await validateAddress(payload.userId, toAddress);
    // if (!recipientValid.isvalid) {
    //   return NextResponse.json(
    //     { error: 'Invalid recipient address' },
    //     { status: 400 }
    //   );
    // }

    // Propose transaction (use userId, not address)
    const proposal = await sendTransaction(
      payload.userId,
      toAddress,
      amount,
    );

    // Parse the proposal output to extract details
    let proposalData;
    try {
      proposalData = JSON.parse(proposal);
    } catch {
      // If not JSON, return raw output
      proposalData = { raw: proposal };
    }

    return NextResponse.json({
      proposal: proposalData,
      toAddress,
      amount,
      status: "proposed",
    });
  } catch (error) {
    console.error("Propose transaction error:", error);
    return NextResponse.json(
      { error: "Failed to propose transaction" },
      { status: 500 },
    );
  }
}
