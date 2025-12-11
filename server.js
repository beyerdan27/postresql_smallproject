import express from "express";
import pg from "pg";
import path from "path";
import {fileURLToPath} from "url";
const fileurl = fileURLToPath(import.meta.url);//somehow server.js crerates an api dir into which i fetch
const dir = path.dirname(fileurl);
const client = new pg.Client("postgresql://db4@localhost:5432/postgres");
await client.connect();
const exp = express();

exp.get("/api/opportunities", async function(_req, res){
  try{
    const result = await client.query("SELECT * FROM opportunities;");
    res.json(result.rows);
  }catch(err){
    console.error(err);
    res.status(500).json({error: "db error"}); //internal server error if there is that
  }});
exp.use(express.static(dir));

exp.listen(3000, function(){console.log("server working - http://localhost:3000");});
          

//for posts:

exp.use(express.json());
exp.post("/api/opportunities", async function (req, res) {
  const result = await client.query(
    "INSERT INTO opportunities (user_id, title, description) VALUES (2, $1, $2);",//2 - ASSUMING I'M STEVE JOBS
    [req.body.title, req.body.description]
  );
});
