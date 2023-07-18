const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//Mongodb connection
const uri = "mongodb+srv://admin-roshan:hwou0UeWZpvPqfh5@cluster0.axssz2m.mongodb.net";
mongoose.connect(uri + "/todolistDB",{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

  const itemSchema = new mongoose.Schema({
    name: String
  });
  
const Item = mongoose.model('Item',itemSchema);


//Default list items
const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Write something"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});


const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){

    Item.find({}, 'name')
      .then((foundItems) => {
        if(foundItems.length == 0){
          Item.insertMany(defaultItems).then((err)=>{
            if(err){
                console.log(err.message);
            }else{
                console.log("Default items successfully added!");
            }
         })
          res.redirect("/");
        }else{
          res.render("list", {listTitle: "Today", items: foundItems} );
        }
      })
      .catch((error) => {
        console.error('Error retrieving items:', error);
      });

    
});

app.get("/:listname",(req,res)=>{
    const listName = _.capitalize(req.params.listname);

    List.findOne({name: listName})
    .then((foundList)=>{
        if(!foundList){
          const list = new List({
            name: listName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + listName);
          
        }else{
          res.render("list", {listTitle: foundList.name, items: foundList.items});
        }
    });
    
    //res.render("list",{listTitle: "work list", items: workItems});
});


app.get("/about",(req,res)=>{
    res.render("about");
});

app.post("/",function(req,res){
    let listName = req.body.list;
    let itemName = req.body.item;

    const newItem = new Item({
      name: itemName
    });

    if(listName === "Today"){
      newItem.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName})
      .then((foundList)=>{
         foundList.items.push(newItem);
         foundList.save();
         res.redirect("/" + listName);
      });
    }
}); 

app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.item;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId)
  .then(() => {
    console.log("Item successfully removed!");
    res.redirect("/");
  })
  .catch((err) => {
    console.log(err);
    res.redirect("/");
  });

  }else{
     List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},{ useFindAndModify: false })
     .then((foundList)=>{
        if(foundList){
          console.log(listName, checkedItemId);
          res.redirect("/" + listName);
        }else{
          console.log("List not found!");
        }

     })
     .catch((error)=>{
      console.log(error);
     });
  }
  });

  
app.listen(3000,()=>{
    console.log("server started on port 3000");
});
