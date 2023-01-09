const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)

beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    const user1 = {
        'username': 'minavain',
        'name': 'mina mina',
        'password': 'salasana'
    }
    await api.post('/api/users')
        .set('Content-Type', 'application/json')
        .send(user1)
    const login1 = await api.post('/api/login')
        .set('Content-Type', 'application/json')
        .send({ username: user1.username, password: user1.password })
    tokenOne = login1.body.token
    const saveBlogs = helper.initialBlogs
        .map(blog => ({ ...blog, user: user1.id }))
    for (const blog of saveBlogs) {
        await api.post('/api/blogs')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send(blog)
    }
})
let tokenOne = 'jtn'
let token = 'jtn2'
describe('when there is initially some blogs saved', () => {
    describe('get blogs', () => {
        test('all blogs, check that type is application/json', async () => {
            await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        },100000)

        test('there are two blogs', async () => {
            const response = await api.get('/api/blogs')

            expect(response.body).toHaveLength(2)
        })
        test('all blogs are returned', async () => {
            const response = await api.get('/api/blogs')

            expect(response.body).toHaveLength(helper.initialBlogs.length)
        })

        test('all blogs id field exists', async () => {
            const response = await api.get('/api/blogs')
            expect(response.body[0].id).toBeDefined()
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
        test('verify saved in database', async () => {
            const newBlog = {
                title: '3Go To Statement Considered Harmful',
                author: '3Edsger W. Dijkstra',
                url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
                likes: 3,
            }
            const result = await api.post('/api/blogs')
                .set('Authorization', `Bearer ${tokenOne}`)
                .send(newBlog)
            expect(result.status).toBe(201)
            const response = await api.get('/api/blogs')
            expect(response.body).toHaveLength(3)
        })
        test('a valid blog can be added', async () => {
            const newBlog = {
                title: '3Go To Statement Considered Harmful',
                author: '3Edsger W. Dijkstra',
                url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
                likes: 3,
            }
            const result = await api.post('/api/blogs')
                .set('Authorization', `Bearer ${tokenOne}`)
                .send(newBlog)
            expect(result.status).toBe(201)
        })

        test('the likes are 0 if not spesified', async () => {
            const newBlog = {
                title: '3Go To Statement Considered Harmful',
                author: '3Edsger W. Dijkstra',
                url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',

            }
            const postedBlog = await api.post('/api/blogs')
                .set('Authorization', `Bearer ${tokenOne}`)
                .send(newBlog)

            expect(postedBlog.status).toBe(201)

            const response = await api.get('/api/blogs')
            expect(response.body[2].likes).toBe(0)
        })

        test('blog without title is not added', async () => {
            const newBlog = {
                title:'',
                author: '3Edsger W. Dijkstra',
                url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            }

            const blogsAtEnd = await helper.blogsInDb()

            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

        })
        test('blog without url is not added', async () => {
            const newBlog = {
                title:'jtn',
                author: '3Edsger W. Dijkstra',
                url:'',
            }

            const blogsAtEnd = await helper.blogsInDb()

            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

        })

        test('needs token', async () => {
            const newBlog = {
                title: '3Go To Statement Considered Harmful',
                author: '3Edsger W. Dijkstra',
                url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',

            }
            const postedBlog = await api.post('/api/blogs')
                .send(newBlog)

            expect(postedBlog.status).toBe(401)
            const response = await api.get('/api/blogs')
            expect(response.body).toHaveLength(2)
        })

        test('with invalid token fails', async () => {
            const newBlog = {
                title: '3Go To Statement Considered Harmful',
                author: '3Edsger W. Dijkstra',
                url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',

            }
            const postedBlog = await api.post('/api/blogs')
                .set('Authorization', `Bearer ${tokenOne}123`)
                .send(newBlog)

            expect(postedBlog.status).toBe(401)
            const response = await api.get('/api/blogs')
            expect(response.body).toHaveLength(2)
        })
    })

    describe('delete', () => {

        test('based on blog id', async () => {
            const response = await api.get('/api/blogs')
            expect(response.body).toHaveLength(2)
            const firstBlog = response.body[0]

            const deleted = await api.delete(`/api/blogs/${firstBlog.id}`)
                .set('Authorization', `Bearer ${tokenOne}`)
            expect(deleted.status).toBe(204)

            const remainingBlogs = await api.get('/api/blogs')
            expect(remainingBlogs.body).toHaveLength(1)

        })

        test('cant delete someone elses blog', async () => {
            const response = await api.get('/api/blogs')
            expect(response.body).toHaveLength(2)
            const firstBlog = response.body[0]

            const deleted = await api.delete(`/api/blogs/${firstBlog.id}`)
                .set('Authorization', `Bearer ${token}`)
            expect(deleted.status).toBe(401)
            const remainingBlogs = await api.get('/api/blogs')
            expect(remainingBlogs.body).toHaveLength(2)

        })
    })

    describe('modify', () => {

        test('updates the blog likes', async () => {
            const blog = await Blog.findOne({ title: 'Go To Statement Considered Harmful' })

            blog.likes = 200
            await api
                .put(`/api/blogs/${blog.id}`)
                .send(blog)
            expect(blog.likes).toBe(200)
        })


        test('cant update to a empty title', async () => {
            const response = await api.get('/api/blogs')
            const secondBlog = response.body[1]

            const newBlog = {
                title: '',
                author: '3Edsger W. Dijkstra',
                url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',

            }

            const returnedBlog = await api.put(`/api/blogs/${secondBlog.id}`).send(newBlog)
            expect(returnedBlog.status).toBe(401)
            const getSecond = await api.get(`/api/blogs/${secondBlog.id}`)
            expect(getSecond.body.title).not.toBe('')
        })

        test('cant update to a empty url', async () => {
            const response = await api.get('/api/blogs')
            const secondBlog = response.body[1]

            const newBlog = {
                title: '3Go To Statement Considered Harmful',
                author: '3Edsger W. Dijkstra',
                url: '',

            }

            const returnedBlog = await api.put(`/api/blogs/${secondBlog.id}`).send(newBlog)
            expect(returnedBlog.status).toBe(401)
            const getSecond = await api.get(`/api/blogs/${secondBlog.id}`)
            expect(getSecond.body.url).not.toBe('')
        })
    })

})

afterAll(() => {
    mongoose.connection.close()
})