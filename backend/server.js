const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const multer = require("multer");
const cors = require("cors");
const cookieParser = require("cookie-parser");
let upload = multer({ dest: __dirname + "/uploads/" });

let app = express();

app.use(cors());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

let dbo = undefined;
const url = "YOUR_URL_GOES_HERE";

MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
  dbo = db.db("media-board");
});

app.get("/all-posts", (req, res) => {
  console.log("request to /all-posts");
  dbo
    .collection("posts")
    .find({})
    .toArray((err, ps) => {
      if (err) {
        console.log("error", err);
        res.send("fail");
        return;
      }
      console.log("posts", ps);
      res.send(JSON.stringify(ps));
    });
});
app.post("/login", upload.none(), (req, res) => {
  console.log("login", req.body);
  let name = req.body.username;
  let pwd = req.body.password;
  dbo.collection("users").findOne({ username: name }, (err, user) => {
    if (err) {
      console.log("/login error", err);
      res.send(JSON.stringify({ success: false }));
      return;
    }
    if (user === null) {
      res.send(JSON.stringify({ success: false }));
    }
    if (user.password === pwd) {
      res.send(JSON.stringify({ success: true }));
      return;
    }
    res.send(JSON.stringify({ success: false }));
  });
});
app.post("/new-post", upload.single("img"), (req, res) => {
  console.log("request to /new-post. body: ", req.body);
  let description = req.body.description;
  let file = req.file;
  let frontendPath = "http://localhost:4000/uploads/" + file.filename;
  dbo
    .collection("posts")
    .insertOne({ description: description, frontendPath: frontendPath });
  res.send(JSON.stringify({ success: true }));
});
app.post("/update", upload.none(), (req, res) => {
  console.log("request to /update");
  let id = req.body.id.toString();
  let desc = req.body.description;
  console.log("sent from client", desc, id);
  dbo
    .collection("posts")
    .updateOne({ _id: ObjectID(id) }, { $set: { description: desc } });
  res.send("success");
});
app.listen(4000, () => {
  console.log("Server running on port 4000");
});
