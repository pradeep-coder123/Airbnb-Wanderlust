const Listing = require("../models/listing");
const axios = require("axios");


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


module.exports.createListing = async (req, res, next) => {
  try {
    // 🔹 Use Nominatim (OpenStreetMap) for geocoding
    const locationQuery = req.body.listing.location;
    const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: locationQuery,
        format: "json",
        limit: 1,
      },
    });

    if (!geoRes.data || geoRes.data.length === 0) {
      req.flash("error", "Could not find coordinates for that location.");
      return res.redirect("/listings/new");
    }

    // Extract lat/lon
    const { lat, lon } = geoRes.data[0];

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // ✅ Replace Mapbox geometry with OSM geometry
    newListing.geometry = {
      type: "Point",
      coordinates: [parseFloat(lon), parseFloat(lat)], // GeoJSON format
    };

    savedListing = await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while creating the listing.");
    res.redirect("/listings/new");
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