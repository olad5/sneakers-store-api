import {StatusCodes} from 'http-status-codes'
import Item from '../models/Item.js'
import multer from 'multer';
import *  as CustomError from '../errors/index.js'
import {parsedImage, imageUploadMiddleware} from '../utils/multerOps.js'
import * as cloudinaryOps from '../utils/cloudinaryOps.js'



const createItem = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Item.create(req.body);
  res.status(StatusCodes.CREATED).json({product});
};

const getAllItems = async (req, res) => {
  const products = await Item.find({});

  res.status(StatusCodes.OK).json({products, count: products.length});
};

const getSingleItem = async (req, res) => {
  const {id: productId} = req.params;

  try {
    const product = await Item.findOne({_id: productId})

    if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }

    res.status(StatusCodes.OK).json({product});
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({message: error.message});
  }


};


const updateItem = async (req, res) => {
  const {id: productId} = req.params;

  const product = await Item.findOneAndUpdate({_id: productId}, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({product});
};

const deleteItem = async (req, res) => {
  const {id: productId} = req.params;
  try {
    const product = await Item.findOne({_id: productId});

    if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    await product.remove();
    res.status(StatusCodes.OK).json({message: 'Success! Item removed.'});

  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({message: error.message});
  }


};


const uploadImages = async (req, res, next) => {

  imageUploadMiddleware(req, res, async function (err) {
    if ((req.files).length == 0) return next();// if there are no files, it means you just want to change the other item properties
    try {
      if ((req.files).length < 4) {// handles response when less than 4 files are uploaded
        throw new CustomError.BadRequestError('Please upload 4 images');
      }

      if (err instanceof multer.MulterError) {
        if (err.code == 'LIMIT_FILE_SIZE') {
          throw new CustomError.BadRequestError('Please upload image smaller than 1MB');
        }

        if (err.code == 'LIMIT_UNEXPECTED_FILE') {//handler if more than 4 images are uploaded
          throw new CustomError.BadRequestError('Too many Files');
        }

      }

      let uploader = async (path) => await cloudinaryOps.uploads(path, "Items")
      let files = req.files
      req.body.images = [];//holds the array to send the image links to the next middleware

      for (let i = 0; i < files.length; i++) {
        let file = files[i]
        let path = parsedImage(file).content// turns  each file to a URI
        let newPath = await uploader(path)// uploads the data to cloudinary
        req.body.images.push(newPath.url)// send the images links to the next middleware to update the DB)
        console.log('files uploaded successfully')


      }
      next()
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({message: error.message});

    }

  })

};
export {createItem, getAllItems, getSingleItem, updateItem, deleteItem, uploadImages, imageUploadMiddleware};
