import express from "express";
import cors from "cors";
import multer from "multer";
import { removeBackground } from "@imgly/background-removal-node";

import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import { writeFile, unlink } from "fs/promises";
import { pathToFileURL } from "url";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.raw({ type: 'image/*', limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  let inPath = null;

  try {
    if (!req.file?.buffer) return res.status(400).send("Missing file 'image'");

    console.log("Received:", {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });

    // Save original file directly (removeBackground handles format conversion)
    inPath = join(tmpdir(), `bg-in-${randomUUID()}-${req.file.originalname}`);
    await writeFile(inPath, req.file.buffer);

    const fileUrl = pathToFileURL(inPath).href; // => file:///C:/...
    console.log("Processing with URL:", fileUrl);
    
    const outBlob = await removeBackground(fileUrl);

    // 3) Blob -> Buffer
    const outArrayBuffer = await outBlob.arrayBuffer();
    const outBuffer = Buffer.from(outArrayBuffer);

    console.log("Success! Returning PNG bytes:", outBuffer.length);

    // Clean up temp file BEFORE sending response
    if (inPath) {
      try { await unlink(inPath); } catch (e) { console.error("Cleanup error:", e); }
    }

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": outBuffer.length,
      "Cache-Control": "no-store"
    });
    res.end(outBuffer, 'binary');
  } catch (err) {
    console.error("remove-bg failed:", err?.stack || err);
    
    // Clean up on error too
    if (inPath) {
      try { await unlink(inPath); } catch {}
    }
    
    if (!res.headersSent) {
      return res.status(500).json({ error: "Background removal failed", message: err?.message });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
