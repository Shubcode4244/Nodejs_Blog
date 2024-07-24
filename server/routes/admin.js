const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;
const adminLayout = "../views/layouts/admin";
// Admin-Login Page GET
router.get("/admin", async (req, res) => {
  try {
    // const data = await Post.find();
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});


// Check login using middleware
const authMiddleware = (req,res,next)=>{
  const token = req.cookies.token;

  if(!token){
    return res.status(401).json({message:"Unauthorized"});
  }
  try{
    const decoded = jwt.verify(token,jwtSecret);
    req.userId = decoded.userId;
    next();
  }catch(error){
    res.status(401).json({message:"Unauthorizes"});
  }
}














// Admin-Login  / Post
// router.post("/admin", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     console.log(req.body);
//     res.redirect("/admin");
//     //   res.render('admin/index', { locals ,layout:adminLayout});
//   } catch (error) {
//     console.log(error);
//   }
// });

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    // for password check
    const ispasswordvalid = await bcrypt.compare(password, user.password);

    if (!ispasswordvalid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});





// Admin DashBoard
router.get('/dashboard',authMiddleware,async(req,res)=>{

  try {
    const locals = {
      title:"Dashboard",
      description:"Simple Blog created with Nodejs,Express & MongoDb."
    }

    const data = await Post.find();
    res.render('admin/dashboard',{
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error)
  }
  res.render('admin/dashboard');
})

// get,Admin Create New Post

router.get('/add-post',authMiddleware,async(req,res)=>{

  try {
    const locals = {
      title:"Add Post",
      description:"Simple Blog created with Nodejs,Express & MongoDb."
    }

    const data = await Post.find();
    res.render('admin/add-post',{
      locals,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error)
  }
  res.render('admin/add-post');
})

// this post,admin create new post
router.post('/add-post',authMiddleware,async(req,res)=>{

  try {
    const newPost = new Post({
      title:req.body.title,
      body:req.body.body
    });
    // console.log(req.body)
    await Post.create(newPost);
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
  res.render('admin/add-post');
})


// GET-Admin Create New Post


router.get('/edit-post/:id',authMiddleware,async(req,res)=>{

  try {
    const locals = {
      title:"Edit Post",
      description:"Free Nodejs User Management System",
    };

    const data = await Post.findOne({_id: req.params.id});

    res.render('admin/edit-post',{
      locals,
      data,
      layout:adminLayout
    })
    // res.redirect(`/edit-post/${req.param.id}`)
    // res.redirect(`/edit-post/${req.params.id}`)
  } catch (error) {
    console.log(error)
  }
  
})

// PUT-Create New Post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }

});

// Admin-Delete Post DELETE
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne({_id:req.params.id});
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error)
  }
});





// Admin-Register  / Post
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ messgae: "User Created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});


// Admin Logout 
router.get('/logout',(req,res)=>{
  res.clearCookie('token');
  res.redirect('/');
})
module.exports = router;
