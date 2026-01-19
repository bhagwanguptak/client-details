export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "ap-southeast-1",
  endpoint: process.env.S3_ENDPOINT, // Should be https://ref.supabase.co/storage/v1/s3
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      console.error("DB Error: Document ID not found:", id);
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // 🟢 DEBUG: Check the path. If it has a leading slash, remove it.
    let cleanKey = document.fileUrl;
    if (cleanKey.startsWith('/')) cleanKey = cleanKey.substring(1);
    if (cleanKey.startsWith('documents/')) cleanKey = cleanKey.replace('documents/', '');

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME, // should be 'documents'
      Key: cleanKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    
    console.log("SUCCESS! Generated Signed URL:", url);
    return NextResponse.redirect(url);

  } catch (error: any) {
    console.error("CRITICAL S3 ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let cleanKey = document.fileUrl;
    if (cleanKey.startsWith('/')) cleanKey = cleanKey.substring(1);

    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: cleanKey,
    }));

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}