
const path = require('path');
const fs = require('fs');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '/')));

// MongoDB Connection using Async/Await
async function connectDB() {
    try {
        await mongoose.connect('mongodb+srv://superuser:SuperPassword@supercluster.d83jj.mongodb.net/superData', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connection Successful");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

connectDB();

const Schema = mongoose.Schema;

const dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});

const planetModel = mongoose.model('planets', dataSchema);

// POST route to fetch planet data using async/await
app.post('/planet', async (req, res) => {
    try {
        const planetData = await planetModel.findOne({ id: req.body.id });
        if (!planetData) {
            res.status(404).send("Ooops, We only have 9 planets and a sun. Select a number from 0 - 9");
        } else {
            res.json(planetData);
        }
    } catch (err) {
        console.error("Error fetching planet data:", err);
        res.status(500).send("Error in Planet Data");
    }
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api-docs', async (req, res) => {
    try {
        const data = await fs.promises.readFile('oas.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Error reading file');
    }
});

app.get('/os', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
});

app.get('/live', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({ "status": "live" });
});

app.get('/ready', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({ "status": "ready" });
});

app.listen(3000, () => {
    console.log("Server successfully running on port - 3000");
});

module.exports = app;
// module.exports.handler = serverless(app);
