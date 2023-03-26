const express = require('express')
const cors = require('cors')
var morgan = require('morgan')
const app = express()

morgan.token('body', function getResponse (req) {
    return JSON.stringify(req.body)
  })

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
      },
      {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
      }
]

const number_of_persons = persons.length
const date = new Date();

app.get('/info', (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end(`Phonebook has info for ${number_of_persons} people\n${date}`)
})

const generateId = (max) => {
    return Math.floor(Math.random() * max);
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    const name = persons.some(person => person.name === body.name)

    if (!body.name || !body.number) {
        return response.status(400).json({ 
          error: 'name or number missing' 
        })
    } else if (name) {
        return response.status(400).json({ 
            error: 'name already exists in phonebook' 
        })
    }

    const person = {
        id: generateId(10000),
        name: body.name,
        number: body.number,
    }
  
    persons = persons.concat(person)
  
    response.json(person)
})
  
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})