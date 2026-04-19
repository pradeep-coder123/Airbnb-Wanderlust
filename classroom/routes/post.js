const express = require("express");
const router = express.Router();


//Index - posts
router.get("/", (req,res)=>{
     res.send("Get for posts");
});

//show 
router.get("/:id", (req,res)=>{
     res.send("Get for posts id");
});

//Post 
router.post("/", (req,res)=>{
     res.send("post for posts");
});

//DELETE
router.delete("/:id", (req,res)=>{
     res.send("DELETE for posts id");
});


module.exports = router;