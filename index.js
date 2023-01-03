require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

const app = express()
console.log('hello world')
app.use(express.json())
app.use(express.static('build'))
app.use(cors())



let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan(':method :url  :status :res[content-length] - :response-time ms :body'))

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            console.log("delete")
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    console.log(body.name)

    if (!body.name) {
        return response.status(400).json({ 
          error: 'name missing' 
        })
      }
    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
      }

    if (persons.find( person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = new Person({
        name : body.name,
        number : body.number,

    })

    person.save().then(savedPerson => {
            
            persons = persons.concat(person)
            console.log(savedPerson)
            response.json(savedPerson)

        }).catch(error => {
            next(error)
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                console.log(person)
                response.json(person)
            } else {
                response.status(404).end()
            }
        }).catch( error => {
            next(error)
        })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const infoString = `<p>Phonebook has info for ${persons.length} people</p>`
    const infoDate = new Date()
    const info = `<div><p>${infoString} ${infoDate}</p></div>`
    
    response.send(info)
    
    console.log("info")
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name : body.name,
        number : body.number
    }
    console.log(`delete print ${request.body} ${request.params.id}`)
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(result => {
            response.json(result)
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

//Note that the error-handling middleware has to be the last loaded middleware!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })