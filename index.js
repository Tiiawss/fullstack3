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