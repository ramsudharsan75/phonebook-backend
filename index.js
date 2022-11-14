const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
morgan.token("reqBody", (req) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :reqBody"
  )
);

const findPerson = (id) => persons.find((person) => person.id === id);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => res.json(persons));

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = findPerson(id);

  if (!person) {
    return res.status(400).send(
      `<html>
            <body>
                <p>Person with id ${id} does not exist</p>
            </body>
        </html>`
    );
  }

  res.json(person);
});

app.post("/api/persons", (req, res) => {
  const person = req.body;

  if (!person.name || !person.number) {
    return res.status(400).json({
      error: "a person should have name and number",
    });
  }

  const exists = persons.find((p) => p.name === person.name);

  if (exists) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  person.id = parseInt(Math.random() * 200000);
  persons = persons.concat(person);
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = findPerson(id);

  if (!person) {
    return res.status(400).send(
      `<html>
            <body>
                <p>Person with id ${id} does not exist</p>
            </body>
        </html>`
    );
  }

  persons = persons.filter((p) => p.id != id);
  res.status(204).end();
});

app.get("/info", (req, res) => {
  res.send(`<html>
        <body>
            <p>Phonebook has info of ${persons.length} people.</p>
            <p>${new Date()}</p>
        </body>
    </html>`);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on port " + PORT + "..."));
