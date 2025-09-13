const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ 
 return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
       
        let accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
        req.session.accessToken = accessToken;
         req.session.username = username; 

        return res.status(200).json({ message: "Login successful", token: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
 
});

regd_users.put("/auth/review/:isbn", (req, res) => {
   const isbn = req.params.isbn;
    const review = req.query.review; 
    const username = req.session.username; 

    if (!username) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    book.reviews[username] = review;

    return res.status(200).json({
        message: `Review for book with ISBN ${isbn} by ${username} added/updated successfully`,
        reviews: book.reviews
    });
  
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;

    if (!username) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (book.reviews[username]) {
        delete book.reviews[username]; 
        return res.status(200).json({
            message: `Review for book with ISBN ${isbn} by ${username} deleted successfully`,
            reviews: book.reviews
        });
    } else {
        return res.status(404).json({
            message: `No review found for book with ISBN ${isbn} by ${username}`
        });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
