# Inventory Management System

### Table of Contents

1. <a href="#intro">Introduction</a>
2. <a href="#features">Features</a>
3. <a href="#tech">Technologies Used</a>
4. <a href="#dbdesign">Database Design</a>

### <span id="intro">Introduction</span>

Inventory Management System helps you keep track of your stock easily and in real-time. It makes managing supplies simple by automating orders and giving clear reports, helping you save time and avoid mistakes.

### <span id="features">Features</span>

- <b>Two-Factor Authentication (2FA):</b> Enhances security with an additional layer of protection using 2FA during user authentication.
- <b>OAuth 2.0 Integration:</b> Supports OAuth 2.0 for a streamlined and secure user sign-up/sign-in process with third-party provider (Github).
- <b>JWT-based Authentication:</b> Implements secure access control with [JSON Web Token](https://jwt.io/) (JWT) for both access and refresh token handling.
- <b>Role-based Authorization:</b> Implements fine-grained access control based on user roles, ensuring protected resources are accessed only by authorized users.
- <b>Model-View-Controller (MVC) Architecture:</b> Adopts the MVC design pattern for clean, modular, and scalable code organization.
- <b>RESTful API:</b> Provides a fully-featured, scalable REST API for smooth integration and communication with clients.
- <b>Mongoose ORM:</b> Utilizes [Mongoose](https://mongoosejs.com/) for robust schema-based data modeling and interaction with [MongoDB databases](https://www.mongodb.com/).
- <b>Password Hashing with bcrypt:</b> Ensures secure password storage using [bcrypt](https://www.npmjs.com/package/bcrypt) hashing for strong security. 
- <b>Unit Testing:</b> Ensures code reliability and correctness through testing suites powered by [Jest](https://jestjs.io/).
- <b>Cross-Origin Resource Sharing (CORS):</b> Configures CORS to enable controlled access to the API from different domains.


### <span id="tech">Technologies Used</span>

- Programming Language: Javascript (Node.js)
- Database: [MongoDB databases](https://www.mongodb.com/)
- ORM: [Mongoose](https://mongoosejs.com/)
- Unit Tests: [Jest](https://jestjs.io/)
- Authentication: [JSON Web Token](https://jwt.io/)
- Password Hashing: [bcrypt](https://www.npmjs.com/package/bcrypt)
- 2-Factor Authentication: [otp-lib](https://www.npmjs.com/package/otplib)
- OAuth 2.0: [passport](https://www.npmjs.com/package/passport) 


### <span id="dbdesign"> Database Design </span>

The diagram below illustrates the database architecture, highlighting the main tables, relationships, and data flow within the system. This design acts as a blueprint for how data is stored, connected, and retrieved, ensuring efficient and structured data management. Use this diagram to gain insight into the foundational structure that drives our application's functionality.

[Database Design](https://drawsql.app/teams/general-16/diagrams/model/embed) 