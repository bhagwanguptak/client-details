import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for Supabase S3
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string;
    const subServiceId = formData.get("subServiceId") as string;

    const buffer = Buffer.from(await file.arrayBuffer());
    // Path structure: client/subservice/timestamp-filename
    const fileKey = `${clientId}/${subServiceId}/${Date.now()}-${file.name}`;

    // 1. Upload to S3 (Supabase Storage)
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    }));

    // 2. Save to Prisma using your schema
    const newDoc = await prisma.document.create({
      data: {
        fileName: file.name,
        fileUrl: fileKey, // Store the Key for generating signed URLs later
        clientId: clientId,
        subServiceId: subServiceId,
      },
    });

    return NextResponse.json({ success: true, docId: newDoc.id });
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}