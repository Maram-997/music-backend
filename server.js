'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv')
const axios = require('axios')

const app = express();
app.use(cors());
require('dotenv').config();
app.use(express.json());
const Drinks = require('./drinks.json')
const PORT = process.env.PORT ;
const mongoose = require('mongoose');
mongoose.connect(`${process.env.MONGODB}`, { useNewUrlParser: true, useUnifiedTopology: true });

const drinksSchema = new mongoose.Schema({
    strDrink: String,
    strDrinkThumb: String,
    idDrink: String
});
const UserSchema = new mongoose.Schema({
    email: String,
    drinks: [drinksSchema]
});
const UserModel = mongoose.model("Drinks", UserSchema)

function seedTheCollection() {

    let maram = new UserModel({
        email: 'maramabumurad97@gmail.com',
        drinks: [
            {
                strDrink: "Sweet Bananas",
                strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/sxpcj71487603345.jpg",
                idDrink: "12724"
            }
        ]
    })
    maram.save()
}

// seedTheCollection();
// API-Data

class DrinksClass { 
    constructor(strDrink, strDrinkThumb,idDrink){
    this.strDrink= strDrink;
    this.strDrinkThumb = strDrinkThumb;
    this.idDrink =idDrink
}
}
app.get('/drinks', async (req, res) => {
    let url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic'
    let reuslt = await axios.get(url)
    let items = reuslt.data.drinks.map(element => {
        return  new DrinksClass(element.strDrink, element.strDrinkThumb, element.idDrink )
   })
 //  console.log(result.data.drinks);
 //  --------------------------
    res.send(items)
    // res.send(Drinks.drinks)


})

app.get('/favouites', (req, res) => {

    let email = req.query.email
    UserModel.find({ email: email }, (error, drinkArr) => {
        if (error) {
            res.send(error)
        } else {
            res.send(drinkArr[0].drinks)
        }
    })

})

app.post('/addtofavourite', (req, res) => {
    let { email, strDrink, strDrinkThumb, idDrink } = req.body
    UserModel.find({ email: email }, (error, drinkData) => {
        if (error) {
            res.send(error)
        } else {
            drinkData[0].drinks.push({
                email: email,
                strDrink: strDrink,
                strDrinkThumb: strDrinkThumb,
                idDrink: idDrink
            })
            drinkData[0].save()
        }
    })
})

app.delete('/deletedDrink/:drinkIdx', (req, res) => {
    let email = req.query.email
    let index = Number(req.params.drinkIdx)
    UserModel.find({ email: email }, (error, drinkData) => {
        if (error) {
            res.send(error)
        } else {
            let filteredArr = drinkData[0].drinks.filter((element, idx) => {
                if (idx !== index) {
                    return element
                }
            })
            drinkData[0].drinks = filteredArr
            drinkData[0].save()
            res.send(drinkData[0].drinks)
        }
    })
})
app.put('/updatedrink/:drinkIdx', (req, res) => {
    let email = req.query.email
    let index = Number(req.params.drinkIdx)
    
    console.log(email ,'---', index)
    const {strDrinkThumb, strDrink , idDrink } = req.body
    UserModel.find({ email: email }, (error, Data) => {
        if (error) {
            res.send(error)
        } else {
            Data[0].drinks.splice(index, 1, {
                strDrinkThumb: strDrinkThumb,
                strDrink: strDrink,
                idDrink:idDrink
            })
            Data[0].save();
            res.send(Data[0].drinks)
        }
    })
})

app.put



app.get('/', (req,res)=>{
    res.send('All Good')
})

app.listen(`${process.env.PORT}`, () => console.log(`listening on ${process.env.PORT}`));