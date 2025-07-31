const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));

const { MongoClient } = require("mongodb");
let db;
const url =
  "mongodb+srv://admin:admin1@cluster1.psms0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");
    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (요청, 응답) => {
  응답.send("반갑다");
});

app.get("/news", (요청, 응답) => {
  db.collection("post").insertOne({ title: "어쩌구" });
});

app.get("/list", async (요청, 응답) => {
  let result = await db.collection("post").find().toArray();
  응답.send(result[0].title);
});
