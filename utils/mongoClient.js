// utils/mongoClient.js

const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/';

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', () => {
    console.log('Successfully connected to the database');
});

module.exports = mongoose;