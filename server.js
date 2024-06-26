const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const PORT = 8080;

app.use(express.static("public"));

app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Configure MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "your_secret_password",
    database: 'url_shortener',
    waitForConnections: true,
    connectionLimit: 10, // example limit, adjust as necessary
    queueLimit: 0
});

// Connect to MySQL
db.connect((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.post("/shorten", (req, res) => {
    let { url, newURL } = req.body;

    if (!url || typeof url != "string")
    return res.status(400).json({ error: "URL is not correct" });

    // Ensure the url starts with "http://" or "https://"
    if (!/^https?:\/\//i.test(url)) {
        url = "http://" + url;
    }

    if (!newURL || typeof newURL != "string" || !/^[\w-]+$/.test(newURL)) {
        newURL = generateRandomString(5);
        const query = 'INSERT INTO urls (original_url, short_url) VALUES (?, ?)';
        db.query(query, [url, newURL], (err, result) => {
            if (err) {
                console.error('Error inserting into MySQL:', err);
                return res.status(500).send('Error saving URL');
            }
            res.status(200).json({ success: true, url: newURL });
        });
    } else {
        // Database can get max 30 characters for the short_url
        if(newURL.length > 30)
        return res.status(400).json({ error: "The short url is too big" });

        checkIfExists(newURL)
        .then((exists) => {
            if (exists) {
                return res.status(400).json({ error: "URL already exists" });
            } else {
                const query = 'INSERT INTO urls (original_url, short_url) VALUES (?, ?)';
                db.query(query, [url, newURL], (err, result) => {
                    if (err) {
                        console.error('Error inserting into MySQL:', err);
                        return res.status(500).send('Error saving URL');
                    }
                    res.status(200).json({ success: true, url: newURL });
                });
            }
        })
        .catch((err) => {
            console.error('Error checking if URL exists:', err);
            return res.status(400).json({ error: "Error checking if URL exists" });
        });
    }
})

app.get('/:short_url', (req, res) => {
    const { short_url } = req.params;

    const query = 'SELECT original_url FROM urls WHERE short_url = ?';
    db.query(query, [short_url], (err, results) => {
        if (err || results.length === 0) {
            res.status(404).send('URL not found');
            return;
        }
        res.redirect(results[0].original_url);
        // res.status(200).send("WOW");
    });
})

app.listen(PORT, () => {
    console.log("Listening to " + PORT);
})

function checkIfExists(newURL) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM urls WHERE short_url = ?';
        db.query(query, [newURL], (err, results) => {
            if (err) {
                console.error('Error querying MySQL:', err);
                reject(err);
                return;
            }
            const count = results[0].count;
            resolve(count > 0);
        });
    });
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}