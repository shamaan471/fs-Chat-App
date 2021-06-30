const express = require("express");
const cors = require("cors");

const UserRoutes = require('./routes/user');
const ChatRoutes = require('./routes/chatroom');
const errorHandlers = require("./handlers/errorHandlers");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Setup Cross Origin
const corsOptions ={
  origin:'http://localhost:3000', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions)); //required for local host authorization


// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, access-control-allow-origin, profilerefid(whatever header you need)");
//   next();
// });

//Bring in the routes
app.use("/user", UserRoutes);
app.use("/chatroom", ChatRoutes);

//Setup Error Handlers
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if (process.env.ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}

module.exports = app;