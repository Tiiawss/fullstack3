const blogsRouter = require('express').Router()
//const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')




console.log('hello world')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })

    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)

    if (blog) {
        response.json(blog.toJSON())
    } else {
        response.status(404).end()
    }
})

blogsRouter.post('/', async (request, response) => {
    const { title, author, url, likes } = request.body

    if (!request.token || !request.user.id) {
        return response.status(401).json({ error: 'missing or invalid token' })
    }
    const user = await User.findById(request.user.id)

    const blog =  new Blog({
        title,
        author,
        url,
        likes: likes || 0,
        user: user._id
    })
    const savedBlog = blog.save(blog)

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
        return response.status(400).json({ error: 'no blogs with given id' })
    }
    if (!request.token || blog.user.toString() !== request.user.id) {
        return response.status(401).json({ error: 'missing or invalid token' })
    }

    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)


    if (!request.user) {
        return response.status(401).json(
            { error: 'token missing or invalid' }
        )
    }
    if (blog.user.toString() === request.user._id.toString()) {
        const blog = await Blog.findByIdAndUpdate(
            request.params.id,
            request.body,
            { new: true }
        )
        return response.status(200).json(blog)
    }

    return response.status(401).json(
        { error: 'not allowed to modify' }
    )
})
//blog that the error-handling middleware has to be the last loaded middleware!

module.exports = blogsRouter

