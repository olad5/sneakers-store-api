import {StatusCodes} from 'http-status-codes'

export const getAllItems = async (req, res) => {
  res.status(StatusCodes.OK).json({message: 'hello there'})
}

export const createItem = async (req, res) => {
  res.status(StatusCodes.CREATED).json({message: 'created stuff'})
}

