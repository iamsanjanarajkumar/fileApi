const {StatusCodes} = require('http-status-codes')
const User = require('../model/userModel')
const jwt = require('jsonwebtoken')


const authMiddleware = async(req, res,next) =>{
    try {
       const token = req.header('Authorization');  //token as input
       
       //validate token
       await jwt.verify(token , process.env.ACCESS_SECRET,(err, user) =>{
        if(err)
           return res.status(StatusCodes.UNAUTHORIZED).json({msg: `Invalid Authorization, Access Denied..`})

        //    res.json({user})// retrieve user id
        req.userId = user.id

        next() //pass the data to next controller or next middleware
       })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err.message});
    }
}

module.exports = authMiddleware