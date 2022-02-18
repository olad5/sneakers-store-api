import multer from 'multer';
import path from 'path';
import DatauriParser from "datauri/parser.js";
import {CustomAPIError} from '../errors/custom-api.js';

const imageStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new CustomAPIError('Not an image! Please upload only images.', 400), false);
  }
};


const imageUpload = multer({
  storage: imageStorage,
  fileFilter: multerFilter

})

const imageUploadMiddleware = imageUpload.array('images', 4)

const parser = new DatauriParser();
const parsedImage = reqFile => parser.format(path.extname(reqFile.originalname).toString(), reqFile.buffer);// turns each file buffer to a URI
export {imageUploadMiddleware, parsedImage};
