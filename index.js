const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dbConfig = require('./src/config');

const app = express();
const port = process.env.PORT || 5000;

// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Connecting to the database
mongoose.connect(dbConfig.database, {
    useNewUrlParser: true
}).then(() => {
    console.log('Successfully connected to the database');
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

require('./src/routes/note.route')(app);

app.listen(port, () => {
    console.log('Start app ' + port);
});