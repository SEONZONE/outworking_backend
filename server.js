const express = require('express');
const oracledb = require('oracledb');
const app = express();
const port = 3000;
const cors = require('cors');

require('dotenv').config({path: './.env'});

app.use(express.json())
app.use(cors());

// Oracle 연결 설정
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_URL,
};

// DB 연결 함수
async function getConnection() {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        return connection;
    } catch (err) {
        console.log('DB 연결 에러:', err);
        throw err;
    }
}


app.get('/', (req, res) => {
    res.json({message: 'Hello World'});
})

//요청직원 목록 출력
app.post('/outwork/list/reqUser', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            'SELECT 이름,아이디 FROM EMP  ORDER BY 이름', []// 바인드 변수
            , {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

//승인직원 목록 출력
app.post('/outwork/list/approverUser', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            'SELECT 이름,아이디 FROM EMP WHERE 직위코드 IN (\'G\',\'B\') ORDER BY 이름', []
            , {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

//외근요청
app.post('/outwork/request', async (req, res) => {
    let connection;
    try {
        let data = req.body;
        console.log(data);
        if (!data.approverUserId || !data.requestUserId || !data.location) {
            return res.status(400).json({
                message: '필수값을 입력해주세요!'
                , code: 400
            })
        }
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `INSERT INTO OUT_WORK (
                IDX, 
                요청아이디, 
                승인아이디, 
                외근장소, 
                요청상태, 
                요청시간
            ) VALUES (
                SEQ_OUT_WORK.nextval, 
                :requestUserId, 
                :approverUserId, 
                :location, 
                'R', 
                TO_CHAR(SYSDATE,'YYYYMMDDHH24MISS')
            )`,
            {  // 바인드 변수를 객체 형태로 전달
                requestUserId: data.requestUserId,
                approverUserId: data.approverUserId,
                location: data.location
            },
            {autoCommit: true}
        );
        res.json({
            success: true,
            message: '외근 신청이 완료 되었습니다.',
            code: 200
        });
    } catch (err) {
        res.json({
            success: false,
            message: '외근 신청이 실패 했습니다.',
            error: err,
            code: 500
        });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})