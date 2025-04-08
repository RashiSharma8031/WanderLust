const mongoose = require("mongoose");
// const { listingSchema } = require("../schema");
const Review = require("./review.js");



const listingSchema = new mongoose.Schema({
  title:{
    type:String,
    default:"Live-Life heaven",
    require:true
  },
  description : String,
  image:{
    url:String,
    filename:String
    
  },
  price : {
    type:Number,
    default:1200,
  },
  location:String,
  country:String,
  reviews:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Review",

    }
  ],
  owner: {
    type:mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  geometry:{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  category:{
    type:String,
    enum:['trending','farm','iconic_city','mountains','swimming_pool','artic'],
  }


});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in: listing.reviews}})
  } 
  
})

const Listing = mongoose.model("Listing",listingSchema)
module.exports = Listing ; 