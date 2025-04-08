if(process.env.NODE_ENV != "production"){
    require("dotenv").config()
}

const express = require("express")
const mongoose = require("mongoose");
const app = express();
const Listing = require("./models/listing")
const path = require("path");
const methodoverride = require("method-override");
const ejsmate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const review = require("./models/review.js")
const session  = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js");
const {IsLoggedIn, isReviewAuthor} = require("./middleware.js");
const {saveRedirectUrl} = require("./middleware.js");
const {isOwner,validateListing,validatereview} = require("./middleware.js");
const listingcontroller = require("./controller/listings.js");
const reviewcontroller = require("./controller/reviews.js")
const usercontroller = require("./controller/users.js");
const multer = require("multer");
const {storage} = require("./cloudConfig.js");


const upload = multer({storage})



const db_url = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl : db_url,
    crypto:{
        secret:process.env.SECREAT,
    },
    touchAfter:24*3600,
})
store.on("error", (err) => {
    console.log("Error due to session store:", err);
});



const sessionOptions = {
  store:store,
  secret:process.env.SECREAT,
  resave:true,
  saveUninitialized : false,
  cookies:{
    expires:Date.now() + 7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    HttpOnly : true,
  },
}


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
   res.locals.error = req.flash("error");
   res.locals.currentUser = req.user ; 
   next();
})




async function main (){
    await mongoose.connect(db_url);
}
main().then(()=>{
    console.log("connect to db")
}).catch((err)=>{
    console.log("error while connect ",err);
})


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))

app.get("/",(req,res)=>{
res.send("i am root")
})





app.use(methodoverride("_method"));
app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"/public/")))





//signup
app.get("/signup",usercontroller.rendersignupform);

app.post("/signup",wrapAsync( usercontroller.signup));


//signin
app.get("/signin",usercontroller.rendersigninform);


saveRedirectUrl
app.post("/signin",  saveRedirectUrl, passport.authenticate("local",{failureRedirect:"/signin",failureFlash:true}),usercontroller.signin);


//logout
app.get("/logout",usercontroller.logout);









//index page 
app.get("/Listings",wrapAsync(listingcontroller.index ));

//detailing of listing
app.get("/listings/:id",wrapAsync( listingcontroller.showlistings))

//create new route
app.get("/listing/new", IsLoggedIn, listingcontroller.rendernewform)

//create route
  app.post("/listings",IsLoggedIn,upload.single('listing[image]'),validateListing, wrapAsync(listingcontroller.createlisting));




//edit route 
app.get("/listings/:id/edit",IsLoggedIn,isOwner, listingcontroller.renderEditform)

//update route
app.put("/listings/:id", IsLoggedIn,isOwner,upload.single('listing[image]'),validateListing, listingcontroller.updatelisting)

//delete route
app.delete("/listings/:id",IsLoggedIn, isOwner ,listingcontroller.destroylisting);

//reviews 
//post route
// validatereview,
app.post("/listings/:id/reviews",IsLoggedIn, validatereview,wrapAsync( reviewcontroller.createReview))


//delete review
app.delete("/listings/:id/reviews/:reviewId",IsLoggedIn,isReviewAuthor,wrapAsync(reviewcontroller.deletereview));






app.get("/listing/:category", async(req,res)=>{
    let {category } = req.params ; 
    console.log(category) ; 
   const allListings = await Listing.find({category:`${category}`});
   console.log(allListings);
   if(!allListings.length>0){
    req.flash("error","no listing for it now ");
    return  res.redirect("/Listings");
   }
   return  res.render("listings/trending.ejs",{allListings});
})

    
    
    
 

 app.get("/search", async(req,res)=>{
   
    let {search_location} = req.query;
    console.log(search_location);
    
    const allListings = await Listing.find({country:`${search_location}`});
    

    if(!(allListings && allListings.length >0)){
        req.flash("error","palce not exist")
       return  res.redirect("/listings");
    }
    
   return  res.render("listings/search.ejs",{allListings});
 })

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
})










app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"} = err;
   res.status(statusCode).render("error.ejs",{message})
    // res.send("something went wrong")
 })
app.listen(8080,()=>{
    console.log("listen on port ")
})