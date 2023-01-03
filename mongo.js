const mongoose = require('mongoose')
console.log(process.argv.length)
if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.cs8tnaz.mongodb.net/personsApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)


if (process.argv.length >= 4) {
  const name = process.argv[3]
  const number = process.argv[4]
  mongoose
  .connect(url)
  .then((result) => {
    console.log('connected')

    const person = new Person({
      name: name,
      number : number.toString()
      
    })

    return person.save()
  })
  .then(() => {
    console.log(`Added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
  .catch((err) => console.log(err))
}else {
  console.log('Phonebook:')
  console.log(Person)
  Person.find({}).then(result => {
      result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
  })
}


