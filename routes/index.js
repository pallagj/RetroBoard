var express = require('express');
var router = express.Router();


const Schema = require('mongoose').Schema

const mongoose = require('mongoose')

mongoose.connect(process.env.mongoUrl, {useNewUrlParser: true}).then(r =>{})

module.exports = mongoose

const Data = mongoose.model('Data', {data: [
    [[String],[String],[String]],
    [[String],[String],[String]],
    [[String],[String],[String]]
]})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




router.get('/list', function(req, res, next) {
    Data.findOne({}, (err, dataModel) => {
        if(dataModel === null) {
            dataModel = new Data();
            dataModel.data =  [
                [[],[],[]],
                [[],[],[]],
                [[],[],[]]
            ];
            dataModel.save(err=>{});
        }
        res.json(dataModel.data);
    });
});

clients = [];
router.get('/event', function(req, res) {
    res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
    });
    res.flushHeaders();

    // Tell the client to retry every 10 seconds if connectivity is lost
    res.write('retry: 10000\n\n');

    const clientId = Date.now();

    const newClient = {
      id: clientId,
      response: res
    };
    
    clients.push(newClient);

    req.on('close', () => {
      clients = clients.filter(client => client.id !== clientId);
      console.log(`${new Date().toLocaleString('en-US')} - connection closed, active clients: ${clients.length}`);
    });
    
    console.log(`${new Date().toLocaleString('en-US')} - client signed up to the event, active clients: ${clients.length}`);
});

router.put('/add', function(req, res, next) {
    Data.findOne({}, (err, dataModel) => {
        if(dataModel === null) {
            dataModel = new Data();
            dataModel.data =  [
                [[],[],[]],
                [[],[],[]],
                [[],[],[]]
            ];
        } 
        
        let newData  = req.body;
        dataModel.data[newData.team][newData.column].push(newData.text);
        
        clients.forEach(client => {
            client.response.write(`data: ${JSON.stringify(dataModel.data)}\n\n`)
        })
        
        res.sendStatus(200);
        
        dataModel.markModified('data');
        dataModel.save(err=>{
            if(err) {
              console.log(`${new Date().toLocaleString('en-US')} - save model error - ${err}`);
            }
        });
        
        console.log(`${new Date().toLocaleString('en-US')} - note added, active clients: ${clients.length}`);
    });
});




module.exports = router;
