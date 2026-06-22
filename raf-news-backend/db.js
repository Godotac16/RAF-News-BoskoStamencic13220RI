const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "raf_news"
});

connection.connect((err) => {
    if (err) {
        console.log("Greška pri povezivanju sa bazom");
        console.log(err);
        return;
    }

    console.log("Povezan sa MySQL bazom");
});

module.exports = connection;