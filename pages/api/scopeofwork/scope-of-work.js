import { connectToDatabase } from '../../../lib/mongodb'
const ObjectId = require('mongodb').ObjectId

export default async function handler(req, res) {
  // switch the methods
  switch (req.method) {
    case 'GET': {
      return getPosts(req, res)
    }
    case 'POST': {
      return addPost(req, res)
    }
    case 'PUT': {
      return updatePost(req, res)
    }
    case 'DELETE': {
      return deletePost(req, res)
    }
  }
}

async function addPost(req, res) {
  try {
    // connect to the database
    let { db } = await connectToDatabase()
    // add the post
    await db.collection('scope-of-work').insertOne(req.body)
    // return a message
    return res.json({
      message: 'Post added successfully',
      success: true,
    })
  } catch (error) {
    // return an error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}

async function updatePost(req, res) {
  try {
    // connect to the database
    let { db } = await connectToDatabase()
    var query = { projectID: req.body.projectID }
    const options = { upsert: true }
    const updatePost = {
      $set: { content: req.body.content },
    }
    // update the published status of the post
    await db.collection('scope-of-work').updateOne(query, updatePost, options)

    // return a message
    return res.json({
      message: 'Post updated successfully',
      success: true,
    })
  } catch (error) {
    // return an error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}

async function getPosts(req, res) {
  try {
    let { db } = await connectToDatabase()
    // fetch the posts
    let posts = await db
      .collection('scope-of-work')
      .find({ projectID: req.query.id })
      .sort({ published: -1 })
      .toArray()
    // return the posts
    console.log(posts)
    return res.json({
      message: JSON.parse(JSON.stringify(posts)),
      success: true,
    })
  } catch (error) {
    // return the error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}
