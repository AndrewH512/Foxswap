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
    Phone_Number VARCHAR(15) NOT NULL UNIQUE,        -- Phone number
    Email VARCHAR(100) NOT NULL UNIQUE,              -- Email 
    Password VARCHAR(255) NOT NULL,                  -- Password (hashed)
    Admin BOOLEAN DEFAULT 0 NOT NULL,                -- Admin flag (default: false)
    Banned BOOLEAN DEFAULT 0 NOT NULL,               -- Banned flag (default: false)
    Profile_Picture BLOB,                            -- profile picture (optional)
    Bio TEXT                                         -- User bio (optional)
);

-- Create the books table
CREATE TABLE Books (
    Book_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,  -- Book ID as the primary key
    Author VARCHAR(100) NOT NULL,                     -- Author of the book
    ISBN VARCHAR(20) NOT NULL UNIQUE,                 -- ISBN of the book (unique constraint)
    Title VARCHAR(255) NOT NULL,                      -- Title of the book
    Subject VARCHAR(100) NOT NULL,                    -- Subject or category of the book
    Cover_Picture BLOB                                -- Path to the cover picture 
);

-- Create the posts table
CREATE TABLE Posts (
    Post_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL, -- Post ID as the primary key, auto-incremented
    Seller VARCHAR(50) NOT NULL,                     -- Foreign key referencing username from users table
    Book_ID INT NOT NULL,                             -- Foreign key referencing Book_ID from a books table
    Status VARCHAR(50) NOT NULL,                     -- Status of the post (available, sold, pending)
    Price VARCHAR(20) NOT NULL,                      -- Price of the book
    Class_Name VARCHAR(100) NOT NULL,                -- Class name for which the book 
    Book_Condition VARCHAR(50) NOT NULL,             -- Condition of the book (bad, used, acceptable)
    Due_Date DATE,                                   -- Due date for rentals or listings if applicable
    Transaction_Type BOOLEAN DEFAULT 0 NOT NULL,     -- Transaction type (0: sale, 1: rental)
    Display_Post BOOLEAN DEFAULT 1,                   -- Flag for whether the post is visible (default: true)

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

-- Create the Messages table
CREATE TABLE Messages (
    Message_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,        -- Message ID as the primary key, auto-incremented
    Users_From VARCHAR(50) NOT NULL,                           -- Foreign key referencing the sender's username
    User_To VARCHAR(50) NOT NULL,                              -- Foreign key referencing the receiver's username
    Body TEXT NOT NULL,                                        -- Message body/content
    Create_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,  -- Timestamp for when the message was created

    -- Foreign key constraints
    FOREIGN KEY (Users_From) REFERENCES Users(Username) ON DELETE CASCADE,
    FOREIGN KEY (User_To) REFERENCES Users(Username) ON DELETE CASCADE
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
('andrew512', 'Andrew', 'Hennessy', '845-561-8782', 'andrewhenn512@gmail.com', SHA2('123random', 256), 1, 0, '/images/andrew.jpg', 'Bio goes here'),
('steven', 'Steve', 'Stever', '987-654-3210', 'steve@gmail.com', SHA2('mynamesteve', 256), 0, 0, '/images/steve.jpg', 'Steve is a nerd');

-- Insert records into the books table (example data)
INSERT INTO Books (Author, ISBN, Title, Subject, Cover_Picture)
VALUES 
('Author One', '1234567890123', 'Book Title One', 'Computer Science', '/images/book1.jpg'),
('Author Two', '9876543210987', 'Book Title Two', 'Literature', '/images/book2.jpg');

-- Insert records into the posts table (example data)
INSERT INTO Posts (Seller, Book_ID, Status, Price, Class_Name, Book_Condition, Due_Date, Transaction_Type, Display_Post)
VALUES 
('andrew512', 1, 'available', '20.00', 'CS101', 'used', '2024-12-31', 0, 1),
('steven', 2, 'sold', '15.00', 'ENG201', 'acceptable', '2024-11-15', 0, 1);


ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Bluebutt9424$';