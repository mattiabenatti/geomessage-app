const express = require('express')
var dbUtility = require("./json_insert.js")
const cors = require("cors")
const app = express()
const port = 3000
app.use(cors());
app.use(express.json());
dbUtility.connectPg();
app.get('/paths', (req, res1) => {
  //console.log(req);

  
  dbUtility.createAll();
  ret1=[];
  dbUtility.getAllPathGeo("walk",(err,resDb)=>{
    if(err){
      console.log(err.stack);
  }
  else {
      //console.log(res)
      for (let i=0; i<resDb.rows.length; i++){
          //console.log(resDb.rows[i].st_astext)

          ret1.push(resDb.rows[i].st_astext);
      }
      //console.log(ret);
      res1.send(ret1);
  }
  });
  //dbUtility.disconnectPg();
  
})
app.get('/geofences', (req2, res2) => {
  ret2=[];
  //console.log(req2);
  dbUtility.getAllGeofenceGeo("walk",(err,resDb2)=>{
    if(err){
      //console.log(err.stack);
  }
  else {
      //console.log(res)
      for (let i=0; i<resDb2.rows.length; i++){
          //console.log(resDb.rows[i].st_astext)

          ret2.push(resDb2.rows[i].st_astext);
      }
      //console.log(ret);
      res2.send(ret2);
  }
  });
})

app.get('/clusters', (req3, res3) => {
  ret3=[];
  //console.log(req3);
  dbUtility.getAllPathCluster("walk",(err3,resDb3)=>{
    if(err3){
      //console.log(err3.stack);
  }
  else {
      //console.log(res)
      for (let i=0; i<resDb3.rows.length; i++){
          //console.log(resDb3.rows[i])

          ret3.push(resDb3.rows[i].bbox);
      }
      //console.log(ret);
      res3.send(ret3);
  }
  });
})

app.get('/endpoints', (req4, res4) => {
  ret4=[];
  //console.log(req4);
  dbUtility.getAllPathEndPoint("walk",(err4,resDb4)=>{
    if(err4){
      //console.log(err4.stack);
  }
  else {
      //console.log(res)
      for (let i=0; i<resDb4.rows.length; i++){
          //console.log(resDb4.rows[i])

          ret4.push(resDb4.rows[i].geo);
      }
      //console.log(ret);
      res4.send(ret4);
  }
  });
})


app.post('/message',(req,res5)=>{
  ret5=[];
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  console.log(req.body);
  point = "POINT("+req.body.lat + " " + req.body.lon +")";
  console.log(point)
  dbUtility.getMessageFromGeofence(point,"walk",(err5,resDb5)=>{
    if(err5){
      console.log(err5.stack);
  }
  else {
      //console.log(res)
      //for (let i=0; i<resDb5.rows.length; i++){
        ret5= JSON.stringify(resDb5.rows[0]);
          console.log(ret5)

          //ret5.push(resDb5.rows[i].geo);
      //}
      console.log("RET");
      //console.log(ret);
      res5.send(ret5);
  }
  });
  
})

app.post('/path',(req,res6)=>{
  ret6=[];
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  console.log(req.body);
  activity = req.body.activity;
  activity="walk"
  console.log(activity);
  console.log(req.body.points)
  newDate= new Date();
  user= (Math.floor(Math.random()*10000)+1).toString();
  linestring = 'LINESTRING('
  for (let i=0;i<req.body.points.length;i++){
    linestring += req.body.points[i][0] + ' '+ req.body.points[i][1];
    if (i<((req.body.points.length)-1)){
      linestring+=", ";
    } 
  }
  linestring+= ')'
  
  console.log(linestring)
  dbUtility.insertDbPathFromString(activity, linestring, user, newDate)/*,(err6,resDb6)=>{
    if(err6){
      console.log(err6.stack);
  }
  else {
      //console.log(res)
      //for (let i=0; i<resDb5.rows.length; i++){
        ret6= JSON.stringify(resDb6.rows[6]);
          console.log(ret6)

          //ret5.push(resDb5.rows[i].geo);
      //}
      console.log("RET");
      //console.log(ret);
      res6.send(ret6);
  }
  });*/
  
})

/*app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})*/

app.use(express.static('https://geomessage-app.herokuapp.com:'+port+'/index.html'));     
app.set('port', (process.env.PORT || 3000)) // set port

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})