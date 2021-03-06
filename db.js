/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

if(process.env.NODE_ENV === "biztime-test"){
    DB_URI = "postgresql:///test-biztime";

}else{
    DB_URI = "postgresql:///biztime";
}

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;