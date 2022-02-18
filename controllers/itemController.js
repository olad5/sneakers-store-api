import Item from '../models/Item.js'
import multer from 'multer';
import {CustomAPIError} from '../errors/custom-api.js';
import {parsedImage, imageUploadMiddleware} from '../utils/multerOps.js'
import * as cloudinaryOps from '../utils/cloudinaryOps.js'

const createItem = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Item.create(req.body);
  let data = await product.save();
  res.status(201).json({status: true, message: "Item Created", data});
};

const getAllItems = async (req, res) => {
  const products = await Item.find({});
  res.status(200).json({status: true, message: "Items retrieved", products, count: products.length});
};

const getSingleItem = async (req, res) => {
  const {id: productId} = req.params;

  const product = await Item.findOne({_id: productId})

  if (!product) {
    throw new CustomAPIError(`No product with id : ${productId}`, 404);
  }

  res.status(200).json({status: true, message: "Item retrieved", product});

};


const updateItem = async (req, res) => {
  const {id: productId} = req.params;
  const product = await Item.findOneAndUpdate({_id: productId}, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomAPIError(`No product with id : ${productId}`, 404);
  }

  res.status(200).json({status: true, message: "Item updated", product});
};

const deleteItem = async (req, res) => {
  const {id: productId} = req.params;
  const product = await Item.findOne({_id: productId});

  if (!product) {
    throw new CustomAPIError(`No product with id : ${productId}`, 404);
  }

  await product.remove();
  res.status(200).json({status: true, message: 'Success!, Item removed.'});

};


const uploadImages = async (req, res, next) => {

  imageUploadMiddleware(req, res, async function (err) {

    const imagefileSizes = req.files.map(file => file.size);//file sizes of images uploaded

    let isOverLimit = imagefileSizes.every(function (imageSize) {
      return imageSize < 1024 * 1024;// checks if the image Sizes are over 1MB
    });

    if ((req.files).length == 0) return next();// if there are no files, it means you just want to change the other item properties

    try {
      if ((req.files).length < 4) {// handles response when less than 4 files are uploaded
        throw new CustomAPIError('Please upload 4 images', 400);
      }
      if (!isOverLimit) {
        throw new CustomAPIError('Please upload images smaller than 1MB', 400);
      }

      if (err instanceof multer.MulterError) {

        if (err.code == 'LIMIT_UNEXPECTED_FILE') {//handler if more than 4 images are uploaded
          throw new CustomAPIError('Too many Files', 400);
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
      }
      next()
    } catch (error) {
      next(error)

    }

  })

};
export {createItem, getAllItems, getSingleItem, updateItem, deleteItem, uploadImages};
