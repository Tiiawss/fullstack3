const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    }, 100000)

    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(2)
    })

    test('the first blog is about harmful', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body[0].title).toBe('Go To Statement Considered Harmful')
    })
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')

        const contents = response.body.map(r => r.title)
        expect(contents).toContain(
            'Go To Statement Considered Harmful'
        )
    })
})
describe('adding blogs', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: '3Go To Statement Considered Harmful',
            author: '3Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 3,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const contents = blogsAtEnd.map(n => n.title)
        expect(contents).toContain(
            '3Go To Statement Considered Harmful'
        )
    })
    test('the likes are 0 if not spesified', async () => {
        const newBlog = {
            title: '3Go To Statement Considered Harmful',
            author: '3Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',

        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const contents = blogsAtEnd.map(n => n.likes)
        expect(contents).toContain(
            0
        )
    })
    test('blog without title is not added', async () => {
        const newBlog = {
            title:'',
            author: '3Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
    test('blog without url is not added', async () => {
        const newBlog = {
            title: 'jtn',
            author: '3Edsger W. Dijkstra',
            url:''

        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })


})
test('blogs have an id defined', async () => {
    const blogs = await helper.blogsInDb()

    expect(blogs[0].id).toBeDefined()
})
describe('updating a blog', () => {
    test('updates the blog likes', async () => {
        const blog = await Blog.findOne({ title: 'Go To Statement Considered Harmful' })
        console.log(blog.id)
        blog.likes = 200
        await api
            .put(`/api/blogs/${blog.id}`)
            .send(blog)
            .expect(200)

        expect(blog.likes).toBe(200)
    })
})
describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(
            helper.initialBlogs.length - 1
        )

        const contents = blogsAtEnd.map(r => r.title)

        expect(contents).not.toContain(blogToDelete.title)
    })
})



afterAll(() => {
    mongoose.connection.close()
})