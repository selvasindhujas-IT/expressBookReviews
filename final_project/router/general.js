const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
   const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Register new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 4)); 
 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;  // retrieve ISBN from the URL
    const book = books[isbn];      // find the book in books object

    if (book) {
        return res.send(JSON.stringify(book, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const authorName = req.params.author; // get author from URL
    const allBooks = Object.values(books); // get all book objects
    const booksByAuthor = allBooks.filter(book => book.author === authorName); // filter by author

    if (booksByAuthor.length > 0) {
        return res.send(JSON.stringify(booksByAuthor, null, 4));
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
   const titleName = req.params.title; // get title from URL
    const allBooks = Object.values(books); // get all book objects
    const booksByTitle = allBooks.filter(book => book.title === titleName); // filter by title

    if (booksByTitle.length > 0) {
        return res.send(JSON.stringify(booksByTitle, null, 4));
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
   const isbn = req.params.isbn; // get ISBN from URL
    const book = books[isbn];     // find the book by ISBN

    if (book) {
        return res.send(JSON.stringify(book.reviews, null, 4)); // send only reviews
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
  
});
public_users.get('/async/books', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});
public_users.get('/async/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
});
public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});
public_users.get('/async/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book by title", error: error.message });
    }
});
module.exports.general = public_users;
