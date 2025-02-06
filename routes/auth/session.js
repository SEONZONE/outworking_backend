const express = require('express');
const session = require("express-session");
const router = express.Router();


router.get('/session',(req,res) =>{
    try{
        if (req.session.userId) {
            res.json({
                success: true,
                data: {
                    userId: req.session.userId,
                    userName: req.session.userName,
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: '로그인 정보가 없습니다.'
            });
        }
    }catch (error){
        console.log(error);
        res.status(500).json({
            success: false,
            message : '세션 불러오기가 실패했습니다.',
            error : error
        })
    }
})

module.exports = router;