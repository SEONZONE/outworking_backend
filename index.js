const path = require("path");
require('dotenv').config({
    path: path.resolve(__dirname, './.env')
});

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
const port = process.env.PORT;

// cors 설정
app.use(cors({
    origin: process.env.API_URL,
    credentials: true
}));

//JSON 파싱
app.use(express.json());



//세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        maxAge: 1 * 60 * 60 * 1000,
    }
}));

// router 설정
const loginRouter = require("./routes/auth/login");
const sessionRouter = require("./routes/auth/session");
const serverRouter = require("./routes/server");
const db = require("./function/dbConfig");

// prefix 설정
const prefix = process.env.NODE_ENV === 'PROD' ? '/api' : '';

app.use(`${prefix}/outwork`, loginRouter);
app.use(`${prefix}/outwork`, sessionRouter);
app.use(`${prefix}/outwork`, serverRouter);

app.listen(port, async () => {
    try {
        await db.initPool();
    } catch (err) {
        console.log(err);
    }
})