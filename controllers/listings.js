const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async(req,res)=>{
     const allListings = await Listing.find({});
     res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res)=>{
   res.render("listings/new.ejs");
 }

 module.exports.showListing = async(req,res)=>{
     let {id} = req.params;
     const listing = await Listing.findById(id).populate({path:"reviews", populate: {path: "author"},}).populate("owner");
     if(!listing){
       req.flash("error", "Listing you requested for does not exist");
       return res.redirect("/listings");
     }
 
     res.render("listings/show.ejs", {listing});
 }


//module.exports.createListing = async(req,res,next)=>{
   //let {title, description, image, price, country, location} = req.body;
    // let listing = req.body.listing;
    // new Listing(listing);
    // console.log(listing);

    // let result = listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error){
    //   throw new ExpressError(400, result.error);
    // }    

    // let response = await geocodingClient.forwardGeocode({
    //   query: req.body.listing.location,
    //   limit: 1,
    //   })
    //   .send();

   // console.log(response.body.features[0].geometry);
    
    // let url = req.file.path;
    // let filename = req.file.filename;
    // // console.log(url,"...",filename);
    // const newListing = new Listing(req.body.listing);
    // newListing.owner = req.user._id;
    // newListing.image = {url,filename}; 
    // newListing.geometry = response.body.features[0].geometry;
    // savedListing =  await newListing.save();
    // req.flash("success", "New Listing Created!");
    // res.redirect("/listings");
    
    
    // if(!req.body.listing){
    //   throw new ExpressError(400, "send valid data for listing");
    // }
    // if(!newListing.title){
    //   throw new ExpressError(400, "Title is missing!");
    // }
    // if(!newListing.description){
    //   throw new ExpressError(400, "Description is missing!");
    // }
    // if(!newListing.location){
    //   throw new ExpressError(400, "Location is missing!");
    // }    
  
//}


// const { cloudinary } = require("../cloudConfig.js"); // your cloudinary config


// module.exports.createListing = async (req, res, next) => {
    
//     let response = await geocodingClient.forwardGeocode({
//       query: req.body.listing.location,
//       limit: 1,
//     }).send();
   
//     // console.log(response.body.features[0].geometry);
//     // res.send("done!");

//     let url = req.file.path;
//     let filename = req.file.filename;
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url, filename};
//     newListing.geometry = response.body.features[0].geometry;

//     let savedListing = await newListing.save();
//     colsole.log(savedListing);
//     req.flash("success","New Listing Created!");
//     res.redirect("/listings");
// };

const cloudinary = require("../cloudConfig");

module.exports.createListing = async (req, res, next) => {
    try {
        //  Step 1: Get coordinates from location
        const geoResponse = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        //  Step 2: Default image values
        if (!req.file) {
            req.flash("error", "Please upload an image");
            return res.redirect("/listings/new");
        }

        //  Step 3: Upload image to Cloudinary (if image exists)
            // Upload image to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "wanderlust_DEV" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            // Save image data
            let imageUrl = uploadResult.secure_url;
            let imageFilename = uploadResult.public_id;

        //  Step 4: Create new listing
        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;
        newListing.image = {
            url: imageUrl,
            filename: imageFilename,
        };

        newListing.geometry = geoResponse.body.features[0].geometry;

        //  Step 5: Save to database
        const savedListing = await newListing.save();
        console.log(savedListing);

        // Step 6: Success message + redirect
        req.flash("success", "New Listing Created!");
        return res.redirect("/listings");

    } catch (err) {
        next(err); // handle error properly
    }
};


module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id); 
    if(!listing){
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");     
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){

    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename}; 
    await listing.save();      
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
 }

module.exports.destroyListing = async(req,res)=>{
   let {id} = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success", "Listing Deleted!");
   res.redirect("/listings");
}