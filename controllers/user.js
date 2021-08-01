import bcrypt from "bcryptjs";

import db from "../db";

const getAllUsers = (req, res) => {
  db("users")
    .select("*")
    .then((users) => res.json(users))
    .catch((err) => res.status(401).json(err));
};

const register = (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password)
    return res.status(400).json({ message: "Missing field" });
  bcrypt.hash(password, 8, (err, hash) => {
    db("users")
      .insert([
        {
          email: email,
          name: name,
          password: hash,
          entries: 0,
        },
      ])
      .returning(["id", "email", "name", "entries"])
      .then((users) => res.json(users[0]))
      .catch((err) => {
        res.status(400).json(err);
      });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  db.select("id", "email", "password", "name", "entries")
    .from("users")
    .where("email", "=", email)
    .then((users) => {
      if (users.length === 0)
        return res.status(400).json({ message: "Email is not existed" });
      return bcrypt.compare(password, users[0].password, (err, isValid) => {
        if (isValid)
          res.json({
            id: users[0].id,
            email: users[0].email,
            name: users[0].name,
            entries: users[0].entries,
          });
        else res.status(400).json({ message: "Password is invalid" });
      });
    });
};

const increaseEntry = (req, res) => {
  const { id } = req.body;

  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0]);
    })
    .catch((err) =>
      res.status(400).json({ message: "Unable to increase entries" })
    );
};

export default { register, login, increaseEntry, getAllUsers };
