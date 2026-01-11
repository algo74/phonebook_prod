const express = require('express')
const morgan = require('morgan')
const Person = require('./people_db.js')

const PORT = process.env.PORT || 3001

// const getNextId = () => String(Math.floor(Math.random() * 1_000_000_000))

const app = express()
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ') + (req.body ? ' ' + JSON.stringify(req.body) : '')
}))
app.use(express.json())
app.use(express.static('dist'))

app.get('/info', (req, res) => {
  const date = new Date()
  res.set('Content-Type', 'text/html')
  Person
    .countDocuments({})
    .then(persons_count => {
      res.end(
        `
<html><body><div>
    <p>Phonebook has info for ${persons_count} people</p>
    <p>${date}</p>
</div></body></html>
`
      )
    })
    .catch(error => {
      console.log(error)
      res.status(500).end(
        `
<html><body><div>
    <p>Failed to retrieve info</p>
    <p>${date}</p>
</div></body></html>
`
      )
    })
})

app.get('/api/persons', (req, res, next) => {
  Person
    .find({})
    .then(result => {
      res.json(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person
    .findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person
    .findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  Person
    .findOne({ name: body.name })
    .then(person => {
      if (person) {
        return response.status(422).json({
          error: 'name must be unique'
        })
      }

      const new_person = new Person({
        name: body.name,
        number: body.number,
      })
      new_person
        .save()
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  // Person
  //   .findById(id)
  //   .then(p => {
  //     if (!p) {
  //       return response.status(404).end()
  //     }
  //     p.name = body.name
  //     p.number = body.number
  //     return p.save()
  //   })
  //   .then(result => {
  //     response.json(result)
  //   })
  //   .catch(error => next(error))

  Person.findByIdAndUpdate(
    id,
    { name: body.name, number: body.number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.use((request, response) => {
  console.log('WARN: unknown endpoint', request.method, request.path)
  response.status(404).send({ error: 'unknown endpoint' })
})

app.use((error, request, response, next) => {
  console.error('ERROR:', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
})

app.listen(PORT)
console.log(`Server running on port ${PORT}`)