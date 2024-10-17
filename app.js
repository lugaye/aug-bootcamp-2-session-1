///import necessary packages
const db = require('./config/db'); // for database connection
const express = require('express'); // for the web server
const bodyParser = require('body-parser'); // for capturing form data
const session = require('express-session'); // session management
const MySQLStore = require('express-mysql-session')(session); //storage for session management
const dotenv = require('dotenv'); //managing environment variables
const path = require('path')

//initialize env management
dotenv.config();

//initialize app
const app = express();

//configure middleware
app.use(express.static(path.join(__dirname, 'frontend')));
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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5500;

//start server
app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
