import cors from 'cors'
import express from 'express'

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', message: 'Portfolio API is running' })
})

app.listen(port, () => {
  console.log(`Portfolio API ready at http://localhost:${port}`)
})
