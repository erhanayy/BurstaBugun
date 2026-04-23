import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from "path";

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

        // Upload dizinini kontrol et ve oluştur
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);

        // Tarayıcıdan erişilebilecek URL
        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
}
