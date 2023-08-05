const express =  require('express');
const app = express();
const bodyparser = require('body-parser');
const exhbs = require('express-handlebars');
const dbo = require('./db');
const ObjectID = dbo.ObjectID;

app.engine('hbs', exhbs.engine({layoutsDir:'views/', defaultLayout:"main", extname:"hbs"}))
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(bodyparser.urlencoded({extended:true}));
app.use('/views', express.static('views')); // for tailwind css

app.get('/', async (req, res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('items');
    const cursor = collection.find({});
    let items = await cursor.toArray();

    let message = '';
    let edit_id, edit_item;

    if(req.query.edit_id){
        edit_id = req.query.edit_id;
        edit_item = await collection.findOne({_id:new ObjectID(edit_id)})
    }

    if(req.query.delete_id){
        delete_id = req.query.delete_id;
        await collection.deleteOne({_id:new ObjectID(delete_id)})
        return res.redirect('/?status=3');
    }
    
    switch (req.query.status) {
        case '1':
            message = 'Inserted Successfully!';
            break;
        
        case '2':
            message = 'Updated Successfully!';
            break;
    
        case '3':
            message = 'Deleted Successfully!';
            break;
    
        default:
            break;
    }
    res.render('main',{message, items, edit_id, edit_item})
})

app.post('/store_item', async(req, res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('items');
    let item = { title : req.body.title, description : req.body.description};
    await collection.insertOne(item);
    return res.redirect('/?status=1');
})

app.post('/update_item/:edit_id', async(req, res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('items');
    let item = { title : req.body.title, description : req.body.description};
    let edit_id = req.params.edit_id;

    await collection.updateOne({_id:new ObjectID(edit_id)}, {$set:item});
    return res.redirect('/?status=2');
})

app.listen(8000, ()=>{
    console.log("Listening to 8000 port");
})
