
const lodash = require('lodash')

const dummy = (blogs) => {
    let one = blogs
    one = 1
    return one
    // ...
}
const totalLikes = (blogs) => {
    return blogs.reduce((sum, item) => {
        return sum + item.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((favorite, compare) => {
        return (favorite.likes > compare.likes) ? favorite : compare
    }, 0)
}

const mostBlogs = (blogs) => {
    let result = lodash(blogs)
        .countBy(blog => blog.author)
        .entries()
        .maxBy(pair => pair[1])
    return result ? { author: result[0], blogs: result[1] } : 0
}

const mostLikes = (blogs) => {
    const sumMostLikes = (sumLikes, blog) => sumLikes + blog.likes
    let result = lodash(blogs)
        .groupBy(blog => blog.author)
        .entries()
        .maxBy(pair => pair[1].reduce(sumMostLikes, 0))
    return result ? { author: result[0], likes: result[1].reduce(sumMostLikes, 0) } : 0
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}