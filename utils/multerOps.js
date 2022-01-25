import multer from 'multer';
import path from 'path';
import DatauriParser from "datauri/parser.js";

const imageStorage = multer.memoryStorage();

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image')) {
      return cb(new CustomError.BadRequestError('Please Upload Images'))
    }
    cb(undefined, true)
  }
}
)

const imageUploadMiddleware = imageUpload.array('images', 4)

const parser = new DatauriParser();
const parsedImage = reqFile => parser.format(path.extname(reqFile.originalname).toString(), reqFile.buffer);// turns each file buffer to a URI
export {imageUploadMiddleware, parsedImage};
