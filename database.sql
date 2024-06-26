CREATE DATABASE url_shortener;

USE url_shortener;

CREATE TABLE urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_url VARCHAR(255) NOT NULL,
    short_url VARCHAR(30) NOT NULL
);