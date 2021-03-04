require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(express.static("build"));
app.use(express.json());
app.use(cors());

morgan.token("body", (req) => {
    return req.method === "POST" ? JSON.stringify(req.body) : " ";
});

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :body"
    )
);

app.get("/info", (req, res) => {
    const date = new Date();
    Person.find({}).then((persons) => {
        res.send(
            `<p>Phonebook has info for ${persons.length} people<p/><p>${date}<p/>`
        );
    });
});

app.get("/api/persons", (req, res) => {
    Person.find({}).then((p) => {
        res.json(p);
    });
});

app.get("/api/persons/:id", (req, res, next) => {
    Person.findById(req.params.id)
        .then((p) => {
            if (p) {
                res.json(p);
            } else {
                res.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({ error: "content missing" });
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person
        .save()
        .then((savedPerson) => savedPerson)
        .then((savedAndFormattedPerson) => {
            res.json(savedAndFormattedPerson);
        })
        .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end();
        })
        .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
    const body = req.body;

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then((updatedPerson) => {
            res.json(updatedPerson);
        })
        .catch((error) => next(error));
});

// handler of requests with unknown endpoint
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

// handler of requests with result to errors
const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return res.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
    }

    next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
