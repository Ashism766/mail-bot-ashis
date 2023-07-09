## Automatic Mail Reply service
It's a service, which create automatic reply for any new mail in your inbox.

While you sign in or login with your gmail account it ask you for some permission you have to grant them to start this service ( you can stop this access later if you don't want from your google account ) after sign iin you can see a option `start the mail service` if you click there, done your service is started, now don't have to do anything, it'll handle everything by it's self.

## Usages
1. If you're busy, and you want to let know if someone mailed you.
2. ChatGPT, HuggingFace model can be integrated to create a professional reply for each individual email.

## Installation and Enviroment setup for local running

1. Clone the repository.
```sh
  git clone https://github.com/Ashism766/mail-bot-ashis.git
```
2. Install dependencies by running `npm install`.
```sh
  cd mail-bot-ashis
  npm i 
```
3. Set up the required environment variables  in a `.env` file.
    For getting the required environmental variable you have to create an app on `google developer console` and you'll get your `CLIENT_ID` and `CLIENT_SECRET`.  `USER_EMAIL` is the account mail of your google developer console account.
    
    Your `.env` file should look like this below.
  
   
```sh
    CLIENT_ID=zzzzzzzzzzzzzzzz-zzzzzzz
    CLIENT_SECRET=GOkkkkkkkkkkkxkkkkkkkkxxxxxxxxxxHs
    USER_EMAIL=absc@gmail.com 
    MONGO_URI  = 'mongodb://localhost:27017/demoDB'
```
 a. Extra setup:
    I used redis in this project but windows don't support redis natively So you have to setup and run redis to run this application without error.

4. Start the server by running `npm `.
```sh
  npm start
```

## Directory struture

```bash
.
├── README.md
├── app
│   ├── api
│   │   ├── queue.js
│   │   └── routes.js
│   ├── security
│   │   └── security.js
│   └── utils
│       └── logger.js
├── app.js
├── logs
│   ├── app.log
│   └── error.log
├── package-lock.json
├── package.json
├── public
│   └── css
│       ├── bootstrap-social.css
│       └── styles.css
└── views
    ├── home.ejs
    ├── login.ejs
    ├── partials
    │   ├── footer.ejs
    │   └── header.ejs
    ├── register.ejs
    └── start-service.ejs

```
