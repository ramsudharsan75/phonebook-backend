require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token('reqBody', (req) => JSON.stringify(req.body))
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :reqBody'
  )
)

app.get('/api/persons', (req, res, next) =>
  Person.find({})
    .then((persons) => res.json(persons))
    .catch((err) => next(err))
)

app.get('/api/persons/:id', (req, res, next) =>
  Person.findById(req.params.id)
    .then((person) =>
      person
        ? res.json(person)
        : res.status(404).json({
          error: 'Person not found in the server, please refresh'
        })
    )
    .catch((err) => next(err))
)

app.post('/api/persons', (req, res, next) => {
  const person = req.body

  if (!person.name || !person.number) {
    return res.status(400).json({ error: 'a person should have name and number' })
  } else {
    new Person(person)
      .save()
      .then((p) => res.json(p))
      .catch((err) => next(err))
  }
})

app.put('/api/persons/:id', (req, res, next) =>
  Person.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then((updatedPerson) =>
      updatedPerson
        ? res.json(updatedPerson)
        : res.status(404).json({
          error: 'Person not found in the server, please refresh'
        })
    )
    .catch((err) => next(err))
)

app.delete('/api/persons/:id', (req, res, next) =>
  Person.findByIdAndDelete(req.params.id)
    .then((result) =>
      result
        ? res.status(204).end()
        : res.status(404).json({
          error: 'Person not found in the server, please refresh'
        })
    )
    .catch((error) => next(error))
)

app.get('/info', (req, res, next) =>
  Person.find({}).count((err, count) => {
    if (err) next(err)
    res.send(`<html>
        <body>
            <p>Phonebook has info of ${count || 0} people.</p>
            <p>${new Date()}</p>
        </body>
    </html>`)
  })
)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') { return response.status(400).json({ error: 'malformatted id' }) } else if (error.name === 'ValidationError') { return response.status(400).json({ error: error.message }) }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log('Server running on port ' + PORT + '...'))
