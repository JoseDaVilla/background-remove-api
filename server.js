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

// Memory optimization: Reduce file size limit for low-memory environments
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (reduced from 10MB)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

// Request queue to prevent multiple concurrent processing (memory spike prevention)
let isProcessing = false;
const requestQueue = [];

app.get("/health", (_, res) => res.json({ ok: true }));

// Queue processor
async function processQueue() {
  if (requestQueue.length === 0 || isProcessing) return;
  
  isProcessing = true;
  const { req, res, inPath } = requestQueue.shift();
  
  try {
    await processBackgroundRemoval(req, res, inPath);
  } finally {
    isProcessing = false;
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    // Process next in queue after a small delay
    setTimeout(processQueue, 100);
  }
}

async function processBackgroundRemoval(req, res, inPath) {
  try {
    const fileUrl = pathToFileURL(inPath).href;
    console.log("Processing with URL:", fileUrl);
    
    // Configure removeBackground for low memory usage
    const outBlob = await removeBackground(fileUrl, {
      output: {
        quality: 0.8,
        format: 'png',
      },
    });

    // Convert to buffer
    const outArrayBuffer = await outBlob.arrayBuffer();
    const outBuffer = Buffer.from(outArrayBuffer);

    console.log("Success! Returning PNG bytes:", outBuffer.length);

    // Clean up IMMEDIATELY to free memory
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
    
    // Clean up on error
    if (inPath) {
      try { await unlink(inPath); } catch {}
    }
    
    if (!res.headersSent) {
      return res.status(500).json({ error: "Background removal failed", message: err?.message });
    }
  }
}

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  let inPath = null;

  try {
    if (!req.file?.buffer) return res.status(400).send("Missing file 'image'");

    console.log("Received:", {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      queueLength: requestQueue.length,
    });

    // Check queue size - reject if too many pending
    if (requestQueue.length >= 3) {
      return res.status(503).json({ 
        error: "Server busy", 
        message: "Too many requests. Please try again in a moment." 
      });
    }

    // Save to temp file
    inPath = join(tmpdir(), `bg-in-${randomUUID()}-${req.file.originalname}`);
    await writeFile(inPath, req.file.buffer);
    
    // Clear the buffer from memory immediately
    req.file.buffer = null;

    // Add to queue
    requestQueue.push({ req, res, inPath });
    processQueue();

  } catch (err) {
    console.error("Upload failed:", err?.stack || err);
    
    if (inPath) {
      try { await unlink(inPath); } catch {}
    }
    
    if (!res.headersSent) {
      return res.status(500).json({ error: "Upload failed", message: err?.message });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
