const User = require("../models/user");


module.exports.signup = async(req,res)=>{

    try{
      let {username,email,password} = req.body;
      const newUser = new User({username,email});
      const  registerUser = await User.register(newUser,password);
       console.log(registerUser);
       req.login(registerUser,(err)=>{
             if(err){
              return next(err);
             }
       req.flash("success","welcome to wanderlust");
       res.redirect("/listings")
       })
       
    }catch(e){
      req.flash("error",e.message);
      res.redirect("/signup")
    }
    
  }

  module.exports.signin = (req,res)=>{
    req.flash(  "success","welcome  black , to wanderlust ")
    // res.locals.redirectUrl
    let RedirectUrl = res.locals.redirectUrl || "/listings" ;
      res.redirect(RedirectUrl);
    }

    module.exports.logout = (req,res,next)=>{
        req.logOut((err)=>{
          if(err){
           return next(err);
          }
          req.flash("success","you logout successfully");
          res.redirect("/listings");
        })
      }

   module.exports.rendersigninform = (req,res)=>{
    res.render("./users/signin.ejs");
  }
  
  module.exports.rendersignupform = (req,res)=>{
    res.render("./users/signup.ejs");
  }