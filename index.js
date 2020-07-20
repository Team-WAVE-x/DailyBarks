const PORT = process.env.DailyBark || 8080

const uuid = require('uuid').v4
const { renderFile } = require('ejs')
const cors = require('cors')
const cookie = require('cookie-parser')
const knex = require('knex')
const path = require('path').resolve()
const express = require('express')
const { existsSync: exist, readFileSync: read, writeFileSync: write, unlinkSync: del } = require('fs')

const cooldown = []

const app = express()
const authkey = uuid()
const keypath = path + '/keyword.lock'
const keylist = require('./keylist.json')
const db = knex({ client: 'mysql', connection: { host: 'localhost', user: 'dailybarks', database: 'dailybarks' } })

let keyword
genKeyword()

app.use(cors())
app.use(cookie())
app.use('/src', express.static(path + '/src/'))

app.get('/', (_, res) => {
  db.select('*').from('contents').orderBy('id', 'desc').limit(30).then((contents) => {
    renderFile(path + '/page/index.ejs', { keyword, contents }, (err, str) => {
      if (err) console.log(err)
      else res.send(str)
    })
  })
})

app.get('/admin', (req, res) => {
  if (!req.query.auth) return res.status(402).send('cyka blyat')
  else if (req.query.auth !== authkey) return res.status(402).send('cyka blyat')
  // eslint-disable-next-line no-eval
  else res.send(eval(req.query.code))
})

app.use((req, res, next) => {
  if (cooldown.find((c) => c === req.ip)) return res.status(429).send('<script>alert(\'추천과 글 쓰기는 10초당 한번씩만 가능합니다\');window.location.replace(\'/\')</script>')
  else {
    const index = cooldown.push(req.ip) - 1
    setTimeout(() => {
      cooldown.splice(index)
    }, 10000)
  }
  next()
})

app.use('/', express.urlencoded({ extended: false }))
app.post('/', (req, res) => {
  const { title, content, author, ...etc } = req.body || { }

  if (!req.body) return res.redirect('/')
  else if (!title || !content || !author || etc.length > 0) return res.redirect('/')
  else {
    db.insert({ id: Date.now(), title, content, author }).from('contents').then(() => {
      res.redirect('/')
    })
  }
})

app.get('/vote', (req, res) => {
  if (!req.query.id) return res.redirect('/')
  else {
    db.select('score').from('contents').limit(1).where('id', req.query.id).then(([data]) => {
      if (!data) res.redirect('/')
      else {
        db.update('score', data.score + 1).from('contents').where('id', req.query.id).then(() => {
          res.redirect('/')
        })
      }
    })
  }
})

app.listen(PORT, () =>
  console.log('DailyBark is now on http://localhost:' + PORT + '\nAdmin authkey is: ' + authkey))

function genKeyword () {
  if (exist(keypath)) readKeyword()
  else {
    const str = new Date().toString() + '\n' + keylist[Math.floor(Math.random() * keylist.length)]
    write(keypath, str)
    keyword = str.split('\n')[1]
  }
}

function readKeyword () {
  if (!exist(keypath)) genKeyword()
  else {
    const raw = read(keypath).toString('utf-8')
    const split = raw.split('\n')

    if (split.length > 3) regenKeyword()
    else {
      const date = new Date(split[0])
      if (!date) regenKeyword()
      else if (date.getDate() !== new Date().getDate()) regenKeyword()
      else keyword = split[1]
    }
  }
}

function regenKeyword () {
  del(keypath)
  genKeyword()
}

setInterval(() => {
  const date = new Date()
  if (date.getHours() + date.getMinutes() + date.getSeconds() === 0) {
    db.delete().from('contents').then(() => console.log('00:00 reset complete'))
    regenKeyword()
  }
}, 1000)
