const {mongoose} = require('./db');
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema;
const events = require('events');
const eventEmitter = new events.EventEmitter();
const listener = eventEmitter


var itemSchema = new Schema({
    name: String,
    price:Number,
    bar_code: String,
    quantity: Number
});

const Item = mongoose.model('Item',itemSchema)
const create = async (req, res) => {
    const {name,price,bar_code,quantity} = req.body;
    try{
        const items = await Item.create({name, price, bar_code, quantity})
        console.log("Added Item",items)
        eventEmitter.emit('created',items)
        res.send(items)
    }catch(e){
        res.status(400).send(e.message)
    }
}

const buy = async (req, res) => {
    const items = req.body;
    for({bar_code,quantity} in items){
        const item = await Item.findOne({bar_code:item.bar_code})
        if(quantity){
            item.quantity -= quantity;
        }else {
            item.quantity--;
        }
        await item.save();
    }
    res.send("Done")
    eventEmitter.emit("pay")
}

const remove = async (req, res) => {
    try{
        const {bar_code} = req.params
        const result = await Item.remove({bar_code})
        res.send(result)
    }catch (e) {
        res.send(e.message)
    }

}


const getOne = async (req, res) => {
    console.log(req.params)
    try {
        const {bar_code} = req.params
        const item = await Item.findOne({bar_code})
        if(item){
            console.log("Item",item)
            res.send(item)
        }else{
            console.log("No Item")
            res.status(404).send("Item with bar code not found")
        }
    }catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
}

const get = async (req,res) => {
    try{
        const items = await Item.find()
        console.log(items)
        res.send(items)
    }catch (e) {
        res.status(500).send(e.message)
    }
}

const postSave = async (callback) => {
    console.log("Post Save",callback)

    itemSchema.post('save',(doc,next)=>{
        console.log("Post Save",callback)
    })
}

itemSchema.pre('save',(doc,next)=>{
    console.log("Post Save",doc)
    next()
})

module.exports = {create, buy, remove, get, getOne,postSave,listener,model:Item}