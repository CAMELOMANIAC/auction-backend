import { Request } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { extension } from "mime-types";

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "uploads/");
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = randomUUID();
    const fileExtension = extension(file.mimetype);
    const fileName = `${uniqueName}.${fileExtension}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });
export default upload;
