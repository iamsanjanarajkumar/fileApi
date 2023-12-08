const {StatusCodes} = require('http-status-codes')
const User = require('../model/userModel')

//read all the users list
 const readAll = async(req, res) =>{
   try {
    let users = await User.find({})//model.find() -> to read all the values in DB collection
    
    //filtering the admin from the DB
    let fUsers = users.filter(item => item.role !== "admin")

    return res.status(StatusCodes.OK).json({length: fUsers.length , users: fUsers})
    
   } catch (err) {
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message});
   }
 }

//changing the role
const changeRole = async(req, res) =>{
try {
     let id = req.params.id
     
     let extUser = await User.findById({_id: id})
      if(!extUser)
        return res.status(StatusCodes.NOT_FOUND).json({msg: `Requested user ID not found`})

     await User.findByIdAndUpdate({_id: id} , {role: req.body.role})

     res.status(StatusCodes.ACCEPTED).json({msg: `User Role updated successfully`})
    
} catch (err) {
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message})
}
}

//blocked the user
const blockUser = async(req, res) =>{
try {
     let id = req.params.id
     
     let extUser = await User.findById({_id: id})
      if(!extUser)
        return res.status(StatusCodes.NOT_FOUND).json({msg: `Requested user ID not found`})

     if(extUser.isBlocked === true){
          await User.findByIdAndUpdate({_id: id}, {isBlocked : req.body.isBlocked})
          return res.status(StatusCodes.ACCEPTED).json({msg: `User unblocked successfully`})
     } else{
          await User.findByIdAndUpdate({_id: id}, {isBlocked : req.body.isBlocked})
          return res.status(StatusCodes.ACCEPTED).json({msg: `User blocked successfully`})
     }
} catch (err) {
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message})
}
}

//disable the user account
const disableUser = async(req, res) =>{
try {
     let id = req.params.id
     
     let extUser = await User.findById({_id: id})
      if(!extUser)
        return res.status(StatusCodes.NOT_FOUND).json({msg: `Requested user ID not found`})

     if(extUser.isActive === false){
          await User.findByIdAndUpdate({_id: id}, {isActive : req.body.isActive})
          return res.status(StatusCodes.ACCEPTED).json({msg: `User disabled successfully`})
     } else{
          await User.findByIdAndUpdate({_id: id}, {isActive : req.body.isActive})
          return res.status(StatusCodes.ACCEPTED).json({msg: `User is Active Now`})
     }
    
} catch (err) {
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message})
}
}

//validate user email 
const validateEmail = async(req,res) =>{
     try {
          let {email} = req.body

          let extEmail = await User.findOne({ email})
             if(!extEmail)
               return res.status(StatusCodes.NOT_FOUND).json({msg : `Requested email id is not found`})
          
          return res.status(StatusCodes.ACCEPTED).json({msg :`Valid user email id`})
     } catch (err) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message})  
     } 
}

module.exports = {readAll ,changeRole , blockUser , disableUser , validateEmail}