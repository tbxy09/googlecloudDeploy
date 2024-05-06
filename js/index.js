// generate a cloud function to deploy
const functions = require('@google-cloud/functions-framework');
const {AIPService} = require('./api_service.js')
const {handler} = require('./claude_api.js')
// return a hello world 
functions.http('codebot', (req, res) => {
  console.log(req.body.bot)
  console.log(req.body.text)
  if(req.body.bot == "claude"){
    handler(req.body.text).then((ret) => {
      // return res.send(ret)
      res.json(ret)
    })
  } else if(req.body.bot){
    AIPService.callPredict(req.body.text).then((ret) => {
      res.json(ret)
    })
  } else{
    res.status(500).send('request params error')
  }
});

// generate test data to test the api
// {
//   'bot': 'claude',
//   'text': 'hello',
// }