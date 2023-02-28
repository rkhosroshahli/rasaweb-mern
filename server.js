const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));
// console.log(path.join('/frontend/build'))
// app.use(express.static(path.join('/frontend/build')));

//  CORS Headers => Required for cross-origin/ cross-server communication
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});


app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

__dirname=path.resolve();
console.log(__dirname);
if (process.env.NODE_ENV === "production"){
  app.use(express.static(path.join("frontend/build")));
  app.get('*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  });
} else {
  app.get("/", (req, res)=>{
    res.send("API is running...");
  })
}

// app.use((req, res, next)=>{
//   res.sendFile(path.resolve(__dirname, '/frontend/build', 'index.html'));
// });

// app.use((req, res, next) => {
//   const error = new HttpError('Could not find this route.', 404);
//   throw error;
// });

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clusternetworkassignmen.efumv5c.mongodb.net/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true 
    }
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });


// Accessing the path module
// const path = require("path");

// // Step 1:
// app.use(express.static(path.resolve(__dirname, "./frontend")));
// // Step 2:
// app.get("*", function (request, response) {
//   response.sendFile(path.resolve(__dirname, "./frontend/build", "index.html"));
// });
