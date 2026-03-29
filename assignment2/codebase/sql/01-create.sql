CREATE SCHEMA prod;

CREATE TABLE prod.mail (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    message VARCHAR,
    userId INT
);

INSERT INTO prod.mail(name, message, userId) VALUES
('My message', 'A brief email message', 1),
('My second message', 'A second email message', 1),
('My message', 'A short email message from user 2', 2);