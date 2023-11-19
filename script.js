const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [{
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: String
  }]
});

const userModel = mongoose.model('users', userSchema);

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

// create a new user
app.post('/api/users', async (req, res) => {
  const username = req.body.username;

  // check if username is valid
  if (username.length < 3 || !username.match(/^[a-zA-Z][a-zA-Z0-9-_]+$/)) {
    res.json({ error: 'Invalid username, username must be at least 3 characters long and contains only alphanumeric characters, underscores and dashes' });
    return;
  }

  // check if username exists
  const userExists = await userModel.findOne({ username });

  if (userExists) {
    res.json({ error: 'Username already exists' });
    return;
  }

  const newUser = new userModel({ username });

  const savedUser = await newUser.save();

  res.json({
    username: savedUser.username,
    _id: savedUser._id
  });
});

// add exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date;
  const user = await userModel.findById(id);

  // check if id exists
  if (!user) {
    res.json({ error: 'User does not exist' });
    return;
  }

  // create a new date if date is not provided
  const dateString = date && !isNaN(new Date(date).getTime())
    ? new Date(date).toDateString()
    : new Date().toDateString();

  user.log.push({
    description,
    duration,
    date: dateString
  });

  await user.save();

  res.json({
    username: user.username,
    description,
    duration,
    date: dateString,
    _id: id
  })
})

// retrieve exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;
  const user = await userModel.findById(id);

  // check if id exists
  if (!user) {
    res.json({ error: 'User does not exist' });
    return;
  }

  let log = user.log;

  if (from) {
    log = log.filter(e => new Date(e.date).getTime() >= new Date(from).getTime());
  }

  if (to) {
    log = log.filter(e => new Date(e.date).getTime() <= new Date(to).getTime());
  }

  log = log.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (limit) {
    log = log.slice(0, limit);
  }

  log = log.map(e => ({
    description: e.description,
    duration: parseInt(e.duration),
    date: e.date
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: id,
    log
  })
})

// get all users
app.get('/api/users', async (req, res) => {
  const users = await userModel.find({}, '_id username');

  if (users.length) {
    res.json(users);
  } else {
    res.json({ error: 'No users found' });
  }
})

app.listen(3000, () => {
  console.log('Your app is listening on port 3000');
});
