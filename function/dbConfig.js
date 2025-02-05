// Oracle 연결 설정
const oracledb = require("oracledb");
require('dotenv').config({path: '../.env'});

//커넥션 풀 설정
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_URL,
}
const initPool = async () => {
    try {
        await oracledb.createPool({
            ...dbConfig,
            poolMax: 10,        // 최대 커넥션 수
            poolMin: 2,         // 최소 커넥션 수
            poolIncrement: 1,   // 증가 단위
            poolTimeout: 300    // 타임아웃 (초)
        })
    } catch (err) {
        console.error('intiPool 커넥션 에러: ', err);
        throw err;
    }
};

const closePool = async () => {
    try {
        await oracledb.getPool().close();
    } catch (err) {
        console.log('closePool 에러: ', err);
        throw err;
    }
}

const executeQuery = async (sql, bindParams = [], options = {}) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(sql, bindParams, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            ...options
        });
        return result;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log('Error closing connection: ', err);
            }
        }
    }
}
module.exports = {
    initPool,
    executeQuery,
    closePool
}