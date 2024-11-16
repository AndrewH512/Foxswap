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
    ISBN VARCHAR(255) NOT NULL UNIQUE,                 -- ISBN of the book (unique constraint)
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
    Price VARCHAR(20) NOT NULL,								  -- Foreign key refrencing the post's price
    created_at DATETIME NOT NULL,  										  -- Timestamp for when the transaction was created

    -- Foreign key constraints
    FOREIGN KEY (Post_ID) REFERENCES Posts(Post_ID) ON DELETE CASCADE,
    FOREIGN KEY (Buyer) REFERENCES Users(Username) ON DELETE CASCADE,
    FOREIGN KEY (Seller) REFERENCES Users(Username) ON DELETE CASCADE
);

-- Inserting Data Into the tables
-- Insert additional records into the users table (example data)
-- Inserting Users, Admins, Our Accounts and Steve
INSERT INTO Users (Username, First_Name, Last_Name, Phone_Number, Email, Password, Salt, Admin, Banned, Profile_Picture, Bio)
VALUES 
    ('andrew512', 'Andrew', 'Hennessy', '845-561-8782', 'andrewhenn512@gmail.com', SHA2(CONCAT('123random', 'salt_for_andrew512'), 256), 'salt_for_andrew512', 1, 0, '/uploads/andrew.png', 'Bio goes here'),
    ('steven', 'Steve', 'Stever', '987-654-3210', 'steve@gmail.com', SHA2(CONCAT('mynamesteve', 'salt_for_steven'), 256), 'salt_for_steven', 0, 0, '/uploads/steve.png', 'Steve is a nerd'),
    ('admin', 'Admin', 'Admin', '123-456-7890', 'admin@gmail.com', SHA2(CONCAT('marist123', 'salt_for_admin'), 256), 'salt_for_admin', 1, 0, '/uploads/admin.jpg', 'Admin'),
    ('mitch', 'Mitch', 'Levy', '845-699-9999', 'Mitchell.Levy1@outlook.com', SHA2(CONCAT('marist123', 'salt_for_mitch'), 256), 'salt_for_mitch', 1, 0, '/uploads/admin.jpeg', 'Stupid Admin'),
    ('tania1518', 'Tania', 'Hernandez', '845-505-8317', 'taiamarez1518@gmail.com', SHA2(CONCAT('mypass1','salt_for_tania1518'), 256), 'salt_for_tania1518', 0, 0, '/uploads/tania.jpg', 'hi'),
    ('albiana12', 'Albiana', 'Krasniqi', '845-123-0000', 'albianamail@gmail.com', SHA2(CONCAT('mypass2','salt_for_albiana12'), 256), 'salt_for_albiana12', 0, 0, '/uploads/albiana.jpg', 'hi2'),
    ('davidR', 'David', 'Ramsaroop', '845-456-0000', 'davidmail@gmail.com', SHA2(CONCAT('mypass1','salt_for_davidR'), 256), 'salt_for_davidR', 0, 0, '/uploads/david.jpg', 'hi3');
    

-- Inserting More Test Users, Theses are fake accounts, going to be used for testing and has to be deleted when website goes live**
INSERT INTO Users (Username, First_Name, Last_Name, Phone_Number, Email, Password, Salt, Admin, Banned, Profile_Picture, Bio)
VALUES 
    ('ashley90', 'Ashley', 'Davis', '555-111-2221', 'ashley.davis@example.com', SHA2(CONCAT('AshSecret', 'salt_for_ashley90'), 256), 'salt_for_ashley90', 0, 0, '/uploads/default.jpg', 'Ashley enjoys volunteering and making a difference.'),
    ('michael43', 'Michael', 'Lee', '555-222-3332', 'michael.lee@example.com', SHA2(CONCAT('MikePass43', 'salt_for_michael43'), 256), 'salt_for_michael43', 0, 0, '/uploads/default.jpg', 'Michael is passionate about technology and innovation.'),
    ('sarah55', 'Sarah', 'Green', '555-333-4443', 'sarah.green@example.com', SHA2(CONCAT('SarahRocks', 'salt_for_sarah55'), 256), 'salt_for_sarah55', 0, 0, '/uploads/default.jpg', 'Sarah loves photography and the outdoors.'),
    ('daniel32', 'Daniel', 'Harris', '555-444-5554', 'daniel.harris@example.com', SHA2(CONCAT('DannySecure', 'salt_for_daniel32'), 256), 'salt_for_daniel32', 0, 0, '/uploads/default.jpg', 'Daniel enjoys woodworking and crafts.'),
    ('emily29', 'Emily', 'Moore', '555-555-6665', 'emily.moore@example.com', SHA2(CONCAT('EmilyPass29', 'salt_for_emily29'), 256), 'salt_for_emily29', 0, 0, '/uploads/default.jpg', 'Emily loves animals and works as a vet assistant.'),
    ('johnnyB', 'Johnny', 'Baker', '555-666-7776', 'johnny.baker@example.com', SHA2(CONCAT('BakeIt123', 'salt_for_johnnyB'), 256), 'salt_for_johnnyB', 0, 0, '/uploads/default.jpg', 'Johnny is a chef who loves experimenting with new recipes.'),
    ('victoriaV', 'Victoria', 'Young', '555-777-8887', 'victoria.young@example.com', SHA2(CONCAT('Vicky!Vibe', 'salt_for_victoriaV'), 256), 'salt_for_victoriaV', 0, 0, '/uploads/default.jpg', 'Victoria is an avid traveler and photographer.'),
    ('benjamin81', 'Benjamin', 'Walker', '555-888-9998', 'benjamin.walker@example.com', SHA2(CONCAT('BenSecure81', 'salt_for_benjamin81'), 256), 'salt_for_benjamin81', 0, 0, '/uploads/default.jpg', 'Benjamin is a history buff and aspiring writer.'),
    ('olivia77', 'Olivia', 'Martinez', '555-999-0009', 'olivia.martinez@example.com', SHA2(CONCAT('LivMart77', 'salt_for_olivia77'), 256), 'salt_for_olivia77', 0, 0, '/uploads/default.jpg', 'Olivia enjoys painting and creative arts.'),
    ('charlieK', 'Charlie', 'King', '555-000-1110', 'charlie.king@example.com', SHA2(CONCAT('CharlieSecure', 'salt_for_charlieK'), 256), 'salt_for_charlieK', 0, 0, '/uploads/default.jpg', 'Charlie is a musician and plays the guitar.'),
    ('madison56', 'Madison', 'Adams', '555-111-2222', 'madison.adams@example.com', SHA2(CONCAT('MadisonPass56', 'salt_for_madison56'), 256), 'salt_for_madison56', 0, 0, '/uploads/default.jpg', 'Madison is passionate about design and art.'),
    ('robert12', 'Robert', 'Nelson', '555-222-3333', 'robert.nelson@example.com', SHA2(CONCAT('RobSecure12', 'salt_for_robert12'), 256), 'salt_for_robert12', 0, 0, '/uploads/default.jpg', 'Robert enjoys hiking and wildlife photography.'),
    ('graceG', 'Grace', 'Carter', '555-333-4444', 'grace.carter@example.com', SHA2(CONCAT('GracefulG', 'salt_for_graceG'), 256), 'salt_for_graceG', 0, 0, '/uploads/default.jpg', 'Grace is a yoga instructor and wellness coach.'),
    ('henry78', 'Henry', 'Garcia', '555-444-5555', 'henry.garcia@example.com', SHA2(CONCAT('Henry!78', 'salt_for_henry78'), 256), 'salt_for_henry78', 0, 0, '/uploads/default.jpg', 'Henry is an engineer who loves problem-solving.'),
    ('sophie32', 'Sophie', 'Wright', '555-555-6666', 'sophie.wright@example.com', SHA2(CONCAT('Soph32Pass', 'salt_for_sophie32'), 256), 'salt_for_sophie32', 0, 0, '/uploads/default.jpg', 'Sophie enjoys reading and learning new languages.'),
    ('lucas01', 'Lucas', 'Lopez', '555-666-7777', 'lucas.lopez@example.com', SHA2(CONCAT('LucLoz01', 'salt_for_lucas01'), 256), 'salt_for_lucas01', 0, 0, '/uploads/default.jpg', 'Lucas is a software developer and gamer.'),
    ('maria88', 'Maria', 'Brown', '555-777-8888', 'maria.brown@example.com', SHA2(CONCAT('Maria88Pass', 'salt_for_maria88'), 256), 'salt_for_maria88', 0, 0, '/uploads/default.jpg', 'Maria enjoys photography and digital art.'),
    ('jacob42', 'Jacob', 'Jones', '555-888-9999', 'jacob.jones@example.com', SHA2(CONCAT('JakeSecure42', 'salt_for_jacob42'), 256), 'salt_for_jacob42', 0, 0, '/uploads/default.jpg', 'Jacob loves sports and outdoor activities.'),
    ('chloe21', 'Chloe', 'Diaz', '555-999-0000', 'chloe.diaz@example.com', SHA2(CONCAT('ChloeDiaz21', 'salt_for_chloe21'), 256), 'salt_for_chloe21', 0, 0, '/uploads/default.jpg', 'Chloe is a nature lover and likes gardening.'),
    ('dylan65', 'Dylan', 'Rodriguez', '555-111-2223', 'dylan.rodriguez@example.com', SHA2(CONCAT('DylSecure65', 'salt_for_dylan65'), 256), 'salt_for_dylan65', 0, 0, '/uploads/default.jpg', 'Dylan is an aspiring actor with a love for film.'),
    ('anna13', 'Anna', 'Martinez', '555-222-3334', 'anna.martinez@example.com', SHA2(CONCAT('Anna13Pass', 'salt_for_anna13'), 256), 'salt_for_anna13', 0, 0, '/uploads/default.jpg', 'Anna enjoys cooking and exploring new recipes.'),
    ('samuel91', 'Samuel', 'Perez', '555-333-4445', 'samuel.perez@example.com', SHA2(CONCAT('SamPass91', 'salt_for_samuel91'), 256), 'salt_for_samuel91', 0, 0, '/uploads/default.jpg', 'Samuel loves playing soccer and staying active.'),
    ('ella54', 'Ella', 'Collins', '555-444-5556', 'ella.collins@example.com', SHA2(CONCAT('Ella54Secret', 'salt_for_ella54'), 256), 'salt_for_ella54', 0, 0, '/uploads/default.jpg', 'Ella is a passionate reader and loves novels.'),
    ('leo33', 'Leo', 'Evans', '555-555-6667', 'leo.evans@example.com', SHA2(CONCAT('LeoEvans33', 'salt_for_leo33'), 256), 'salt_for_leo33', 0, 0, '/uploads/default.jpg', 'Leo is a drummer in a local band.'),
    ('natalie66', 'Natalie', 'Rivera', '555-666-7778', 'natalie.rivera@example.com', SHA2(CONCAT('Nat@Pass66', 'salt_for_natalie66'), 256), 'salt_for_natalie66', 0, 0, '/uploads/default.jpg', 'Natalie is interested in environmental sciences.'),
    ('max47', 'Max', 'Hall', '555-777-8889', 'max.hall@example.com', SHA2(CONCAT('Max47Secure', 'salt_for_max47'), 256), 'salt_for_max47', 0, 0, '/uploads/default.jpg', 'Max is an artist who works with mixed media.'),
    ('zoe92', 'Zoe', 'Scott', '555-888-9990', 'zoe.scott@example.com', SHA2(CONCAT('ZoeScott92', 'salt_for_zoe92'), 256), 'salt_for_zoe92', 0, 0, '/uploads/default.jpg', 'Zoe enjoys theater and musical performance.'),
    ('liam25', 'Liam', 'Torres', '555-999-0001', 'liam.torres@example.com', SHA2(CONCAT('LiamTorres25', 'salt_for_liam25'), 256), 'salt_for_liam25', 0, 0, '/uploads/default.jpg', 'Liam is an avid video game player.'),
    ('isabella44', 'Isabella', 'Flores', '555-111-2224', 'isabella.flores@example.com', SHA2(CONCAT('Isa!44', 'salt_for_isabella44'), 256), 'salt_for_isabella44', 0, 0, '/uploads/default.jpg', 'Isabella loves graphic design and illustration.'),
    ('josh98', 'Josh', 'Reyes', '555-222-3335', 'josh.reyes@example.com', SHA2(CONCAT('JoshPass98', 'salt_for_josh98'), 256), 'salt_for_josh98', 0, 0, '/uploads/default.jpg', 'Josh is studying computer science and coding.');


-- Inserting Books with Book_IDs
INSERT INTO Books (Book_ID, Author, ISBN, Title, Book_Subject, Cover_Picture)
VALUES 
    (1, 'Sharon Stiteler', '0133761319', 'North American Bird Watching for Beginners', 'Nature', '/uploads/book1.jpg'),
    (2, 'Rick Beech', '0122761312', 'The Origami Handbook', 'Crafts', '/uploads/book2.jpg'),
    (3, 'Cathy Tanimura', '0156761312', 'SQL for Data Analysis', 'CMPT', '/uploads/book3.jpg'),
    (4, 'Nick Samoylov', '0198761312', 'Introduction to Programming', 'CMPT', '/uploads/book4.jpg'),
    (5, 'Jearl Walker', '0164761312', 'Fundamentals of Physics', 'PHYS', '/uploads/book5.jpg'),
    (6,'Jonathan Haidt', '9780465028023', 'The Happiness Hypothesis', 'Self Improvement', '/uploads/book6.jpg'), 
    (7,'Martin Handford', '9781536211580', 'Where’s Waldo? Spooky Spotlight Search', 'Juvenile Fiction','/uploads/book7.jpg'), 
    (8,'Tieghan Gerard', '9780593232552', 'Half Baked Harvest Every Day', 'Cooking', '/uploads/book8.jpg'), 
    (9,'William B McGregor', '9781350164260', 'Linguistics: An Introduction - 3rd Edition', 'Language Arts', '/uploads/book9.jpg'), 
    (10,'Don Taylor', '9781399085205', 'Roman Empire At War', 'History', '/uploads/book10.jpg'), 
    (11,'Charlie Ellis', '1786857847', 'The Best Cat Memes Ever', 'Humor', '/uploads/book11.jpg'), 
    (12,'James Stewart', '9781305270350', 'Single Variable Calculus: Early Transcendentals - 8th edition', 'Mathematics', '/uploads/book12.jpg'), 
    (13,'King Arthur Baking Company', '9781668009741', 'Big Book of Bread', 'Baking', '/uploads/book13.jpg'), 
    (14,'Eric Carle', '9780399226908', 'The Very Hungry Caterpillar', 'Juvenile Fiction', '/uploads/book14.jpg'), 
    (15,'Unknown', '0711980829', 'I Can Play That!', 'Music', '/uploads/book15.jpg'), 
    (16,'Guinness World Records', '1913484203', 'Guinness World Records', 'History', '/uploads/book16.jpg'), 
    (17,'Erick Stack', '9781706619147', 'Computer Networking Beginner’s Guide', 'Technology', '/uploads/book17.jpg'), 
	(18,'Pushpendu Rackshit', '192876500', 'Database Management system]', 'Technology','/uploads/book18.jpg'), 
	(19,'Scott Tilley', '0357117816', 'Systems Analysis and Design', 'Technology', '/uploads/book19.jpg'), 
	(20,'Severin Sorensen', '9798328836234', 'The AI Whisperer 2nd Edition', 'Computer Science', '/uploads/book20.jpg'),
    (21,'Walter Isaacson', '9781451648539', 'Steve Jobs', 'Biography', '/uploads/book21.jpg'),
	(22,'Walter Isaacson', '9781455584938', 'The Innovators: How a Group of Hackers, Geniuses, and Geeks Created the Digital Revolution', 'History', '/uploads/book22.jpg'),
	(23,'Walter Isaacson', '9781476753657', 'Leonardo da Vinci', 'Biography', '/uploads/book23.jpg'),
	(24,'Jeffrey S. Young', '9780071355220', 'The Complete Handbook of Business and Management', 'Business', '/uploads/book24.jpg'),
	(25,'Jeffrey S. Young', '9781118026162', 'The Art of Business: In the Eye of the Beholder', 'Business', '/uploads/book25.png'),
	(26,'Karen Blumenthal', '9780689852704', 'Let Me Play: The Story of the First Woman to Coach in the NFL', 'Sports', '/uploads/book26.png'),
	(27,'Karen Blumenthal', '9780375860439', 'Claudette Colvin: Twice Toward Justice', 'History', '/uploads/book27.jpg'),
	(28,'Chrisann Brennan', '9781451627473', 'The Bite in the Apple: A Memoir of My Life with Steve Jobs', 'Memoir', '/uploads/book28.png'),
	(29,'Malcolm Gladwell', '9780316017930', 'Outliers: The Story of Success', 'Psychology', '/uploads/book29.jpg'), 
	(30,'Yuval Noah Harari', '9780062316110', 'Sapiens: A Brief History of Humankind', 'History', '/uploads/book30.jpg'), 
	(31,'Stephen Hawking', '9780553802023', 'A Brief History of Time', 'Science', '/uploads/book31.jpg'), 
	(32,'Tara Westover', '9780399590504', 'Educated: A Memoir', 'Memoir', '/uploads/book32.jpg'), 
	(33,'Michelle Obama', '9781524763138', 'Becoming', 'Biography', '/uploads/book33.jpg'), 
	(34,'Mark Manson', '9780062457714', 'The Subtle Art of Not Giving a F*ck', 'Self-Help', '/uploads/book34.jpg'), 
	(35,'Malala Yousafzai', '9780316336364', 'I Am Malala: The Girl Who Stood Up for Education and Was Shot by the Taliban', 'Biography', '/uploads/book35.jpg'),
	(36,'Jean-Jaques Reibel', '8323142602', 'Cybersecurity for kittens', 'Cybersecurity', '/uploads/book36.jpg'),
	(37,'V. K . Balakrishnan ', '0130399426', 'Introductory Discrete Mathematics ', 'Computer Science ', '/uploads/book37.jpg '),
	(38,' Nikolaus Correll', ' 9780262047555', 'Introduction to Autonomous Robots ', ' Computer Science', '/uploads/book38.jpg  '),
	(39,'David Stewart ', '0205242995 ', 'Fundamentals of Philosophy ', 'Philosophy ', '/uploads/book39.jpg '),
	(40,'Earl Coddington ', '0486659429 ', 'An Introduction to Ordinary Differential Equations ', 'Math ', '/uploads/book40.jpg '),
	(41,'Nathaniel Johnston ', '3030528138 ', 'Introduction to Linear and Matrix Algebra ', 'Math ', '/uploads/book41.jpg '),
	(42,'Y. Liang ', '0136520235 ', 'Introduction to Java Programming and Data Structures, Comprehensive Version ', 'Computer Science ', '/uploads/book42.jpg '),
	(43,'Robert Lafore ', '0672323087 ', 'Object Oriented Programming in C++ ', 'Computer Science ', '/uploads/book43.jpg '),
	(44,'K.N. King ', '0393979504 ', 'C Programming: A Modern Approach, 2nd Edition ', 'Computer Science ', ' /uploads/book44.jpg'),
	(45,'Jon Duckett ', '1118008189', 'HTML and CSS: Design and Build Websites ', 'Computer Science ', '/uploads/book45.jpg '),
	(46,'Jon Duckett ', '9781118531648 ', 'JavaScript and jQuery: Interactive Front-End Web Development ', 'Computer Science ', '/uploads/book46.jpg '),
	(47,'Chip Huyen ', '1098107969 ', 'Designing Machine Learning Systems: An Iterative Process for Production-Ready Applications ', 'Computer Science ', '/uploads/book47.jpg '),
	(48,'Aaron Langenauer ', '1835562078 ', 'Fluent in AI: Teaching Prompt Engineering and the Human-AI Partnership ', 'Computer Science ', '/uploads/book48.jpg '),
	(49,'Robert Martin ', '9780132350884 ', 'Clean Code: A Handbook of Agile Software Craftsmanship ', 'Computer Science ', '/uploads/book49.jpg '),
	(50,'Christopher Bishop ', '3031454677 ', 'Deep Learning: Foundations and Concepts ', 'Computer Science ', '/uploads/book50.jpg '),
	(51,'John Zelle ', '1590280288 ', 'Python Programming: An Introduction to Computer Science ', ' Computer Science', ' /uploads/book51.jpg'),
	(52,'Chris McMullen ', '194169374 ', 'Calculus with Multiple Variables ', 'Mathematics ', '/uploads/book52.jpg '),
	(53,'Paul Kleinman ', '9781440567674 ', 'Philosophy 101 ', 'Philosophy ', '/uploads/book53.jpg '),
	(54,'NEDU ', '195291406X ', 'Biology Made Easy ', 'Biology ', '/uploads/book54.jpg '),
	(55,'David J Hunter ', '‎ 1284184765 ', 'Essentials of Discrete Mathematics ', 'Mathematics ', '/uploads/book55.jpg '),
	(56,'Chuck Easttom ', '0135774772', 'Computer Security Fundamentals ', 'Cybersecurity ', '/uploads/book56.jpg '),
	(57,'Jill West ', '0357504402 ', 'Data Communications and Computer Networks ', 'Data Communications ', '/uploads/book57.jpg'),
	(58,'William Pride ', '1337386920 ', 'Foundations of Business ', 'Business ', '/uploads/book58.jpg '),
	(59,'Theodore E. Brown ', '0321910419 ', 'Chemistry: The Central Science ', 'Chemistry ', '/uploads/book59.jpg '),
	(60,'Mary Jane Sterling ', '0470430903', 'Linear Algebra For Dummies ', 'Mathematics ', '/uploads/book60.jpg '),
	(61,'Douglas E. Comer ', '013608530X ', 'Internetworking with TCP/IP ', 'Internetworking ', '/uploads/book61.jpg '),
	(62,'James Trefil', '1234567890 ', 'Space Atlas ', 'Space ', ' /uploads/book62.jpg'),
	(63,'Mark Bjelland ', '1259570002 ', 'Introduction to Geography ', 'Geography ', ' /uploads/book63.jpg'),
	(64,'William Duiker ', '1337401048 ', 'World History ', 'History ', '/uploads/book64.jpg '),
	(65,'Glenn Brookshear ', '013487546X ', 'Computer Science: An Overview ', 'Computer Science', '/uploads/book65.jpg '),
    (66, 'Y. Daniel Liang', '0133761312', 'Introduction to Java Programming', 'CMPT', '/uploads/book66.jpeg'),
    (67, 'Wendell Odum', '1587147149', 'CCNA 200-301 Official Cert Guide Library', 'CMPT', '/uploads/book67.jpeg'),
    (68, 'Jane Valade', '0470527587', 'PHP & MySQL For Dummies, 4th Edition', 'CMPT', '/uploads/book68.jpeg'),
    (69, 'Jon Kleinberg', '9780321295354', 'Algorithm Design', 'CMPT', '/uploads/book69.jpeg'),
    (70, 'Jonathan Clayden', '9780199270293', 'Organic Chemistry 2nd Edition', 'BIO', '/uploads/book70.jpeg'),
    (71, 'Michael Crichton', '9781405072960', 'Jurassic Park', 'ENG', '/uploads/book71.jpeg'),
    (72, 'Michael Crichton', '0061990558', 'Sphere', 'ENG', '/uploads/book72.jpeg'),
    (73, 'Michael Crichton', '0345468260', 'Timeline', 'ENG', '/uploads/book73.jpeg'),
    (74, 'Michael Crichton', '0804171297', 'The Terminal Man', 'ENG', '/uploads/book74.jpeg'),
    (75, 'Steve Alcorn', '9798652700775', 'Theme Park Design', 'ENGR', '/uploads/book75.jpeg'),
    (76, 'Ron Larson and Bruce Edwards', '9781337275347', 'Calculus 11th Edition', 'MAT', '/uploads/book76.jpeg'),
    (77, 'Chris McMullen', '1941691390', 'Differential Equations Essential Skills Practice Workbook with Answers', 'MAT', '/uploads/book77.jpeg'),
    (78, 'Susanna Epp', '1337694193', 'Discrete Mathematics with Applications 5th Edition', 'MAT', '/uploads/book78.jpeg'),
    (79, 'David J. Griffiths and Darrell F. Shroeter', '1107189632', 'Introduction to Quantum Mechanics 3rd Edition', 'PHY', '/uploads/book79.jpeg'),
    (80, 'Hugh D. Young and Roger A. Freeman', '0133978044', 'University Physics with Modern Physics, Volume 1 (Chs. 1-20) (14th Edition)', 'PHY', '/uploads/book80.jpeg'),
    (81, 'Charles N. Fischer and Richard Joseph LeBlanc', '9780136067054', 'Crafting a Compiler', 'CMPT', '/uploads/book81.jpeg');

-- Inserting Posts with correct Book_ID references
INSERT INTO Posts (Seller, Book_ID, Status, Price, Class_Name, Book_Condition, Due_Date, Transaction_Type, Display_Post)
VALUES
	('steven', 1, 'Available', '141.99', 'Bird Watching 101', 'Poor', NULL, 'Sale', 1),
    ('steven', 2, 'Available', '140.99', 'Intro Origami', 'New', NULL, 'Sale', 1),
    ('steven', 3, 'Available', '41.99', 'Data Analysis', 'Good', NULL, 'Sale', 1),
    ('steven', 4, 'Available', '11.99', 'Software Dev 1', 'New', NULL, 'Sale', 1),
    ('steven', 5, 'Available', '14.00', 'Physics 100', 'Good', NULL, 'Sale', 1),
    ('tania1518', 6, 'Available', '23.00', 'First Year Seminar', 'New', Null,  'Sale', 1),
	('tania1518', 7, 'Available', '45.99', 'Investigation 101', 'Good', Null,  'Sale', 1),
	('tania1518', 8, 'Available', '100.00', 'Introduction to Bread', 'Fair', Null,  'Sale', 1),
	('tania1518', 9, 'Available', '21.50', 'Introduction to Linguistics', 'Poor', Null,  'Sale', 1),
	('tania1518', 10,'Available', '3.00', 'History of Rome', 'New', Null,  'Sale', 1),
	('tania1518', 11, 'Available', '234.00', 'The Art of Memes', 'Good', Null,  'Sale', 1),
	('tania1518', 12, 'Available', '13.99', 'Calculus I', 'Fair', Null,  'Sale', 1),
	('tania1518', 13, 'Available', '42.00', 'Introduction to Bread', 'Poor', Null,  'Sale', 1),
	('tania1518', 14, 'Available', '12.00', 'Preschool Education 101', 'New', Null,  'Sale', 1),
	('tania1518', 15, 'Available', '200.00', 'Introduction to Music Theory', 'Good', Null,  'Sale', 1),
	('tania1518', 16, 'Available', '5.99', 'World History I', 'Fair', Null,  'Sale', 1),
	('tania1518', 17, 'Available', '65.00', 'Internetworking', 'Poor', Null,  'Sale', 1),
	('tania1518', 18, 'Available', '20.00', 'Database Management', 'New', Null,  'Sale', 1),
	('tania1518', 19, 'Available', '85.00', 'System Analysis', 'Good', Null,  'Sale', 1),
	('tania1518', 20, 'Available', '1.00', 'Introduction to AI', 'Fair', Null,  'Sale', 1),
	('andrew512', 21, 'Available', '20.00', 'History', 'Good', Null, 'Sale', 1),
	('andrew512', 22, 'Available', '65.00', 'Computer Science', 'Poor', Null, 'Sale', 1),
	('andrew512', 23, 'Available', '54.00', 'English', 'Poor', Null, 'Sale', 1),
	('andrew512', 24, 'Available', '32.00', 'History', 'Fair', Null, 'Sale', 1),
	('andrew512', 25, 'Available', '24.00', 'History', 'Good', Null, 'Sale', 1),
	('andrew512', 26, 'Available', '150.00', 'History', 'Fair', Null, 'Sale', 1),
	('andrew512', 27, 'Available', '2.00', 'History', 'Poor', Null, 'Sale', 1),
	('andrew512', 28, 'Available', '90.00', 'History', 'Good', Null, 'Sale', 1),
	('andrew512', 29, 'Available', '91.00', 'Psychology', 'Good', Null, 'Sale', 1),
	('andrew512', 30, 'Available', '2.00', 'English', 'Good', Null, 'Sale', 1),
	('andrew512', 31, 'Available', '59.00', 'English', 'Good', Null, 'Sale', 1),
	('andrew512', 32, 'Available', '69.00', 'English', 'Good', Null, 'Sale', 1),
	('andrew512', 33, 'Available', '79.00', 'English', 'Fair', Null, 'Sale', 1),
	('andrew512', 35, 'Available', '30.00', 'English', 'Poor', Null, 'Sale', 1),
	('andrew512', 35, 'Available', '31.00', 'English', 'Poor', Null, 'Sale', 1),
	('davidR', 36, 'Available', '29.00', 'CYB201',  'Good',  Null , 'Sale', 1),
	('davidR', 37, 'Sold', '40.00', 'CMPT125',  'Great',  Null , 'Sale', 1),
	('davidR', 38, 'Sold', '10.00', 'CMPT101',  'New', Null,  'Sale', 1),
	('davidR', 39, 'Available', '25.75', 'PHIL101',  'Acceptable',  Null , 'Sale', 1),
	('davidR', 40, 'Available', '23.00', 'MATH202',  'New',  '2024-12-20', 'Rental', 1),
	('davidR', 41, 'Available', '65.00', 'MATH220',  'New',  '2024-12-20', 'Rental', 1),
	('davidR', 42, 'Pending', '100.00', 'CMPT330',  'Great', Null ,  'Sale', 1),
	('davidR', 43, 'Pending', '56.43 ', 'CMPT424',  'Good', Null ,  'Sale', 1),
	('davidR', 44, 'Available', '77.40', 'CMPT425',  'Acceptable',  Null , 'Sale', 1),
	('davidR', 45, 'Pending', ' 18.95', 'CMPT300',  'Acceptable',  '2024-12-20', 'Rental', 1),
	('davidR', 46, 'Rented', '10.00', 'CMPT315',  'New',  '2025-05-20', 'Rental', 1 ),
	('davidR', 47, 'Rented', '19.9005', 'CMPT301',  'New',  Null , 'Sale', 1 ),
	('davidR', 48, 'Available', '55.00', 'CMPT302',  'Great',  Null , 'Sale', 1 ),
	('davidR', 49, 'Sold', '11.55', 'CMPT335',  'Good',  '2024-12-20', 'Rental',1 ),
	('davidR', 50, 'Available', '33.95', 'CMPT401',  'Good',  '2025-12-20', 'Rental', 1 ),
	('albiana12', 51, 'Available', '20.00', 'CMPT101',  'Good',  Null , 'Sale', 1),
	('albiana12', 52, 'Available', '32.50', 'MATH102',  'Great',  Null , 'Sale', 1),
	('albiana12', 53, 'Sold', '15.75', 'PHIL101',  'New', Null, 'Sale', 1),
	('albiana12', 54, 'Pending', '35.00', 'BIO101',  'Acceptable',  Null , 'Sale', 1),
	('albiana12', 55, 'Available', '22.00', 'MATH202',  'New',  '2024-12-20', 'Rental', 1),
	('albiana12', 56, 'Available', '45.00', 'CYB220',  'New',  '2024-12-20', 'Rental', 1),
	('albiana12', 57, 'Sold', '12.50', 'DAT201',  'Great', Null,  'Sale', 1),
	('albiana12', 58, 'Sold', '40.00', 'BUS101',  'Good', Null,  'Sale', 1),
	('albiana12', 59, 'Available', '30.00', 'CHEM101',  'Acceptable',  Null , 'Sale', 1),
	('albiana12', 60, 'Pending', ' 15.00', 'MATH220',  'Acceptable',  '2024-12-20', 'Rental', 1),
	('albiana12', 61, 'Rented', '14.50', 'NET200',  'New',  '2025-05-20', 'Rental', 1 ),
	('albiana12', 62, 'Available', '17.00', 'SPA101',  'New',  Null, 'Sale', 1 ),
	('albiana12', 63, 'Available', '36.00', 'GEO220',  'Great',  Null , 'Sale', 1 ),
	('albiana12', 64, 'Pending', '10.00', 'HIS120',  'Good',  '2024-12-20', 'Rental',1 ),
	('albiana12', 65, 'Rented', '15.00', 'CMPT110',  'Good',  '2025-12-20', 'Rental', 1 ),
    ('mitch', 66, 'Available', '30.00', 'Software Dev 1', 'New', NULL, 'Sale', 1),
    ('mitch', 67, 'Available', '35.00', 'Internetworking', 'Good', NULL, 'Sale', 1),
    ('mitch', 68, 'Available', '10.00', 'Software Dev 2', 'Poor', NULL, 'Sale', 1),
    ('mitch', 69, 'Available', '100.00', 'Algorithms and Analysis', 'New', NULL, 'Sale', 1),
    ('mitch', 70, 'Available', '75.00', 'Organic Chemistry', 'Poor', NULL, 'Sale', 1),
    ('mitch', 71, 'Available', '50.00', 'Creative Writing', 'New', NULL, 'Sale', 1),
    ('mitch', 72, 'Available', '60.00', 'Modern Speculative Fiction', 'New', NULL, 'Sale', 1),
    ('mitch', 73, 'Available', '24.00', 'English 1', 'Poor', NULL, 'Sale', 1),
    ('mitch', 74, 'Available', '19.99', 'Classic Literature', 'Good', NULL, 'Sale', 1),
    ('mitch', 75, 'Available', '39.99', 'Advanced Electrical Engineering', 'Good', NULL, 'Sale', 1),
    ('mitch', 76, 'Available', '9.99', 'Calculus III', 'Fair', NULL, 'Sale', 1),
    ('mitch', 77, 'Available', '150.00', 'Differential Equations', 'Good', NULL, 'Sale', 1),
    ('mitch', 78, 'Available', '6.00', 'Discrete Mathematics', 'New', NULL, 'Sale', 1),
    ('mitch', 79, 'Available', '25.00', 'Quantum Physics', 'Good', NULL, 'Sale', 1),
    ('mitch', 80, 'Available', '30.00', 'Physics II', 'Poor', NULL, 'Sale', 1),
    ('mitch', 81, 'Available', '24.00', 'Theory of Compilers', 'Poor', NULL, 'Sale', 1);
    



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