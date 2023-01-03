const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
console.log('hello world')

app.use(express.static('build'))


const url = `mongodb+srv://fullstack:${password}@cluster0.cs8tnaz.mongodb.net/personsApp?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  
})

const Person = mongoose.model('Person', personSchema)

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




app.use(cors())

app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url  :status :res[content-length] - :response-time ms :body'))

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    console.log("delete",persons)
    response.status(204).end()
  })

const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(p => p.id))
      : 0
    return maxId + 1
  }
app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body.name)
    if (!body.name) {
      return response.status(400).json({ 
        error: 'name missing' 
      })
    }
    
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        })
      }
    
  
    const person = {
      id: generateId(),
      name: body.name,
      number: body.number
      
      
    }
  
    persons = persons.concat(person)
    console.log(person)
    response.json(person)
  })
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
  
    if (person) {
      console.log(person)
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
        response.json(person)
      })
  })

app.get('/info', (request, response) => {
    const infoString = `<p>Phonebook has info for ${persons.length} people</p>`
    const infoDate = new Date()
    const info = `<div><p>${infoString} ${infoDate}</p></div>`
    
    response.send(info)
    
    console.log("info")
    
  })



const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })