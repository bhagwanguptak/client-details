import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> } // Use Promise type for Next.js 15
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "Client id is required" },
      { status: 400 }
    );
  }

  // Find the client first to get the userId for step 4
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    return NextResponse.json(
      { message: "Client not found" },
      { status: 404 }
    );
  }

  try {
    // We use a transaction to ensure all-or-nothing deletion
    await prisma.$transaction([
      // 1. Delete documents
      prisma.document.deleteMany({
        where: { clientId: id },
      }),

      // 2. Delete service assignments (THIS WAS THE MISSING STEP)
      prisma.clientService.deleteMany({
        where: { clientId: id },
      }),

      // 3. Delete the client
      prisma.client.delete({
        where: { id },
      }),

      // 4. Delete the user login account
      prisma.user.delete({
        where: { id: client.userId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { message: "Failed to delete client due to existing dependencies" },
      { status: 500 }
    );
  }
}