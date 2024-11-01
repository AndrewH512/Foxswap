-- Create and use the foxswap database
CREATE DATABASE IF NOT EXISTS foxswap_db;
USE foxswap_db;

-- Drop all tables if they exist
DROP TABLE IF EXISTS Transaction;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Favorites;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Reports;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS Books;
DROP TABLE IF EXISTS Users;

-- Create the users table
CREATE TABLE Users (
    Username VARCHAR(50) PRIMARY KEY NOT NULL,       -- Username as the primary key
    First_Name VARCHAR(50) NOT NULL,                 -- First name 
    Last_Name VARCHAR(50) NOT NULL,                  -- Last name 
    Phone_Number VARCHAR(15) NOT NULL,               -- Phone number
    Email VARCHAR(100) NOT NULL UNIQUE,              -- Email 
    Password VARCHAR(255) NOT NULL,                  -- Password (hashed)
    Admin BOOLEAN DEFAULT 0 NOT NULL,                -- Admin flag (default: false)
    Banned BOOLEAN DEFAULT 0 NOT NULL,               -- Banned flag (default: false)
    Profile_Picture VARCHAR(255),                    -- profile picture (optional)
    Bio TEXT                                         -- User bio (optional)
);

-- Create the books table
CREATE TABLE Books (
    Book_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,  -- Book ID as the primary key
    Author VARCHAR(100) NOT NULL,                     -- Author of the book
    ISBN VARCHAR(20) NOT NULL UNIQUE,                 -- ISBN of the book (unique constraint)
    Title VARCHAR(255) NOT NULL,                      -- Title of the book
    Book_Subject VARCHAR(100) NOT NULL,               -- Subject or category of the book
    Cover_Picture VARCHAR(100)                        -- Path to the cover picture 
);

-- Create the posts table
CREATE TABLE Posts (
    Post_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL, -- Post ID as the primary key, auto-incremented
    Seller VARCHAR(50) NOT NULL,                     -- Foreign key referencing username from users table
    Book_ID INT NOT NULL,                            -- Foreign key referencing Book_ID from a books table
    Status VARCHAR(50) NOT NULL,                     -- Status of the post (available, sold, pending)
    Price VARCHAR(20) NOT NULL,                      -- Price of the book
    Class_Name VARCHAR(100) NOT NULL,                -- Class name for which the book 
    Book_Condition VARCHAR(50) NOT NULL,             -- Condition of the book (bad, used, acceptable)
    Due_Date DATE NULL,                              -- Due date for rentals or listings if applicable. Can be NULL! (if seller is not renting)
    Transaction_Type VARCHAR(50) NOT NULL,           -- Transaction type (Sale, Rental)
    Display_Post BOOLEAN DEFAULT 1,                  -- Flag for whether the post is visible (default: true)

    -- Foreign key constraints
    FOREIGN KEY (Seller) REFERENCES Users(Username) ON DELETE CASCADE,
    FOREIGN KEY (Book_ID) REFERENCES Books(Book_ID) ON DELETE CASCADE
);

-- Create the reports table
CREATE TABLE Reports (
    Report_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,     -- Report ID as the primary key, auto-incremented
    Reported_User VARCHAR(50) NOT NULL,                    -- Foreign key referencing the user being reported
    Reporting_User VARCHAR(50) NOT NULL,                   -- Foreign key referencing the user who is making the report
    Description TEXT NOT NULL,                             -- Description of the report
    Title VARCHAR(255) NOT NULL,                           -- Title of the report
    
    -- Foreign key constraints
    FOREIGN KEY (Reported_User) REFERENCES Users(Username) ON DELETE CASCADE,
    FOREIGN KEY (Reporting_User) REFERENCES Users(Username) ON DELETE CASCADE
);

-- Create the Reviews table
CREATE TABLE Reviews (
    Reviews_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,     -- Reviews ID as the primary key, auto-incremented
    Reviewed VARCHAR(50) NOT NULL,                          -- Foreign key referencing the user being reviewed
    Reviewer VARCHAR(50) NOT NULL,                          -- Foreign key referencing the user leaving the review
    Stars INT NOT NULL,                                     -- Star rating (from 1 to 5) 
    Review_Description TEXT NOT NULL,                       -- Review description

    -- Foreign key constraints
    FOREIGN KEY (Reviewed) REFERENCES Users(Username) ON DELETE CASCADE,
    FOREIGN KEY (Reviewer) REFERENCES Users(Username) ON DELETE CASCADE
);

-- Create the Favorites table
CREATE TABLE Favorites (
    Favorite_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,     -- Favorite ID as the primary key, auto-incremented
    Username VARCHAR(50) NOT NULL,                           -- Foreign key referencing the username in the users table
    Post_ID INT NOT NULL,                                    -- Foreign key referencing the Post_ID in the posts table

    -- Foreign key constraints
    FOREIGN KEY (Username) REFERENCES Users(Username) ON DELETE CASCADE,
    FOREIGN KEY (Post_ID) REFERENCES Posts(Post_ID) ON DELETE CASCADE
);

CREATE TABLE Messages (
    Message_ID INT AUTO_INCREMENT PRIMARY KEY,               -- Message ID as the primary key, auto-incremented
    Sender VARCHAR(255) NOT NULL,                            -- Foreign key referencing the sender's username
    Recipient VARCHAR(255) NOT NULL,                         -- Foreign key referencing the receiver's username
    Message TEXT NOT NULL,                                   -- Message body/content
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,            -- Timestamp for when the message was created
    isDelivered BOOLEAN DEFAULT FALSE,                       -- Variable for whether the message is delivered
    isRead BOOLEAN DEFAULT FALSE,							 -- Variable for whether the message is read
    isDeletedBySender BOOLEAN DEFAULT FALSE,				 -- Variable for whether sender deletes message
    isDeletedByRecipient BOOLEAN DEFAULT FALSE,				 -- Variable for whether recipient deletes message

    -- Foreign key constraints
    FOREIGN KEY (Sender) REFERENCES Users(Username) ON DELETE CASCADE,
    FOREIGN KEY (Recipient) REFERENCES Users(Username) ON DELETE CASCADE

);

-- Create the Transaction table
CREATE TABLE Transaction (
    Transaction_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,   -- Transaction ID as the primary key, auto-incremented
    Post_ID INT NOT NULL,                                     -- Foreign key referencing the post ID in the posts table
    Buyer VARCHAR(50) NOT NULL,                               -- Foreign key referencing the buyer's username
    Seller VARCHAR(50) NOT NULL,                              -- Foreign key referencing the seller's username
    Price VARCHAR(20) NOT NULL,                               -- Price of the post
    Date DATE NOT NULL,                                       -- Date of the transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,  -- Timestamp for when the transaction was created

    -- Foreign key constraints
    FOREIGN KEY (Post_ID) REFERENCES Posts(Post_ID) ON DELETE CASCADE,
    FOREIGN KEY (Buyer) REFERENCES Users(Username) ON DELETE CASCADE,
    FOREIGN KEY (Seller) REFERENCES Users(Username) ON DELETE CASCADE
);

-- Inserting Data Into the tables
-- Insert additional records into the users table (example data)
INSERT INTO Users (Username, First_Name, Last_Name, Phone_Number, Email, Password, Admin, Banned, Profile_Picture, Bio)
VALUES 
('andrew512', 'Andrew', 'Hennessy', '845-561-8782', 'andrewhenn512@gmail.com', SHA2('123random', 256), 1, 0, '/uploads/andrew.png', 'Bio goes here'),
('steven', 'Steve', 'Stever', '987-654-3210', 'steve@gmail.com', SHA2('mynamesteve', 256), 0, 0, '/uploads/steve.png', 'Steve is a nerd'),
('admin', 'Admin', 'Admin', '123-456-7890', 'admin@gmail.com', SHA2('marist123', 256), 1, 0, '/uploads/admin.jpeg', 'Admin');
;

-- Insert records into the books table (example data)
INSERT INTO Books (Author, ISBN, Title, Book_Subject, Cover_Picture)
VALUES 
('John Smith', '1234567890123', 'Mathematics', 'Math', '/uploads/testbook1.jpg'),
('Steve Steven', '9876543210987', 'The Nature of Science', 'Science', '/uploads/testbook2.jpg'),
('Mary Brown', '98321421411241', 'Macmillian English', 'English', '/uploads/Mac_English.jpg'),
('Alice Green', '1234567890124', 'Introduction to Programming', 'Computer Science', '/uploads/book4.jpg'),
('Bob White', '9876543210988', 'Physics Fundamentals', 'Physics', '/uploads/book5.jpg'),
('Jane Doe', '1234567890125', 'Chemistry 101', 'Chemistry', '/uploads/book6.jpg'),
('Tom Brown', '1234567890126', 'Biology Basics', 'Biology', '/uploads/book7.jpg'),
('Mike Johnson', '1234567890127', 'History of Art', 'Art', '/uploads/book8.jpg'),
('Emily Davis', '1234567890128', 'Statistics for Beginners', 'Statistics', '/uploads/book9.jpg'),
('Laura Smith', '1234567890129', 'Ethics in Technology', 'Philosophy', '/uploads/book10.jpg');

-- Insert records into the posts table (example data)
INSERT INTO Posts (Seller, Book_ID, Status, Price, Class_Name, Book_Condition, Due_Date, Transaction_Type, Display_Post)
VALUES 
('andrew512', 1, 'Available', '20.00', 'CS101', 'Good', NULL, 'Sale', 1),
('steven', 2, 'Sold', '30.00', 'BIO202', 'New', NULL, 'Sale', 0),
('steven', 3, 'Pending', '15.00', 'ENG303', 'Used', '2024-11-30', 'Rental', 1),
('steven', 1, 'Available', '25.00', 'MATH101', 'Acceptable', NULL, 'Rental', 1),
('andrew512', 2, 'Sold', '35.00', 'PHY102', 'New', NULL, 'Sale', 0),
('andrew512', 4, 'Available', '15.00', 'CS201', 'Good', '2025-11-30', 'Rental', 1),
('steven', 5, 'Pending', '10.00', 'ART101', 'Acceptable', '2024-11-30', 'Rental', 1);


SELECT 
    Books.Author, 
    Books.ISBN, 
    Books.Title, 
    Books.Book_Subject, 
    Books.Cover_Picture,
    Posts.Seller, 
    Posts.Status, 
    Posts.Price, 
    Posts.Class_Name, 
    Posts.Book_Condition, 
    Posts.Due_Date, 
    Posts.Transaction_Type
FROM 
    Books
JOIN 
    Posts ON Books.Book_ID = Posts.Book_ID;
    
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'marist123';