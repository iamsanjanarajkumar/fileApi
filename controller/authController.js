const { StatusCodes} = require('http-status-codes')
const User = require('../model/userModel')
const bcrypt = require('bcryptjs')
const createAuthToken = require('../util/createToken')
const jwt = require('jsonwebtoken')
const createPassToken = require('../util/createPassToken')
const PassToken  = require('../model/passTokenModel')
const mailConfig = require('../util/sendEmail')
const pass_template = require('../util/pass_temp')

//register new user
const signUp = async( req, res)=>{
    try {
        const data = req.body //receive data from front-end
        
        //validate data 
        const extEmail = await User.findOne({email: data.email})
        const extMobile = await User.findOne({mobile: data.mobile})
         
        //checking whether the data exists in the database or not
        if(extEmail){
          return  res.status(StatusCodes.CONFLICT).json({msg : `${data.email} already exits`})
        } else if(extMobile){
          return res.status(StatusCodes.CONFLICT).json({msg : `${data.mobile} already exits`})
        }

        //password encryption hash(string ,length of the hash)
        const encPass = await bcrypt.hash(data.password,10)

        //validate with model and save data in db collection
        const newUser = await User.create({
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          password: encPass,
          role:data.role
        })
         res.status(StatusCodes.OK).json({msg: `New user registered successfully `, newUser})
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err})   
    }
}

//login
const login = async( req, res)=>{
    try {
      const data = req.body;
       let extEmail, extMobile;

       //validate email
       if(data.email){
        extEmail = await User.findOne({email: data.email})

        //if email id not exists
        if(!extEmail){
          return res.status(StatusCodes.NOT_FOUND).json({msg: `${data.email} not found`});
        } else if(extEmail.isActive === false){
          return res.status(StatusCodes.CONFLICT).json({msg: `Sorry..Login Access Denied`});
        } else if(extEmail.isBlocked === true){
          return res.status(StatusCodes.CONFLICT).json({msg: `Sorry..Your Account is blocked`});
        }
        //authenticate through email
        let isMatch = await bcrypt.compare(data.password,extEmail.password);
        if(!isMatch)
          return res.status(StatusCodes.UNAUTHORIZED).json({msg: `Passwords are not matched`})

          //login token 
          const authToken = createAuthToken({id: extEmail._id })

          //store it in the cookie
          res.cookie('loginToken', authToken,{
            httpOnly :true,
            signed: true,
            path: `/api/auth/token`,
            maxAge: 1* 24 * 60 * 60 * 1000
          })

           return res.status(StatusCodes.OK).json({msg: "Login Successful(email)",authToken})
         }  else{
          //validate mobile
          extMobile = await User.findOne({mobile:data.mobile})

          if(!extMobile){
            return res.status(StatusCodes.NOT_FOUND).json({msg: `${data.mobile} number not found`})
          }else if(extMobile.isActive === false){
            return res.status(StatusCodes.CONFLICT).json({msg: `Sorry..Login Access Denied`});
          } else if(extMobile.isBlocked === true){
            return res.status(StatusCodes.CONFLICT).json({msg: `Sorry..Your Account is blocked`});
          } 
          //authenticate through mail
          let isMatch = await bcrypt.compare(data.password,extMobile.password);
          if(!isMatch)
            return res.status(StatusCodes.UNAUTHORIZED).json({msg: `Passwords are not matched`})

             //login token 
          const authToken = createAuthToken({id: extMobile._id })

          //store it in the cookie
          res.cookie('loginToken', authToken,{
            httpOnly :true,
            signed: true,
            path: `/api/auth/token`,
            maxAge: 1* 24 * 60 * 60 * 1000
          })

           return res.status(StatusCodes.OK).json({msg: "Login Successfully(mobile)",authToken})
          
          
        }
      }

        
     catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err})   
    }
}
//logout
const logout= async( req, res)=>{
    try {
        res.clearCookie('loginToken', {path: `/api/auth/token`})

        res.status(StatusCodes.OK).json({msg: `Logout Successful`})
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err})   
    }
}

//login auth token
const authToken = async( req, res)=>{
    try {
      //session management
      const rToken = req.signedCookies.loginToken

      if(!rToken)
        return res.status(StatusCodes.CONFLICT).json({msg: `Token not available, Login Again...`})

        //validate the user id
        await jwt.verify(rToken,process.env.ACCESS_SECRET,(err,user) =>{
           if(err)
              return res.status(StatusCodes.UNAUTHORIZED).json({msg: `Invalid Token or Expired ... Login Again...`})

            res.status(StatusCodes.OK).json({ authToken : rToken })
        })
      
        
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err})   
    }
}

//to get current active user info 
const getUserInfo = async (req, res) =>{
   try {
      let id = req.userId;
      
      let user = await User.findById({_id: id} ).select('-password');
        if(!user)
          return res.status(StatusCodes.NOT_FOUND).json({msg: `Requested user id not found`})

          res.status(StatusCodes.ACCEPTED).json({user})

   } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err}) 
   }
}

//generate forgot password link
const generatePassLink = async(req, res) =>{
  try {
     let {email} = req.body

     let extUser= await User.findOne({email})
       if(!extUser)
          return res.status(StatusCodes.NOT_FOUND).json({msg: `Requested user data not found`})
      
      let passToken = createPassToken({id: extUser._id})
       
      let extEmail = await PassToken.findOne({ user_email: email})
           if(extEmail)
              return res.status(StatusCodes.CONFLICT).json({msg: `Password token link already generated ..Check your email inbox/spam folder`})
       
        //save data into DB      
       let savedToken = await PassToken.create({ user_email: email, token: passToken })
      
      //generate the template
      let template = pass_template(email,passToken,"https://rest.api-project.vercel.com")

      //sending email
      let emailRes = await mailConfig(email, "New Password Generate link" , template)

    res.status(StatusCodes.ACCEPTED).json({msg:`Token sent successfully..Check your email inbox/spam folder`, savedToken , emailRes })
      
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err.message})
  }
}

//validate password link and update password logic
const updatePassword = async(req,res) =>{
  try {
       let {email,token , password} =req.body

       //read the token from passToken
       let extData = await PassToken.findOne({ user_email : email})
         if(!extData) 
           return res.status(StatusCodes.NOT_FOUND).json({msg: `Requested email not found`})
       
      
      // token compare logic
      await jwt.verify(token, process.env.ACCESS_SECRET, async (err, user) => {
        if(err)
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Invalid Token..`})
    
        // update password
        //password encryption hash(string,length)
         const encPass= await bcrypt.hash(password,10)

         await User.findIdAndUpdate({ _id: user.id} ,{password:encPass})
         await PassToken.findIdAndDelete({_id: extData._id})
       
           res.status(StatusCodes.OK).json({msg: `Passwords updated successfully`})
    })

      

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err.message}) 
  }
}
module.exports = { signUp,login , logout , authToken, getUserInfo , generatePassLink , updatePassword}