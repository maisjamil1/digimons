'use strict'
require('dotenv').config();
const express=require('express');
const pg=require('pg');
const superagent=require('superagent');
const methodOverride=require('method-override');

const PORT =process.env.PORT||3030;
const app =express();
const client= new pg.Client(process.env.DATABASE_URL);

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.set('view engin','ejs');

app.get('/hi',test)
function test(req,res){
    res.status(200).send('hiiiiiiiiiiii')
}

app.get('/hi',test)
function test(req,res){
    res.status(200).send('hiiiiiiiiiiii')
}









app.use('*',notFoundHandler)

function errorHandler(err,req,res){
    res.status(500).send(err)
}
function notFoundHandler(req,res){
    res.status(404).send('page NOT found')
}


client.connect().then(()=>{
    app.listen(PORT,()=>console.log('up on',PORT))
})


