// Oracle 연결 설정
const oracledb  = require("oracledb");
require('dotenv').config({path: './.env'});

//커넥션 풀 설정
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_URL,
}
const initPool = async() => {
    try{
        await oracledb.createPool({
            ...dbConfig,
            poolMax: 10,        // 최대 커넥션 수
            poolMin: 2,         // 최소 커넥션 수
            poolIncrement: 1,   // 증가 단위
            poolTimeout: 300    // 타임아웃 (초)
        })
    }catch (err){
        console.error('intiPool 커넥션 에러: ',err);
        throw err;
    }
};

// DB 연결 함수
const getConnection = async () => {
    try {
        return await oracledb.getConnection();
    } catch (err) {
        console.log('DB 연결 에러:', err);
        throw err;
    }
};

// DB 해제 함순
const closeConnection = async(connection) => {
    try{
        if(connection){
            await connection.close();
        }
    }catch (err) {
        console.log('DB 헤제 에러:', err);
        throw err;
    }
}

module.exports = {
    initPool,
    getConnection,
    closeConnection,
    OUT_FORMAT_OBJECT: oracledb.OUT_FORMAT_OBJECT
}