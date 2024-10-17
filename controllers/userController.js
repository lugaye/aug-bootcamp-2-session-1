const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

//function for register user
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    //check if any errors present in validation
    if(!errors.isEmpty()){
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });
    }

    //fetching input parameters from the request body
    const { name, email, password } = req.body;

    try{
        //check if a user exists
        const [user] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        if(user.length > 0){
            return res.status(400).json({ message: 'The user already exists' });
        }

        //prepare our data - hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        //insert the record
        await db.execute('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, hashedPassword]);
        //response
        return res.status(201).json({ message: 'New user registered successfully. '});
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'An error occured during registration', error: error.message });
    }
}

//function for login
exports.loginUser = async (req, res) => {
    //fetch email & password from request body
    const { email, password } = req.body;

    try{
        //check if user exists
        //check if a user exists
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if(user.length === 0){
            return res.status(400).json({ message: 'The user does not exist' });
        }

        //check the passwords
        const isMatch = await bcrypt.compare(password, user[0].password);

        if(!isMatch){
            return res.status(400).json({ message: 'Invalid email/password combination.'});
        }
        //create a session 
        req.session.userId = user[0].id;
        req.session.name = user[0].name;
        req.session.email = user[0].email;
        
        return res.status(200).json({ message: 'Successfull login!'});
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occured during login', error: error.message });
    }
}

//function for logout 
exports.logoutUser = (req, res) => {
    req.session.destroy( (err) => {
        if(err){
            console.error(err);
            return res.status(500).json({ message: 'An error occured.', error: err.message });
        }
        return res.status(200).json({ message: 'Successfully logged out.' });
    });
}

//function to get user information for editing
exports.getUser = async (req, res) => {
    //check whether user is logged in / authorised
    if(!req.session.userId){
        return res.status(401).json({ message: "Unauthorized!" });
    }

    try{
        //fetch user
        const [user] = await db.execute('SELECT name, email FROM users WHERE id = ?', [req.session.userId]);
        if(user.length === 0){
            return res.status(400).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: "User details fetched for editing.", user: user[0]})
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occured while fetching user details.', error: error.message })
    }
}

//function for editing user
exports.editUser = async (req, res) => {
    const errors = validationResult(req);
    //check if any errors present in validation
    if(!errors.isEmpty()){
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });
    }
    //fetch user details from request body
    const { name, email, password } = req.body;

    //prepare data - hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if(!req.session.userId){
        return res.status(401).json({ message: 'Unauthorized. Please login to continue.' });
    }

    try{
        //update user details
        await db.execute('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, hashedPassword, req.session.userId])
        return res.status(200).json({ message: 'User details updated successfully. '});
    } catch(error){
        console.error(error);
        return res.status(500).json({ message: "An error occured during edit.", error: error.message })
    }
}
