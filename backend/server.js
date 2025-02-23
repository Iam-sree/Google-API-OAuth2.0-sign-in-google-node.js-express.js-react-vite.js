const express = require("express");
const mysql = require("mysql2");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");

const app = express();

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "google_auth",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected");
});

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "your_id",
      clientSecret: "you_id",
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;
      const email = emails[0].value;
      const profilePicture = photos[0].value;

      // Check if user exists in the database
      const sql = `SELECT * FROM users WHERE google_id = ?`;
      db.query(sql, [id], (err, result) => {
        if (err) return done(err);

        if (result.length > 0) {
          return done(null, result[0]); // User exists
        } else {
          // Insert new user into the database
          const sql = `INSERT INTO users (google_id, name, email, profile_picture) VALUES (?, ?, ?, ?)`;
          db.query(sql, [id, displayName, email, profilePicture], (err, result) => {
            if (err) return done(err);

            const newUser = {
              id: result.insertId,
              google_id: id,
              name: displayName,
              email: email,
              profile_picture: profilePicture,
            };
            return done(null, newUser);
          });
        }
      });
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return done(err);
    done(null, result[0]);
  });
});

// Google OAuth routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    res.redirect("http://localhost:5173/dashboard");
  }
);

// Get user details
app.get("/user", (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.redirect("http://localhost:5173");
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});