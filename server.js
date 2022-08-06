const express=require('express'),
      app=express(),
      fs = require("fs"),
      path = require("path"),
      fileupload = require("express-fileupload"),
      image_moderation = require('image-moderation'),
      cors = require("cors"),
      port=process.env.PORT || 7070;
      app.use(express.json());
      app.use(cors());
      app.use(fileupload());
      app.use(express.static("public"));
      app.use(express.urlencoded({ extend: true }));

      app.get('/',(req, res) => {
        res.status(200).json({
            message:'API Started',
            status:true,
        })
      })
     app.post('/upload/question',(req, res) => {
        if (!req.files) {
            return res
              .status(400)
              .json({ success: false, message: "Please select a file" });
          }
          const file = req.files.file;
          // Make sure the image is a photo
          if (!file.mimetype.startsWith("image")) {
            return res
              .status(400)
              .json({ success: false, message: "Please upload an image file" });
          }
          // Checking file size unit is bytes,MAX_FILE_UPLOAD = 1 Megabyte which is equal to 10,00,000 bytes
          if (file.size > 1000000) {
            return res
              .status(400)
              .json({
                success: false,
                message: "Please upload an image less than 1 Megabyte",
              });
          }
          file.name = `photo${path.parse(file.name).ext}`;
      // 4 required status code
      file.mv(`./public/uploads/${file.name}`, async (err) => {
      if (err) {
       return res.json({
         success: false,
         message: "Problem with file upload",
         err,
         });
        }
       });
       fs.unlink(`./public/uploads/${file.name}`, async () => {
        console.log(`http://localhost:7070/uploads/${file.name}`);
        image_moderation.evaluate(`http://localhost:7070/uploads/${file.name}`,"1cf4715ef689becb784c7f2743c33cfe")
            .then((response) => {
	          let json = JSON.parse(response);
             if(response){
                res.status(510).json({
                    success: true,
                    response,
                 });
            }else{
                res.status(200).json({
                    success: true,
                    message:'valid image'
                 });
            }
             });
       });
    })


      app.listen(port,()=>console.log(`Server is servering at ${port}`));