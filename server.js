let express = require('express')
let { MongoClient, ObjectId } = require("mongodb")
const { Script } = require('vm')
let sanitizeHTML = require('sanitize-html')
let app = express()
let db

 app.use(express.static('public'))
async function go() {
  let client = new MongoClient("mongodb+srv://practiseme80:12345@cluster0.av4xg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  client.connect()
  db = client.db()
  app.listen(3000)
}

go()
app.use(express.json())
 app.use(express.urlencoded({extended:false}))
 
 
 function passwordProtected(req,res,next){
  res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"')
  
  if(req.headers.authorization == "Basic bXVraToxMjM0") {
    next()
    
  }else{
    res.status(401).send("Authentication required")
  }
 }

app.use(passwordProtected)
app.get('/' ,async function(req,res){
  //These line for find items which are save in the database and show in the browser
 const items = await db.collection("items").find().toArray()
 
    res.send( 
`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form  id="create-form" action="/create-item" method="POST">
        <div class="d-flex align-items-center">
          <input  id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id="item-list" class="list-group pb-5">
    
         </ul>
    
  </div>
  <script> let items = ${JSON.stringify(items)}
  </script>
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.7/dist/axios.min.js"></script>
  <Script src ="browser.js"></Script>
</body>
</html>`


)
 
})

//These line for create item

app.post("/create-item", async function (req, res) {
  let safeText = sanitizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {}})
  const info =await db.collection("items").insertOne({ text: safeText })
  res.json({_id:info.insertedId, text:safeText})
})

app.post("/update-item", async function(req,res){
  let safeText = sanitizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {}})
  await db.collection("items").findOneAndUpdate({_id: new ObjectId(req.body.id) },{ $set:{text:safeText}})
    res.send("success")

})
 
  app.post("/delete-item", async function(req,res){
    await db.collection("items").deleteOne({_id: new ObjectId(req.body.id)})
    res.send("success")

  })