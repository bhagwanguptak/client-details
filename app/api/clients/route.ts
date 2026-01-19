import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          active: true,
        },
      },
      services: {
        include: {
          service: { select: { name: true } },
          subService: { select: { name: true } },
        },
      },
    },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const {
    name,
    organization,
    email,
    phone,
    serviceId,
    subServiceId, // 🟢 1. Accept subServiceId from the UI
  } = await req.json();

  if (!name || !email || !phone || !serviceId) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  const hashedPhone = await bcrypt.hash(phone, 10);
  const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);

  // 1  Create USER
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: normalizedPhone,
      phoneHash: hashedPhone,
      role: "CLIENT",
      active: true,
    },
  });

  // 2 Create CLIENT
  const client = await prisma.client.create({
    data: {
      name,
      organization,
      userId: user.id,
    },
  });

  // 3  ASSIGN CLIENT SERVICES
  if (subServiceId) {
    //  2. If a specific sub-service was selected in the dropdown, assign ONLY that one
    await prisma.clientService.create({
      data: {
        clientId: client.id,
        serviceId,
        subServiceId,
      },
    });
  } else {
    // 3. Fallback logic: If no specific sub-service was selected
    const subServices = await prisma.subService.findMany({
      where: { serviceId, active: true },
    });

    if (subServices.length === 0) {
      // Service has no sub-services at all, assign parent only
      await prisma.clientService.create({
        data: {
          clientId: client.id,
          serviceId,
        },
      });
    } else {
      //  Optional: You can choose to assign ALL if nothing was selected, 
      // or simply do nothing/throw error. Here we keep your "Auto-assign all" logic
      // only if the user didn't pick a specific one.
      await prisma.clientService.createMany({
        data: subServices.map((ss) => ({
          clientId: client.id,
          serviceId,
          subServiceId: ss.id,
        })),
      });
    }
  }

  return NextResponse.json(client);
}