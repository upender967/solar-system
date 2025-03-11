const path = require('path');
const fs = require('fs')
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');
const serverless = require('serverless-http');

// Define the planet data to be inserted
const planetData = [
    { id: 0, name: 'Mercury', description: 'Closest planet to the Sun', image: 'mercury.jpg', velocity: '47.87 km/s', distance: '57.91 million km' },
    { id: 1, name: 'Venus', description: 'Second planet from the Sun', image: 'venus.jpg', velocity: '35.02 km/s', distance: '108.2 million km' },
    { id: 2, name: 'Earth', description: 'Our home planet', image: 'earth.jpg', velocity: '29.78 km/s', distance: '149.6 million km' },
    { id: 3, name: 'Mars', description: 'The Red Planet', image: 'mars.jpg', velocity: '24.077 km/s', distance: '227.9 million km' },
    { id: 4, name: 'Jupiter', description: 'The largest planet in the solar system', image: 'jupiter.jpg', velocity: '13.07 km/s', distance: '778.3 million km' },
    { id: 5, name: 'Saturn', description: 'Famous for its rings', image: 'saturn.jpg', velocity: '9.69 km/s', distance: '1.429 billion km' },
    { id: 6, name: 'Uranus', description: 'The ice giant', image: 'uranus.jpg', velocity: '6.81 km/s', distance: '2.871 billion km' },
    { id: 7, name: 'Neptune', description: 'The farthest planet from the Sun', image: 'neptune.jpg', velocity: '5.43 km/s', distance: '4.495 billion km' },
    { id: 8, name: 'Pluto', description: 'Formerly the ninth planet, now classified as a dwarf planet', image: 'pluto.jpg', velocity: '4.74 km/s', distance: '5.9 billion km' }
];

// Import necessary packages
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

// Set the strictQuery option to false (or true based on your preference)
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    user: process.env.MONGO_USERNAME,
    pass: process.env.MONGO_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function(err) {
    if (err) {
        console.log("Error connecting to MongoDB: " + err);
    } else {
        console.log("MongoDB Connection Successful");

        // Insert planet data if the collection is empty
        planetModel.countDocuments({}, function(err, count) {
            if (err) {
                console.log("Error checking document count: ", err);
            } else {
                if (count === 0) {
                    planetModel.insertMany(planetData, function(err, res) {
                        if (err) {
                            console.log("Error inserting data: ", err);
                        } else {
                            console.log("Planet data inserted successfully");
                        }
                    });
                }
            }
        });
    }
});

// Define planet schema and model
var Schema = mongoose.Schema;
var dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});
var planetModel = mongoose.model('planets', dataSchema);

// API Routes
app.post('/planet', function(req, res) {
    planetModel.findOne({
        id: req.body.id
    }, function(err, planetData) {
        if (err) {
            res.send("Error in Planet Data");
        } else {
            res.send(planetData);
        }
    });
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/api-docs', (req, res) => {
    fs.readFile('oas.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/os', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
});

app.get('/live', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
});

app.get('/ready', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
});

app.listen(3000, () => { 
    console.log("Server successfully running on port - " + 3000); 
});

module.exports = app;
//module.exports.handler = serverless(app);
