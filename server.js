require('dotenv').config({path: './.env'});
const express = require('express');
const app = express();
const port = process.env.PORT;
const db = require("./dbConfig");
const cors = require('cors');

app.use(express.json())
app.use(cors({
    origin: process.env.API_URL,
    credentials: true
}));

const prefix = process.env.NODE_ENV === 'PROD' ? '/api' : '';

app.get('/', (req, res) => {
    res.json({message: 'Hello World'});
})

//요청직원 목록 출력
app.post(`${prefix}/outwork/list/reqUser`, async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
            'SELECT 이름,아이디 FROM EMP  ORDER BY 이름', []// 바인드 변수
            , {outFormat: db.OUT_FORMAT_OBJECT}
        );
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    } finally {
        await db.closeConnection(connection);
    }
});

//승인 상태 출력
app.post(`${prefix}/outwork/list/statusList`, async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
            `SELECT *
             FROM CODE
             WHERE 코드구분 = '외근요청상태'
               AND 사용여부 = 'Y'`, []// 바인드 변수
            , {outFormat: db.OUT_FORMAT_OBJECT}
        );
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    } finally {
        await db.closeConnection(connection);
    }
});

//승인직원 목록 출력
app.post(`${prefix}/outwork/list/approverUser`, async (req, res) => {
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
            'SELECT 이름,아이디 FROM EMP WHERE 직위코드 IN (\'G\',\'B\') ORDER BY 이름', []
            , {outFormat: db.OUT_FORMAT_OBJECT}
        );
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    } finally {
        await db.closeConnection(connection);
    }
});

//외근요청
app.post(`${prefix}/outwork/request`, async (req, res) => {
    let connection;
    try {
        let data = req.body;
        if (!data.approverUserId || !data.requestUserId || !data.location) {
            return res.status(200).json({
                message: '필수값을 입력해주세요!'
                , code: 400
            })
        }
        connection = await db.getConnection();
        let result = await connection.execute(
            `INSERT INTO OUT_WORK
             (IDX,
              요청아이디,
              승인아이디,
              외근장소,
              요청상태,
              요청시간)
             VALUES (SEQ_OUT_WORK.nextval,
                     :requestUserId,
                     :approverUserId,
                     :location,
                     'I',
                     TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'))`,
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
        await db.closeConnection(connection);
    }
})

//승인 요청중인 직원 목록
app.post(`${prefix}/outwork/list/requestList`, async (req, res) => {
    try {
        const conditions = [];
        const bindParams = [];
        if (req.body.요청시간 && req.body.요청시간.length > 0) {
            conditions.push('O.요청시간 LIKE :요청시간 || \'%\'');
            bindParams.push(req.body.요청시간);
        }
        if (req.body.요청상태 && req.body.요청상태.length > 0) {
            conditions.push('O.요청상태 = :요청상태');
            bindParams.push(req.body.요청상태);
        }
        if (req.body.승인아이디 && req.body.승인아이디.length > 0) {
            conditions.push('O.승인아이디 = :승인아이디');
            bindParams.push(req.body.승인아이디);
        }
        if (req.body.승인아이디 && req.body.승인아이디.length > 0) {
            conditions.push('O.승인아이디 = :승인아이디');
            bindParams.push(req.body.승인아이디);
        }

        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        connection = await db.getConnection();
        const result = await connection.execute(
            `SELECT IDX,
                    요청아이디,
                    E2.이름                                                               AS 요청자이름,
                    승인아이디,
                    E1.이름                                                               AS 승인자이름,
                    요청상태,
                    C.표시내용                                                              AS 요청상태화면명,
                    TO_CHAR(TO_DATE(요청시간, 'YYYYMMDDHH24MISS'), 'YYYY-MM-DD HH24:MI:SS') AS 요청날짜,
                    외근장소
             FROM OUT_WORK O
                      LEFT JOIN CODE C ON C.코드명 = O.요청상태 AND C.코드구분 = '외근요청상태'
                      LEFT JOIN EMP E1 ON E1.아이디 = O.승인아이디
                      LEFT JOIN EMP E2 ON E2.아이디 = O.요청아이디
                 ${where}
             ORDER BY IDX DESC`,
            bindParams,// 바인드 변수
            {outFormat: db.OUT_FORMAT_OBJECT}
        );
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// 승인/반려 처리
app.post(`${prefix}/outwork/status/update`, async (req, res) => {
    let connection;
    try {
        let data = req.body;
        connection = await db.getConnection();
        const result = await connection.execute(
            `UPDATE OUT_WORK
             SET 요청상태 = :flag,
                 요청시간 = TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS')
             WHERE IDX = :idx`,
            {
                flag: data.flag,
                idx: data.IDX
            },
            {autoCommit: true}
        );
        res.json({
            success: true,
            message: '상태 업데이트가 성공 했습니다.',
            code: 200
        });
    } catch (err) {
        res.json({
            success: false,
            message: '상태 업데이트가 실패 했습니다.',
            error: err,
            code: 500
        });
    } finally {
        await db.closeConnection(connection);
    }
})

app.listen(port, async () => {
    try {
        await db.initPool();
    } catch (err) {
        console.log(err);
    }
})