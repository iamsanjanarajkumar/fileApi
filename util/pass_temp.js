
const forgot_pass_template = (email, token,url) =>{
    return `<html>
            <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
             *{
                box-sizing: border-box;
             }
             body{
                margin:0;
                height: 50vh;
                width: 100%;
                overflow-x: hidden;
                display: flex;
                background-color: #ccc;
                justify-content: center;
                align-items: center;
                
             }
             .container{
                display: flex;
                width: 50vw;
                background-color: #fff;
                justify-content: center;
                align-items: center;
                padding: 20px;
                color: #222;
                gap: 30px;
                flex-direction: column;
             }
             .title h1{
                text-align: center;
                color: slateblue;
             }
             .content{
                text-align: center;
             }
             .content .btn{
                padding: 12px 14px;
                width:5vw;
                background-color: orangered;
                color: #fff;
                font-weight: bold;
                font-size: 1.2rem;
                 border:none;
                 border-radius: 10px;
                 text-decoration: none;
                 cursor: pointer;
             }
             @media screen and (max-width:768px){
                container{
                    width:100%;
                    height:100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 100px;
                }
             }

            </style>
            
            </head>
               <body>
                 <div class="container">
                   <div class="title">
                      <h1>Password Reset</h1> 
                   </div>
                   <div class="content">
                   <p>Seems like you have forgotten your password for ${url}. If this is true, click below link to reset your password.</p>
                   <a href="${url}/email/${email}/token/${token}" class="btn" target="_blank">Reset My Password </a>
                   </div>
                   <div class="note">
                    <p> If you did not forget your password you can safely ignore this email </p>
                   </div>
                 </div>
               
               
               
               </body>
    
    
    
    
    </html>`
}

module.exports = forgot_pass_template