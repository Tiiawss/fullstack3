const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')


const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}
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
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title,
        author,//ehkä näin?? tai vaihda ylös eri ylinrivi
        url,
        likes,
        user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    const blogRemove = await Blog.findById(request.params.id)
    if (!request.user) {
        return response.status(401).json(
            { error: 'token missing or invalid' }
        )
    }
    if (blogRemove.user.toString() === request.user._id.toString()) {
        await Blog.findByIdAndRemove(request.params.id)
        return response.status(204).end()
    }
    return response.status(401).json(
        { error: 'not the right user to remove' }
    )
})

blogsRouter.put('/:id', async (request, response) => {
    const blogToUpdate = await Blog.findById(request.params.id)
    if (!request.user) {
        return response.status(401).json(
            { error: 'token missing or invalid' }
        )
    }//modifoi
    if (blogToUpdate.user.toString() === request.user._id.toString()) {
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

