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
    Salt VARCHAR(255) NOT NULL,                       -- Salt for password hashing
    Admin BOOLEAN DEFAULT 0 NOT NULL,                -- Admin flag (default: false)
    Banned BOOLEAN DEFAULT 0 NOT NULL,               -- Banned flag (default: false)
    Profile_Picture VARCHAR(255),                    -- Profile picture (optional)
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
-- Inserting Users
INSERT INTO Users (Username, First_Name, Last_Name, Phone_Number, Email, Password, Salt, Admin, Banned, Profile_Picture, Bio)
VALUES 
    ('andrew512', 'Andrew', 'Hennessy', '845-561-8782', 'andrewhenn512@gmail.com', SHA2(CONCAT('123random', 'salt_for_andrew512'), 256), 'salt_for_andrew512', 1, 0, '/uploads/andrew.png', 'Bio goes here'),
    ('steven', 'Steve', 'Stever', '987-654-3210', 'steve@gmail.com', SHA2(CONCAT('mynamesteve', 'salt_for_steven'), 256), 'salt_for_steven', 0, 0, '/uploads/steve.png', 'Steve is a nerd'),
    ('admin', 'Admin', 'Admin', '123-456-7890', 'admin@gmail.com', SHA2(CONCAT('marist123', 'salt_for_admin'), 256), 'salt_for_admin', 1, 0, '/uploads/admin.jpeg', 'Admin'),
    ('mitch', 'Mitch', 'Levy', '845-699-9999', 'Mitchell.Levy1@outlook.com', SHA2(CONCAT('marist123', 'salt_for_mitch'), 256), 'salt_for_mitch', 1, 0, '/uploads/admin.jpeg', 'Stupid Admin');

-- Inserting Books with Book_IDs
INSERT INTO Books (Book_ID, Author, ISBN, Title, Book_Subject, Cover_Picture)
VALUES 
    (1, 'Y. Daniel Liang', '0133761312', 'Introduction to Java Programming', 'CMPT', '/uploads/book66.jpeg'),
    (2, 'Wendell Odum', '1587147149', 'CCNA 200-301 Official Cert Guide Library', 'CMPT', '/uploads/book67.jpeg'),
    (3, 'Jane Valade', '0470527587', 'PHP & MySQL For Dummies, 4th Edition', 'CMPT', '/uploads/book68.jpeg'),
    (4, 'Jon Kleinberg', '9780321295354', 'Algorithm Design', 'CMPT', '/uploads/book69.jpeg'),
    (5, 'Jonathan Clayden', '9780199270293', 'Organic Chemistry 2nd Edition', 'BIO', '/uploads/book70.jpeg'),
    (6, 'Michael Crichton', '9781405072960', 'Jurassic Park', 'ENG', '/uploads/book71.jpeg'),
    (7, 'Michael Crichton', '0061990558', 'Sphere', 'ENG', '/uploads/book72.jpeg'),
    (8, 'Michael Crichton', '0345468260', 'Timeline', 'ENG', '/uploads/book73.jpeg'),
    (9, 'Michael Crichton', '0804171297', 'The Terminal Man', 'ENG', '/uploads/book74.jpeg'),
    (10, 'Steve Alcorn', '9798652700775', 'Theme Park Design', 'ENGR', '/uploads/book75.jpeg'),
    (11, 'Ron Larson and Bruce Edwards', '9781337275347', 'Calculus 11th Edition', 'MAT', '/uploads/book76.jpeg'),
    (12, 'Chris McMullen', '1941691390', 'Differential Equations Essential Skills Practice Workbook with Answers', 'MAT', '/uploads/book77.jpeg'),
    (13, 'Susanna Epp', '1337694193', 'Discrete Mathematics with Applications 5th Edition', 'MAT', '/uploads/book78.jpeg'),
    (14, 'David J. Griffiths and Darrell F. Shroeter', '1107189632', 'Introduction to Quantum Mechanics 3rd Edition', 'PHY', '/uploads/book79.jpeg'),
    (15, 'Hugh D. Young and Roger A. Freeman', '0133978044', 'University Physics with Modern Physics, Volume 1 (Chs. 1-20) (14th Edition)', 'PHY', '/uploads/book80.jpeg'),
    (16, 'Charles N. Fischer and Richard Joseph LeBlanc', '9780136067054', 'Crafting a Compiler', 'CMPT', '/uploads/book81.jpeg');

-- Inserting Posts with correct Book_ID references
INSERT INTO Posts (Seller, Book_ID, Status, Price, Class_Name, Book_Condition, Due_Date, Transaction_Type, Display_Post)
VALUES 
    ('mitch', 1, 'Available', '30.00', 'Software Dev 1', 'New', NULL, 'Sale', 1),
    ('mitch', 2, 'Available', '35.00', 'Internetworking', 'Good', NULL, 'Sale', 1),
    ('mitch', 3, 'Available', '10.00', 'Software Dev 2', 'Poor', NULL, 'Sale', 1),
    ('mitch', 4, 'Available', '100.00', 'Algorithms and Analysis', 'New', NULL, 'Sale', 1),
    ('mitch', 5, 'Available', '75.00', 'Organic Chemistry', 'Poor', NULL, 'Sale', 1),
    ('mitch', 6, 'Available', '50.00', 'Creative Writing', 'New', NULL, 'Sale', 1),
    ('mitch', 7, 'Available', '60.00', 'Modern Speculative Fiction', 'New', NULL, 'Sale', 1),
    ('mitch', 8, 'Available', '24.00', 'English 1', 'Poor', NULL, 'Sale', 1),
    ('mitch', 9, 'Available', '19.99', 'Classic Literature', 'Good', NULL, 'Sale', 1),
    ('mitch', 10, 'Available', '39.99', 'Advanced Electrical Engineering', 'Good', NULL, 'Sale', 1),
    ('mitch', 11, 'Available', '9.99', 'Calculus III', 'Fair', NULL, 'Sale', 1),
    ('mitch', 12, 'Available', '150.00', 'Differential Equations', 'Good', NULL, 'Sale', 1),
    ('mitch', 13, 'Available', '6.00', 'Discrete Mathematics', 'New', NULL, 'Sale', 1),
    ('mitch', 14, 'Available', '25.00', 'Quantum Physics', 'Good', NULL, 'Sale', 1),
    ('mitch', 15, 'Available', '30.00', 'Physics II', 'Poor', NULL, 'Sale', 1),
    ('mitch', 16, 'Available', '24.00', 'Theory of Compilers', 'Poor', NULL, 'Sale', 1),
    ('steven', 6, 'Available', '141.99', 'Modern Speculative Fiction', 'Poor', NULL, 'Sale', 1);



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