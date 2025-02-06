require('dotenv').config({path: './.env'});
const db = require("../../function/dbConfig");
const express = require('express');
const router = express.Router();
const crypto = require('crypto');


router.post(`/login`, async (req, res) => {
    try {
        const data = req.body.formData;
        let success = false;
        let message = '';
        const result = await db.executeQuery(
            `SELECT * FROM EMP WHERE 아이디 = :id AND 비밀번호 = :pw`,
            {
                id: data.userid,
                pw: crypto.pbkdf2Sync(data.password,process.env.CRYPTO,1, 64, "SHA512").toString("base64")
            },
        );
        if(result.rows.length > 0){
            req.session.userId = result.rows[0].아이디;
            req.session.userName = result.rows[0].이름;
            success = true;
            message = '로그인이 성공 했습니다.'
        }else{
            success = false;
            message = '로그인이 일치하지 않습니다.'
        }

        res.json({
            success: success,
            message: message,
            code: 200
        });
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: '로그인이 실패 했습니다.',
            error: err,
            code: 500
        });
    }
})

module.exports = router;