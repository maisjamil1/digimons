'use strict'
//ما اعمل فراغات خصوصات لما اكتب الاكتنشن 
//بتسمية الداتا بيس اتجنب الاحرف الكابيتال
//لما اعمل رندر احط لصفحة  امتدادها .ejs عشان اتجنب الاايرورز
//ماانسى rowsلاي شي جاي من الداتا بيس 
//انتبه لاني ما انسى السيمي كولن باي امر سيكوال
// ما انسى const let
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

const PORT = process.env.PORT || 3030;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engin', 'ejs');

//(routs)_______________________________________________________

app.get('/', useSuperagent)
app.post('/addToDb', addTo)
app.get('/showFav', renderFav)
app.get('/showOne/:digi_id', showOneDigimon)
app.put('/updateOne/:digi_id', updateDigimon)
app.delete('/deleteOne/:digi_id', deleteDigimon)

/*اذا طلعتللي مشكلة مثلا اني بكبس ع كبسه الحذف بس ما بصير اشي بتاكد من :
اولا:بتاكد من اكشن الفورم
ثانيا :بتاكد من تسكيرت الفورم انو تكون الكبسه جواتها 
ثالثا بتاكد من ميثود الراوت
*/




//(get data using superagent)____________________________________
function useSuperagent(req, res) {
    const url = 'https://digimon-api.herokuapp.com/api/digimon'; //``عادي بقبلهم برضو
    superagent.get(url).then((data) => {
        let digiArr = data.body.map((obj) => {//انتبه ل.body
            return new digiCONS(obj)
        })
        res.render('index.ejs', { data: digiArr })
    })
}
//(constructer)_________________________________________________

function digiCONS(digimon) {
    this.name = digimon.name || 'no name'
    this.level = digimon.level || 'no level'
    this.image = digimon.img || 'no image'
}
// //(addTO)_______________________________________________________

function addTo(req, res) {
    // const sqlChecking = "SELECT * FROM ydigimon WHERE name=$1;"
    const { name, image, level } = req.body;//req.body.name|req.body.level|req.body.image
    const sqlChecking = "SELECT * FROM ydigimon WHERE name=$1 AND image=$2 AND level=$3;"
    const VALUES = [name, image, level];
    const SQL = "INSERT INTO ydigimon (name, image, level) VALUES ($1, $2, $3);"

    client.query(sqlChecking, VALUES).then((Checking) => {
        if (Checking.rows.length === 0) {
            client.query(SQL, VALUES).then(results => {
                res.redirect('/showFav')
            });
        } else {
            res.redirect('/showFav')
        }
    })
        .catch((err) => {
            errorHandler(err, req, res);
        });
}
//(show Fav)___________________________________________________
function renderFav(req, res) {
    const sql = 'SELECT * FROM ydigimon;';
    client.query(sql)
        .then(result => {
            // console.log('2',result.rows);
            res.render('pages/favourite.ejs', { data: result.rows })
        })
        .catch((err) => {
            // console.log('err2');
            errorHandler(err, req, res);
        });
}
//(show One)___________________________________________________

function showOneDigimon(req, res) {
    const sql = 'SELECT * FROM ydigimon WHERE id=$1;';
    const value = [req.params.digi_id];//انتبه دايما ما انسى الاقواس لانو هيك نهائي ما رح تدخل الداتا ورح يطلع اريه فاضيه بالمتصفح 
    client.query(sql, value).then((results) => {
        // console.log(results.rows[0]);//اذا ما كنت حاطه اقواس الفاليو ..نهائي مما رح يطلع الكونسول ولا كنو موجود
        res.render('pages/details.ejs', { data: results.rows[0] })
    })
        .catch((err) => {
            errorHandler(err, req, res);
        });
}

//(update One)___________________________________________________
function updateDigimon(req, res) {
    const { name, image, level } = req.body;
    const sql = ' UPDATE ydigimon SET name=$1,image=$2,level=$3 WHERE id=$4;';
    const values = [name, image, level, req.params.digi_id]
    client.query(sql, values).then((results) => {

        res.redirect(`/showOne/${req.params.digi_id}`)//مهمه

    })
        .catch((err) => {
            errorHandler(err, req, res);
        });

}
//(delete One)___________________________________________________
function deleteDigimon(req, res) {
    const sql = 'DELETE FROM ydigimon WHERE id=$1;';
    const values = [req.params.digi_id]
    client.query(sql, values).then((results) => {

        // res.redirect('pages/details.ejs')
        res.redirect('/showFav')
    })
        .catch((err) => {
            errorHandler(err, req, res);
        });

}

//(test)___________________________________________________
// app.get('/hi',test)
// function test(req,res){
//     res.status(200).send('mais')
// }

//(helper handlers)___________________________________________________
app.use('*', notFoundHandler)

function errorHandler(err, req, res) {
    res.status(500).send(err)
}
function notFoundHandler(req, res) {
    res.status(404).send('page NOT found')
}


client.on('error', (err) => console.log(err));//useless


client.connect().then(() => {
    app.listen(PORT, () => console.log('up on', PORT))
})


