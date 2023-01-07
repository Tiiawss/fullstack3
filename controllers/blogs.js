const blogsRouter = require('express').Router()


const Blog = require('../models/blog')


console.log('hello world')


blogsRouter.get('/', (request, response) => {
    Blog
        .find({})
        .then(blogs => {
            response.json(blogs)
        })
})

blogsRouter.post('/', (request, response) => {
    const blog = new Blog(request.body)

    blog
        .save()
        .then(result => {
            response.status(201).json(result)
        })
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

blogsRouter.use(unknownEndpoint)

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
blogsRouter.use(errorHandler)
module.exports = blogsRouter

