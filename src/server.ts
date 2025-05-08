import { app } from "./app";

app.listen({
  port: 3333,
  host: "0.0.0.0"
}).then(url => {
  console.log(`server is running at: ${url}`)
})