const express = require('express')
const morgan = require('morgan')

const PORT = process.env.PORT || 3001

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

// let next_id = persons.reduce((max, p) => Math.max(max, Number(p.id)), 0) + 1
// const getNextId = () => String(next_id++)
const getNextId = () => String(Math.floor(Math.random() * 1_000_000_000))

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
    res.end(
        `
<html><body><div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>
</div></body></html>
`
    )
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const people = persons.find(people => people.id === id)

    if (people) {
        response.json(people)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(people => people.id !== id)

    response.status(204).end()
})


app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body?.name
        || !body?.number
        || typeof body.name !== 'string'
        || typeof body.number !== 'string'
        || body.name.length === 0
        || body.number.length === 0
    ) {
        response.status(400).json({
            error: 'name or number missing or invalid'
        })
        return
    }

    if (persons.find(p => p.name === body.name)) {
        response.status(422).json({
            // error: `entry with name ${body.name} already exists`
            error: 'name must be unique'
        })
        return
    }

    const new_person = {
        name: body.name,
        number: body.number,
        id: getNextId(),
    }

    persons = persons.concat(new_person)

    response.json(new_person)
})

app.listen(PORT)
console.log(`Server running on port ${PORT}`)