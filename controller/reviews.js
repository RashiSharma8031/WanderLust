const Listing = require("../models/listing");
const review = require("../models/review");

module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id)
    let newReview = new review(req.body.review);
   
     newReview.author = req.user._id ; 
     console.log(newReview);
   
    listing.reviews.push(newReview);
   
    await newReview.save();
    await listing.save();
    console.log("new review save");
   //  res.send("new review saved");
    res.redirect(`/listings/${listing._id}`);
   }

   module.exports.deletereview = async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await review.findByIdAndDelete(reviewId) 
    res.redirect(`/listings/${id}`)
  }