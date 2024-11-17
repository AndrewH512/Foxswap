Foxswap - Beta Version
------------------------------------------------------------------------------------------------
Developers:
Mitchell Levy - Team Lead and Backend,
David Ramsaroop  - IS Leader and Frontend Developer,
Tania Hernandez-Martinez- Backend Developer,
Andrew Hennessy - Full Stack Developer,
Albiana Krasniqi - Frontend Developer.
------------------------------------------------------------------------------------------------
Introduction:

On Fox Swap students will be able to simply buy, sell, and rent affordable textbooks. 
Marist students should be able to search for course specific textbooks, make an offer, 
and get their textbooks at a reduced price. Students will be able to browse for textbooks, 
message the seller to negotiate the price, and then meet to buy the textbook. 
------------------------------------------------------------------------------------------------
System Architecture/System Stack:

For FoxSwap we are using Digital-ocean servers to host and manage our website. We developed the
web-app using languages including HTML, JavaScript, and CSS. On the back-end we will use MySQL as 
our database for managing and querying data. We used Node.js as the primary framework for server-side
application development. We used Express.js framework for routing and server management. Socket.Io was
used to create a real-time messaging system. In add addition we also used the multer libary for handling
file uploads and crypto for hashing passwords. 
------------------------------------------------------------------------------------------------
Features:

Accounts - User can create an account to be able to login to Foxswap. They have to enter a username,
first and last name, phone number, email, password, bio, and profile picture. Upon signup, all passwords 
are hashed and salted for secure storage Users must have an account to be able to user Foxswap. They can 
login using the username and password they setup. 

Browsing - The browsing page is where students will be able to search for textbooks. Users can find
textbooks they want by using the search bar and searching by book name, author, ISBN, or class name.
We fitler the results by the best 10 options that are closest to what the user enters. Then a user
can click on a textbook post to see more information about that textbook. Then from that textbook
information page, there are buttons to view the seller's profile as well as message the seller.

Messages - We have create a messaging system on Foxswap using the Javascript libary Socket.Io.
This system enables users to engage in real-time communication on the platform. Users can select a 
recipient and send messages in real time. Both sent and received messages are displayed instantly in 
the Foxswap chat area. Fetches and displays the full chat history with any recipient, ensuring continuity 
in conversations about selling textbooks. The system allows users to search for other users by name, or
(on the textbook information page) if you click on "message seller", you are instantly put into a chat
with that seller. The system also Displays notifications for new messages or unread messages, even when 
the user is on a different chat. Users are also allowed to removed users as well as view other user's
profiles that they are messaging. 

User Profile - The user profile page display all the information about the user. This includes their
first name, last name, bio, profile picture and you are able to view your posts as well as edit
your profile. In edit profile you can change your profile picture, first and last name, bio, and phone 
number. You must enter your password to save the changes. You are also able to view other user's profiles,
which allows you to message that user or view their posts. 

Post - The post page allows the user to create a listening for their textbook. The user must enter the author,
ISBN, title, subject, class name, cover picture, price, book condition (Good, Fair, Poor), and if the book
is for sale or for renting (must include due date for renting). One the user clicks "create listing", their
book will be displayed on the browse page for everyone to see.

Your Posts - The 'Your-Posts" page allows the user to just view all of their own listings they have created.
The user can then click on one of theses posts to see the full information of the listening and can also click 
on "edit posts". This page allows the user to easily view all of their posts without having to go through the
browse page. The "edit posts" brings you to a page to edit that listing. You can change the price of the book 
but you can also state if you sold or rented the book. If the user clicks that they did sell the book, they must
select a user they sold the book to (must be a user you messaged)  and then click on "update post". Once that happens 
the post will no longer appear on the browsing page. A user can also delete their post by click on "Delete Post". 

Reports: The reports page allows a user to fill out a complaint about another user. You must select a user (must
be a user you messaged), file out a title for the report, and finally the description. 

Admin Panel - The admin panel only appears if an admin sign in. 
- View Reports - Admins are able to view are the reports that are sent. By click on the title of the report, the Admin
can then see more information about the report. There are buttons there for the admin to go to other pages depending
on the action they need to take. 

- Search For Users - This page allows admins to search for a user and either ban or unban them. When a user is banned,
they are unable to login (a unquie error message displays telling the user they are banned).

- Search For Posts - This brings the admin to the browse to page to search for a post. A button appear in the textbook
information page (only for admins) to delete a post. 

- Edit Admin Status - This page allows admin to either make a user an admin or remove them as an admin by just
search their username. 

- Transactions - When a post is marked as sold/rented, an admin is able to view all the transactions made. The
admin can fitler this by the transaction ID. 

404 Page - The 404 page is displayed when a user tries to access a page or resource on Foxswap that does not exist.
We have test examples on our website (like favorites).
------------------------------------------------------------------------------------------------
Features That Did Not Make Version 1 Include:
-Reviews
-Changing Passwords

