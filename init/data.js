const mongoose = require("mongoose");
const initData = require("./index.js");
const Listing = require("../models/listing");


const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
async function main(){
    await mongoose.connect(mongo_url)
}
main().then(()=>{
    console.log("connect to db")
}).catch((err)=>{
    console.log("error while connect ",err);
})

// const initdb = async ()=>{
//    await Listing.deleteOne({title:"new villa'"})
//    console.log("data was delte")
// }
// initdb()
// initData.data = initData.data.map((obj)=>({obj,owner:""}))
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"6687f4005f23b7af8d60345f"}))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
  };
  
  initDB();