import { Request, Response } from "express";
import { db, bucket } from "../firebase";
import logger from "../utils/logger";

export async function downloadFile(req: Request, res: Response) {
  const { slug } = req.params;

  try {
    const doc = await db.collection("files").doc(slug).get();
    if (!doc.exists) {
      logger.warn(`No file found for slug: ${slug}`);
      return res.status(404).send("File not found");
    }

    const { uploadPath } = doc.data()!;
    const file = bucket.file(uploadPath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2025',
    });

    res.redirect(url);
  } catch (error) {
    logger.error(`Error fetching file for slug ${slug}:`, error);
    res.status(500).send("Failed to fetch file");
  }
}
