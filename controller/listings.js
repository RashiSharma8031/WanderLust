const { query } = require("express");
const Listing = require("../models/listing");
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const map_Token = process.env.Map_Token;
const geocodingClient = mbxgeocoding({ accessToken: map_Token });

module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs",{allListings});
}

module.exports.rendernewform = (req,res)=>{
  
    res.render("listings/new.ejs")
}


module.exports.showlistings = async (req,res)=>{
    const  {id }= req.params
    const listing =await Listing.findById(id).populate({
     path: "reviews",
     populate:{
       path:"author",
     },
   
   }).populate("owner");
    if(!listing){
     req.flash("error","listing you try to access not exist");
     res.redirect("/listings");
    }
   //  console.log(listing);
    res.render("listings/show.ejs",{listing})
   
   }

   module.exports.createlisting = async (req,res,next)=>{
   let response= await geocodingClient.forwardGeocode({
      query:req.body.listing.location,
      limit:1,
    }).send();
    
      
    let url = req.file.path
    let filename=req.file.filename

    const newlisting = new Listing(req.body.listing)
    
    newlisting.owner = req.user._id;
    newlisting.image = {url,filename}
    newlisting.geometry = response.body.features[0].geometry;
    let savedlisting = await newlisting.save();
    console.log(savedlisting);
    req.flash("success"," create new listing");
    res.redirect("/Listings"); 
}

module.exports.renderEditform = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if( !listing){
      req.flash("error","listing you access not exist");
      res.redirect("/listings");
    }
     let originalImageUrl = listing.image.url;
     originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs",{listing,originalImageUrl})
}

module.exports.updatelisting = async (req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing")
       }
  let {id} = req.params
   let listing = await Listing.findByIdAndUpdate(id,{... req.body.listing})

   if( typeof req.file !== "undefined"){
   let url = req.file.path
   let filename=req.file.filename
   listing.image = {url,filename};
   listing.save()
   }
   req.flash("success","listing update")
   res.redirect(`/Listings/${id}`)
}

module.exports.destroylisting = async (req,res)=>{
    let {id} = req.params ;
  let deletelisting =  await Listing.findByIdAndDelete(id);
 console.log(deletelisting);
 req.flash("success","delete listing")
 res.redirect("/Listings")

}