import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const bucketName = "fbiad-burs-documents";
const bucket = storage.bucket(bucketName);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Check Size Limits (10 MB MVP)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 10) {
            return NextResponse.json({ error: `Dosya boyutu çok büyük. İzin verilen maksimum boyut: 10 MB.` }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${uniqueSuffix}-${originalName}`;

        const gcsFile = bucket.file(filename);

        // Upload to GCS
        await gcsFile.save(buffer, {
            resumable: false,
            metadata: {
                contentType: file.type || 'application/octet-stream',
            }
        });

        // The bucket is public-read, so we can use the direct storage.googleapis.com URL
        const fileUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
}
