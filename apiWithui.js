const express = require('express');
const app = express();
const {MongoClient} = require('mongodb');
const Mongo = require('mongodb');
const url = "";
const client = new MongoClient(url);

app.use(express.static(__dirname + '/public'))
app.set('views','./src/views');
app.set('view engine','ejs')

async function main(){
    await client.connect()
}



const collection = client.db('internfeb').collection('dashboard');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 7710;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/health',(req,res) => {
    res.status(200).send('Health Ok')
})

app.get('/new',(req,res) => {
    res.render('forms')
})

app.get('/',async(req,res) => {
    const output = [];
    const cursor = collection.find();
    for await(const data of cursor){
        output.push(data)
    }
    cursor.closed;
    res.render('index',{data:output})
})

app.get('/users',async(req,res) => {
    const output = [];
    let query = {};
    if(req.query.role && req.query.city){
        query = {
            role :req.query.role,
            city :req.query.city,
            isActive:true
        }
    }
    else if(req.query.role){
        query = {
            role :req.query.role,
            isActive:true
        }
    }
    else if(req.query.city){
        query = {
            city :req.query.city,
            isActive:true
        }
    }else if(req.query.isActive){
        let isActive = req.query.isActive;
        if(isActive == "false"){
            isActive = false
        }else{
            isActive = true
        }
        query = {isActive}
    }else{
        query={isActive:true}
    }
    const cursor = collection.find(query);
    for await(const data of cursor){
        output.push(data)
    }
    cursor.closed;
    res.send(output)
})


app.get('/user/:id',async(req,res)=>{
    const output = [];
    let query = {_id:new Mongo.ObjectId(req.params.id)};
    const cursor = collection.find(query);
    for await(const data of cursor){
        output.push(data)
    }
    cursor.closed;
    res.send(output)
})

//update user
app.put('/updateUser',async(req,res) => {
    await collection.updateOne(
        {_id: new Mongo.ObjectId(req.body._id)},
        {
            $set:{
                name:req.body.name,
                city:req.body.city,
                phone:req.body.phone,
                role:req.body.role,
                isActive:true
            }
        }
    )

    res.send('Recored Updated')
})

// hard delete
app.delete('/deleteUser',async(req,res) => {
    await collection.deleteOne({
        _id:new Mongo.ObjectId(req.body._id)
    })
    res.send('Recored Delete')
})

//Deactivate user
app.put('/deactivateUser',async(req,res) => {
    await collection.updateOne(
        {_id: new Mongo.ObjectId(req.body._id)},
        {
            $set:{
                isActive:false
            }
        }
    )

    res.send('User Deactivated')
})


//Activate user
app.put('/activateUser',async(req,res) => {
    await collection.updateOne(
        {_id: new Mongo.ObjectId(req.body._id)},
        {
            $set:{
                isActive:true
            }
        }
    )

    res.send('User Activated')
})


//adduser
app.post('/addUser',async(req,res) => {
    let data = {
        name:req.body.name,
        city:req.body.city,
        phone:req.body.phone,
        role:req.body.role?req.body.role:'User',
        isActive:true
    }
    await collection.insertOne(data);
    res.send('Data Added')
})



app.listen(port,() => {
    main()
    console.log(`Running on port ${port}`)
})