const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const DataModel = require("./models/dataModel");
const FormModel = require("./models/formModel");
const User = require("./models/userModel");
const sendToken = require("./utils/jwtToken");
const { isAuthentication } = require("./utils/auth");
const app = express();
const cors = require("cors");

const cookies = require("cookie-parser");

const port = process.env.PORT || 4001;

// dotenv configuration
require("dotenv").config();

// Database connection
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookies());
app.use(
  cors({
    origin: [ "http://localhost:5173", "https://authnastedformapi.onrender.com" ],
    credentials: true,
  })
);





// vercel deploy code

app.use(express.static(path.join(__dirname, "../Client/dist")));

app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "../Client/dist/index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});





// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.use(function (req, res, next) {
  // res.setHeader('Content-Type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Routes
app.get("/api", (req, res) => {
  res.json({ mgs: "Hello World!" });
});

// Register a new user
app.post("/api/register", async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    sendToken(user, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Authenticate a user
app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Checking if user has given password & email both.
    if (!email || !password) {
      res.status(400).json({ message: "please enter email password" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    // console.log(user);

    if (!user) {
      // Return an error response if the user is not found
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // const isPasswordMatched = await user.comparePassword(password);
    // console.log({
    //   mgs: "isPasswordMatched cli: ",
    //   isPasswordMatched, password
    // });

    // if(!isPasswordMatched){
    //       res.status(401).json({message: 'invalid email or password'})
    //  }else {
    //   sendToken(user, res)
    //  }

    sendToken(user, res);
  } catch (error) {
    next(error);
    res.status(400).json({ message: error.message });
  }
});

// LogOut USer...
app.LogOut("/api/logout", async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "logOut successFully",
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


app.put("/api/postdata", isAuthentication, async (req, res, next) => {
  // console.log("userId", req.user._id);
  try {
    const user = req.user._id;
    const { name, checkbox, sector } = req.body;

    if (!name || !sector || !checkbox) {
      return res.status(400).send("Please enter all fields");
    }

    // find all data if data length is equal to 1 then return show data already exist
    const isDataExist = await FormModel.find({ user });
    // console.log(isDataExist.length);

    if (isDataExist.length === 0) {
      const newOption = await FormModel.create({
        name,
        sector,
        checkbox,
        user,
      });
      console.log("user created: ", newOption);

      res.status(200).json({
        newOption,
        message: "Data inserted",
      });
    } else {
      // return res.status(400).send('Data already exist');
      const updateData = await FormModel.findOneAndUpdate(
        { user },
        { name, sector, checkbox },
        { new: true }
      );
      console.log("user update : ", updateData);

      res.status(200).json({
        updateData,
        message: "Data updated",
      });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// get selected sector option from database
app.get("/api/getdata", async (req, res) => {
  try {
    const data = await DataModel.find();
    // console.log(data);
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// update user own postdata from database
app.put("/api/updatedata/:id", isAuthentication, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sector, checkbox } = req.body;
    if (!name || !sector || !checkbox) {
      return res.status(400).send("Please enter all fields");
    } else {
      console.log(req.body);

      const updateData = await FormModel.findByIdAndUpdate(id, {
        name,
        sector,
        checkbox,
      });
      // console.log("updateData: ", updateData);

      await updateData.save();

      res.status(200).json({
        updateData,
        message: "Data updated",
      });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// geting formdata from database
app.get("/api/getformdata", async (req, res) => {
  try {
    const data = await FormModel.find();
    // console.log(data);
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// get all user data from usermodel
app.get("/api/getAllUserdata", async (req, res) => {
  try {
    const data = await FormModel.find();

    res.send({
      data,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
