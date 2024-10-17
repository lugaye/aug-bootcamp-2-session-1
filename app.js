///import necessary packages
const db = require('./config/db');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');

//initialize env management
dotenv.config();

//initialize app
const app = express();

//configure middleware

app.use(bodyParser.json()); //use json
app.use(bodyParser.urlencoded({ extended: true })); //capture form data

//configure session store
const sessionStore = new MySQLStore({}, db);

//configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 hour => 3600s
    }
}));

//routes
app.use('/telemedicine/api/users', require('./routes/userRoutes'));


const PORT = process.env.PORT || 5500;

//start server
app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
