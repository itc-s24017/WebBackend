import http from 'node:http'
import pug from 'pug'
import url from 'node:url'
import fs from 'node:fs/promises'
import qs from 'node:querystring'

const index_template = pug.compileFile('./index.pug')
const other_template = pug.compileFile('./other.pug')
const style_css = await fs.readFile('./style.css', 'utf8')

const server = http.createServer(getFromClient)

server.listen(3210)
console.log('Server start!')

const data = [
    {id: 1, name: 'Taro', number: '09-999-999'},
    {id: 2, name: 'Hanako', number: '080-888-888'},
    {id: 3, name: 'Sachiko', number: '070-777-777'},
    {id: 4, name: 'Jiro', number: '060-666-666'},
]

// ここまでメインプログラム==========

// createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url_parts = new url.URL(req.url || '', 'http://localhost:3210')

    switch (url_parts.pathname) {
        case '/': {
            await response_index(req, res)
            break
        }
        case '/other': {
            await response_other(req, res)
            break
        }

        default:
            // 想定していないパスへのアクセスが来たときの処理
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.end('no page...')
            break
    }
}

async function response_index(req: http.IncomingMessage, res: http.ServerResponse) {
    const msg = 'これはIndexページです。'
    const content = index_template({
        title: 'Index',
        content: msg,
        data
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    res.write(content)
    res.end()
}

async function response_other(req: http.IncomingMessage, res: http.ServerResponse) {
    let msg = 'これはOtherページです。'

    if (req.method === 'POST') {
        const post_data = await (new Promise<qs.ParsedUrlQuery>((resolve, reject) => {
            let body = ''
            req.on('data', (chunk) => {
                body += chunk
            })
            req.on('end', () => {
                try {
                    resolve(qs.parse(body))
                } catch (e) {
                    console.error(e)
                    reject(e)
                }
            })
        }))
        msg += `あなたは「${post_data.msg}」とかきました`
        const content = other_template({
            title: 'Other',
            content: msg,
        })
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(content)
        res.end()
    } else {
        // POST 以外のアクセス
        const content = other_template({
            title: 'Other',
            content: 'ページがありません'
        })
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(content)
        res.end()
    }
}