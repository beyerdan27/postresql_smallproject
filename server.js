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

//UPDATE USER WITH NEW VALS
exp.post("/update-user", async (req, res) => {
  try {
    const {email, password, fname, lname} = req.body; //email is the unique user identifier
    if (!email) return res.status(400).json({ error: "email required to search" });
    if (password === undefined && fname === undefined && lname === undefined) {
      return res.status(400).json({ error: "no fields to update" });
    }
    const result = await client.query(
      `UPDATE users
         SET password = COALESCE($2, password),
             first_name = COALESCE($3, first_name),
             last_name  = COALESCE($4, last_name)
       WHERE email = $1
       RETURNING id, email, first_name, last_name, date_account_created`,
      [email, password, fname, lname]
    );
    if (!result.rows.length) return res.status(404).json({ error: "user not found. try another email." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user", err);
    res.status(500).json({ error: "db error" });
  }
});


exp.get("/api/opportunities/fields", async function (_req, res){
  try {
    const result = await client.query(`
     SELECT
        organizations.name AS "CompanyName",
        opportunities.type AS "OppType",
        COALESCE(
          json_agg(opportunity_tags.name) FILTER (WHERE opportunity_tags.name IS NOT NULL),
          '[]'
        ) AS "Fields"
        FROM opportunities
        LEFT JOIN organizations ON opportunities.org_id = organizations.id
        LEFT JOIN opportunity_tag_links ON opportunities.id = opportunity_tag_links.opportunity_id
        LEFT JOIN opportunity_tags ON opportunity_tag_links.tag_id = opportunity_tags.id
        GROUP BY opportunities.id, organizations.name
        ORDER BY opportunities.date_posted DESC;
    `);
   res.json(result.rows); // Returns JSON with CompanyName, OppType, Fields
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});







//username: interhub_user
//password: Notpassword
//db: exp_learn
