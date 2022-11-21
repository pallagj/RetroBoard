var express = require('express');
var router = express.Router();

let list = [
    [[],[],[]],
    [[],[],[]],
    [[],[],[]]
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/list', function(req, res, next) {
  res.json(list);
});

activeResponses = [];
router.get('/event', function(req, res) {
    console.log('Got /events');
    res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
    });
    res.flushHeaders();

    // Tell the client to retry every 10 seconds if connectivity is lost
    res.write('retry: 10000\n\n');

    activeResponses.push(res);
});

router.put('/add', function(req, res, next) {
    let newData  = req.body;
    console.log(newData);
    list[newData.team][newData.column].push(newData.text);
    activeResponses.forEach(response => {
        response.write(`data: ${JSON.stringify(list)}\n\n`)
    })
    res.sendStatus(200);
});




module.exports = router;
