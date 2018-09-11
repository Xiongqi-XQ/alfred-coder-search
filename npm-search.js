const https = require('https')
const qs = require('querystring')
const moment = require('./moment.min.js')

const querys = process.argv.slice(2).join(' ')
const querys_encode = qs.stringify({ q: querys })
const option = {
  host: 'www.npmjs.com',
  path: '/search/suggestions?' + querys_encode,
}
const { parse, stringify } = JSON

if (querys) {
  const req = https.request(option, res => {
    let result = ''
    res.on('data', chunk => {
      result += chunk
    })
    res.on('end', () => {
      let data
      try {
        data = parse(result)
      } catch (error) {
        console.log(
          stringify({
            items: [
              {
                title: 'Sorry, Something Error',
                subtitle: error.message,
                icon: {
                  path: './error.png',
                },
              },
            ],
          })
        )
        return
      }
      if (data) {
        const items = []
        data.forEach(i => {
          let {
            name,
            description = 'noDesc',
            links: { npm },
            publisher: { username = 'noName' },
            date,
            version,
          } = i
          let item = {
            uid: name,
            title: name,
            subtitle: description + ' — v' + version,
            arg: npm,
            mods: {
              shift: {
                // arg: 'https://www.npmjs.com/search?q=' + querys,
                subtitle: ' ' + version + '  •  ' + moment(date).fromNow() + '  •  ' + username,
              },
              cmd: {
                arg: 'https://www.npmjs.com/search?' + querys_encode,
                subtitle: "Search NPM for '" + querys + "'",
              },
            },
          }
          items.push(item)
        })
        if (items.length === 0)
          console.log(
            stringify({
              items: [
                {
                  title: "Search NPM for '" + querys + "'",
                  subtitle: 'No Suggestions',
                  arg: 'https://www.npmjs.com/search?' + querys_encode,
                },
              ],
            })
          )
        else console.log(stringify({ items }))
      }
    })
  })
  req.end()
}
