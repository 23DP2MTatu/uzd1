const fs = require('fs')
const http = require('http');
const { console } = require('inspector');
const PORT = 3000;
const HOST = 'localhost'
const path = require('path')

function parseFile(filePath) {
    
    let content = fs.readFileSync(filePath, 'utf-8')
    let parts = content.split('---')
    let metadata = {};
    let htmlContent = parts[2].trim()

    parts[1].trim().split('\n').forEach(line => {
        
        let [key, ...value] = line.split(':')
        let parsedValue = value.join(':').trim()
        
        if (key.trim() === 'tags') {
            metadata[key.trim()] = parsedValue.split(',').map(tag => tag.trim())
        } else {
            metadata[key.trim()] = parsedValue
        }
    })
    
    return { metadata, htmlContent}
}

function createTempPage(content, meta, fileName) {
    
    let tempFilePath = path.join("localTemp", fileName)

    pageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title}</title>
</head>
<body>
    ${content}
</body>
</html>
    ` 

    fs.writeFileSync(tempFilePath, pageContent)
}

const server = http.createServer((req, res) => {

    const files = fs.readdirSync("./content-pages")
    const fileNames = files.filter(file => path.extname(file) === '.html' || path.extname(file) === '.txt')

    fileNames.forEach(element => {
        let parsePage = parseFile(`content-pages/${element}`)
        createTempPage(parsePage.htmlContent, parsePage.metadata, element)
    });

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    
    let stream = fs.createReadStream('index.html')

    stream.pipe(res).on('finish', () => {
    })
})

server.listen(PORT, HOST, () => {
    console.log(`Server started: http://${HOST}:${PORT}`)
})