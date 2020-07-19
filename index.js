const PORT = process.env.DailyBark || 8080

const cors = require('cors')
const cookie = require('cookie-parser')
const path = require('path').resolve()
const express = require('express')
const { existsSync: exist, readFileSync: read, writeFileSync: write, unlinkSync: del } = require('fs')

const app = express()
const keypath = path + '/keyword.lock'
const keylist = require('./keylist.json')

let keyword
genKeyword()

app.use(cors())
app.use(cookie())

app.get('/', (req, res) => {

})

app.get('/api/keyword', (_, res) => res.send(keyword))
app.use('/src', express.static(path + '/src/'))
app.listen(PORT, () =>
  console.log('DailyBark is now on http://localhost:' + PORT))

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
  if (date.getHours() + date.getMinutes() + date.getSeconds() === 0) regenKeyword()
}, 1000)
