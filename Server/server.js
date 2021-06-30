require("dotenv").config();
const jwt = require("jwt-then");
const { Server } = require("socket.io");

require("./models/User");
require("./models/Chatroom");
require("./models/Message");

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on("error", (err) => {
  console.log("Could not Connect to MongoDB!: " + err.message);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB!");
});


const app = require("./app");

const server = app.listen(8000, () => {
  console.log("Server listening on port 8000");
});

//const io = require("socket.io")(server);
const io = new Server(server);


const Message = mongoose.model("Message");
const User = mongoose.model("User");

//use middleware to confirm that client provides correct jwt 
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const payload = await jwt.verify(token, process.env.SECRET);
    socket.userId = payload.id;
    next();
  }catch (err) {
    throw "Socket io authorization problem:" + err;
  }
});

io.on("connection", (socket) => {
  console.log("Established a connection with: " + socket.userId);


  //the first args of the on func are 'emitted' by the front end

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId);
  });

  socket.on("joinRoom", ({ chatroomId }) => {
    socket.join(chatroomId);
    console.log("A user joined chatroom: " + chatroomId);
  });

  socket.on("leaveRoom", ({ chatroomId }) => {
    socket.leave(chatroomId);
    console.log("A user left chatroom: " + chatroomId);
  });

  socket.on("chatroomMessage", async ({ chatroomId, message }) => {
    if (message.trim().length > 0) {
      const user = await User.findOne({ _id: socket.userId });
      const newMessage = new Message({
        chatroom: chatroomId,
        user: socket.userId,
        name: user.name,
        message,
      });
      io.to(chatroomId).emit("newMessage", {
        message,
        name: user.name,
        userId: socket.userId,
      });
      await newMessage.save();
    }
  });
});