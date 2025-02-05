# 외근신청 BackEnd

## 기술 스택
- Node.js
- Express
- Oracle DB
- OracleDB (Node.js Oracle 드라이버)

## 주요 기능
1. 외근 신청 API
    - 기안자/승인자 목록 조회
    - 외근 신청 등록
    - 신청 상태 관리 ('R': 신청중, 'C': 결재완료)

## API 명세
- URL: `http://localhost:3000`
- 엔드포인트:
    - `/outwork/list/reqUser`: 기안자 목록 조회 (POST)
    - `/outwork/list/approverUser`: 승인자 목록 조회 (POST)
    - `/outwork/request`: 외근 신청 등록 (POST)

## DB 테이블
```sql
CREATE TABLE OUT_WORK (
    IDX NUMBER PRIMARY KEY,
    요청아이디 VARCHAR2(50),
    승인아이디 VARCHAR2(50),
    외근장소 VARCHAR2(200),
    요청상태 VARCHAR2(1),
    처리일시 VARCHAR2(14)
);

CREATE SEQUENCE SEQ_OUT_WORK
    START WITH 1
    INCREMENT BY 1;
```

## 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```