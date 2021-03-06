const https = require('https')
const qs = require('querystring')
const moment = require('./moment.min.js')

const querys = process.argv.slice(2).join(' ')
const querys_encode = qs.stringify({ q: querys })
const perPage = 20
const option = {
  host: 'api.github.com',
  path: '/search/repositories?per_page=' + perPage + '&' + querys_encode,
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
        data.items.forEach(i => {
          let { id, full_name, description = 'noDesc', html_url, pushed_at, stargazers_count, language, license } = i
          let item = {
            uid: id,
            title: full_name + '  ⭐ ' + stargazers_count,
            subtitle: description || 'noDesc',
            arg: html_url,
            mods: {
              shift: {
                subtitle:
                  'updated ' +
                  moment(pushed_at).fromNow() +
                  '  •  ' +
                  (language || '') +
                  '  •  ' +
                  ((license && license.spdx_id) || ''),
              },
              cmd: {
                arg: 'https://github.com/search?' + querys_encode,
                subtitle: "Search Github for '" + querys + "'",
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
                  title: "Search Github for '" + querys + "'",
                  subtitle: 'No Suggestions',
                  arg: 'https://github.com/search?' + querys_encode,
                },
              ],
            })
          )
        else console.log(stringify({ items }))
      }
    })
  })
  req.setHeader('User-Agent', 'Xiongqi-XQ')
  req.end()
}
