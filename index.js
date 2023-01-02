const express = require('express')
const app = express()
console.log('hello world')


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
app.use(express.json())

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    console.log("delete",persons)
    response.status(204).end()
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
    console.log("get persons", persons)
    response.json(persons)
  })

app.get('/info', (request, response) => {
    const infoString = `<p>Phonebook has info for ${persons.length} people</p>`
    const infoDate = new Date()
    const info = `<div><p>${infoString} ${infoDate}</p></div>`
    
    response.send(info)
    
    console.log("info")
    
  })



const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })