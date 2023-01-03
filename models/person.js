const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to')
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB', result.String)
    }) .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const validator = val => {
        if (val.match(/\d{2,3}[-]\d{3,}/)) {
          console.log(val)
          return true
        } else {
          console.log(val)
          return false
        }
      }

const custom = [validator, 'Number needs to consist of two parts separated by a dash. First part must consist of 2-3 digits.']
const personSchema = new mongoose.Schema({
        name: { type: String, minlength: 3, required: true },
        number: { type: String, minlength: 8, required: true, validate: custom }
      })

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)