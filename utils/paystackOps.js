import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()


const secretKey = `Bearer ${process.env.PAYSTACK_SECRET}`

// initializes paystack payment
const initializePayment = async (body) => {
  try {
    let url = 'https://api.paystack.co/transaction/initialize'

    let config = {
      headers: {
        authorization: secretKey,
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
    };

    const res = await axios.post(url, body, config);
    return res.data
  } catch (error) {
    let {message, name, response: {status}} = error
    return {message, name, status: status}
  }

}



// verifys paystack payment
const verifyPayment = async (ref) => {
  try {
    let url = 'https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref)

    let config = {
      headers: {
        authorization: secretKey,
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
    };

    const res = await axios.get(url, config);
    return res.data

  } catch (error) {
    let {message, name, response: {status}} = error
    return {message, name, status: status}

  }

}

export {initializePayment, verifyPayment}
