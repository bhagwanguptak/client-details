import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

// ================= DELETE HANDLER =================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 🟢 Correctly uses Promise
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    // 1. Delete the physical file from Supabase S3
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: document.fileUrl,
        ResponseContentDisposition: `attachment; filename="${document.fileName}"`,
      }));
    } catch (s3Error) {
      console.error("Storage Deletion Failed:", s3Error);
    }

    // 2. Delete database record
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

// ================= GET HANDLER (Signed URL) =================
export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // 🟢 Changed to Promise to match DELETE
) {
  try {
    const { id } = await params; // 🟢 Await the params

    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Generate a signed URL valid for 60 seconds
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: document.fileUrl,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}