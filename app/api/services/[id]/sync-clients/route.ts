import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: serviceId } = await context.params;

  // 1️⃣ Get all active subservices
  const subServices = await prisma.subService.findMany({
    where: {
      serviceId,
      active: true,
    },
  });

  // 2️⃣ Get all clients having this service
  const clientServices = await prisma.clientService.findMany({
    where: { serviceId },
    select: { clientId: true },
    distinct: ["clientId"],
  });

  // 3️⃣ Delete old mappings for this service
  await prisma.clientService.deleteMany({
    where: { serviceId },
  });

  // 4️⃣ Recreate mappings
  const rows = clientServices.flatMap((cs) =>
    subServices.length === 0
      ? [{
          clientId: cs.clientId,
          serviceId,
        }]
      : subServices.map((ss) => ({
          clientId: cs.clientId,
          serviceId,
          subServiceId: ss.id,
        }))
  );

  if (rows.length > 0) {
    await prisma.clientService.createMany({
      data: rows,
    });
  }

  return NextResponse.json({ success: true });
}
