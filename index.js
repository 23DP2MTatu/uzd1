const fs = require('fs')
const http = require('http')
const PORT = 3000;
const HOST = 'localhost'
const path = require('path')
const os = require('os')

function parseFile(filePath) {
    
    const content = fs.readFileSync(filePath, 'utf-8')
    const parts = content.split('---')

    const metadata = {};
    const htmlContent = parts[2].trim()

    parts[1].trim().split('\n').forEach(line => {
        
        const [key, ...value] = line.split(':')
        const parsedValue = value.join(':').trim()
        
        if (key.trim() === 'tags') {
            metadata[key.trim()] = parsedValue.split(',').map(tag => tag.trim());
        } else {
            metadata[key.trim()] = parsedValue;
        }
    })
    
    return { metadata, htmlContent }
}

function createTempPage(content) {
    
    const tempFileName = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.html`
    const tempFilePath = path.join(os.tmpdir(), tempFileName)

    fs.writeFileSync(tempFilePath, content)

    return {
        path: tempFilePath,
            cleanup: () => {
            try {
                fs.unlinkSync(tempFilePath)
                console.log(`File deleted: ${tempFilePath}`)
            } catch (err) {
                console.error(`Error deleting file: ${err.message}`)
            }
        }
    }
}

const server = http.createServer((req, res) => {

    const parsePage = parseFile('content-pages/2024-08-21-historical-church.html')
    const tempPage = createTempPage(parsePage.htmlContent)

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    
    const stream = fs.createReadStream(tempPage.path)

    stream.pipe(res).on('finish', () => {
        tempPage.cleanup()
    })
})

server.listen(PORT, HOST, () => {
    console.log(`Server started: http://${HOST}:${PORT}`)
})