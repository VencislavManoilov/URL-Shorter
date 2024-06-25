const express = require("express");
const app = express();
const path = require("path");

const PORT = 8080;

app.post("/shorten", (req, res) => {
    const { url, newURL } = req.query;

    if(!url || typeof url != "string")
    return res.status(400).json({ error: "URL is not correct" });

    if((newURL && typeof newURL == "string") ? false : checkIfExists(newURL))
    return res.status(400).json({ error: "URL already exists" });

    if(!Save(url, (newURL && typeof newURL == "string") ? newURL : generateRandomString(5)))
    return res.status(400).json({ error: "Something went wrong" });

    res.status(200).json({ success: true });
})

app.listen(PORT, () => {
    console.log("Listening to " + PORT);
})

function checkIfExists(url) {
    return false;
}

function Save(url, newURL) {
    console.log(url);
    console.log(newURL);

    return true;
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