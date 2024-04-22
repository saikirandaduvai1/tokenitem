const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'twitterClone.db')
let db = null
const initializationDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('coding runing at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`error at ${e.massege}`)
    process.exit(1)
  }
}
initializationDBAndServer()

const authentication = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.username = payload.username
        request.user_id = payload.user_id
        next()
      }
    })
  }
}

//API 1
app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body
  const hashedpassword = await bcrypt.hash(request.body.password, 10)
  const usernameQuery = `SELECT * FROM user WHERE username = '${username}'; `
  const useridentity = await db.get(usernameQuery)
  if (useridentity !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else if (password.length < 6) {
    response.status(400)
    response.send('Password is too short')
  } else {
    const postuserQuery = `
        INSERT INTO
        user (name, username, password, gender)
        VALUES
        ('${name}','${username}','${hashedpassword}','${gender}');
        `
    await db.run(postuserQuery)
    response.send('User created successfully')
  }
})
//API 2
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const userQuery = `SELECT * FROM user WHERE username='${username}';`
  const useridentity = await db.get(userQuery)
  if (useridentity === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const ispasswordMatched = await bcrypt.compare(
      password,
      useridentity.password,
    )
    if (ispasswordMatched === true) {
      const payload = {
        username: username,
      }
      const jwtToken = jwt.sign(useridentity, 'MY_SECRET_TOKEN')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})
// API 3
app.get('/user/tweets/feed/', authentication, async (request, response) => {
  const {user_id} = request
  const {username} = request
  console.log(user_id)
  console.log(username)
})
//API 4
app.get('/user/following/', authentication, async (request, response) => {
  const {user_id} = request
  const {username} = request
  console.log(user_id)
  console.log(username)
})
//API 5
app.get('/user/followers/', authentication, async (request, response) => {
  const {user_id} = request
  const {username} = request
  console.log(user_id)
  console.log(username)
})
//API 6
app.get('/tweets/:tweetId/', authentication, async (request, response) => {
  const {user_id} = request
  const {username} = request
  console.log(user_id)
  console.log(username)
})
//API 7
app.get(
  '/tweets/:tweetId/likes/',
  authentication,
  async (request, response) => {
    const {user_id} = request
    const {username} = request
    console.log(user_id)
    console.log(username)
  },
)
//API 8
app.get(
  '/tweets/:tweetId/replies/',
  authentication,
  async (request, response) => {
    const {user_id} = request
    const {username} = request
    console.log(user_id)
    console.log(username)
  },
)
app.get('/user/tweets/', authentication, async (request, response) => {
  const {user_id} = request
  const {username} = request
  console.log(user_id)
  console.log(username)
})

//API 10
app.post('/user/tweets/', authentication, async (request, response) => {
  const {tweet} = request.body
  const {user_id} = request
  const tweetQuery = `
  INSERT INTO 
  tweet (tweet, user_id)
  VALUES
  ('${tweet},${user_id});
  `
  await db.run(tweetQuery)
  console.log(user_id)
  response.send('Created a Tweet')
})

//API 11
app.delete('/tweets/:tweetId/', authentication, async (request, response) => {
  const {tweetId} = request.params
  const {user_id} = request
  const tweetQuery = `
  SELECT * 
  FROM tweet
  WHERE 
  tweet_id = ${tweetId}
  AND user_id= ${user_id};
  `
  const tweethave = db.get(tweetQuery)
  if (tweethave === undefined) {
    response.status(401)
    response.send('Invalid Request')
  } else {
    const deletetweet = `
    DELETE FROM tweet
    WHERE 
    tweet_id = ${tweetId};
    `
    await db.run(deletetweet)
    response.send('Tweet Removed')
  }
})

module.exports = app
