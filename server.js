import express from "express";
import pg from "pg";
import path from "path";
import {fileURLToPath} from "url";
const fileurl = fileURLToPath(import.meta.url);//somehow server.js crerates an api dir into which i fetch
const dir = path.dirname(fileurl);
const client = new pg.Client("postgresql://interhub_user:Notpassword@localhost:5432/exp_learn");
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

//function to create student profile


exp.post("/create-user", async (req, res) => {
  try {
    const { email, password, fname, lname } = req.body;
    if (!email || !password || !fname || !lname) {
      return res.status(400).json({ error: "missing required fields" });
    }

    const result = await client.query(
      `INSERT INTO users (email, password, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, date_account_created`,
      [email, password, fname, lname]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user", err);
    res.status(500).json({ error: "db error" });
  }
});


// fetch user by id without password for now
exp.get("/api/users/:id", async (req, res) => {
  try {
    const result = await client.query(
      `SELECT id, email, first_name, last_name, date_account_created
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "not found because user does not exist" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user", err);
    res.status(500).json({ error: "database error because it hates you specifically." });
  }
});








//username: interhub_user
//password: Notpassword
//db: exp_learn
