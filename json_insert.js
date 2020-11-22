var fs = require('fs');
const { Pool, Client } = require('pg')


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
    max:10,
    idleTimeoutMillis: 30000
});

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
    max:10,
    idleTimeoutMillis: 30000
});


function getValuesFromGeofenceFile(fileName){
    data = fs.readFileSync(__dirname + '/'+fileName);
    const json = data.toString();
    const obj = JSON.parse(json);
    feats=[]
    for (let i = 0; i < obj["features"].length; i++) {
        messageValue=obj["features"][i]["properties"]["message"].toString();
        geoValue=JSON.stringify(obj["features"][i]["geometry"]);
        feats.push({
            message:messageValue,
            geo:geoValue
        });
    }
    return feats;
}

function getValuesFromPathFile(fileName){
    data = fs.readFileSync(__dirname + '/'+fileName);
    const json = data.toString();
    const obj = JSON.parse(json);
    feats=[]
    for (let i = 0; i < obj["features"].length; i++) {
        geoValue=JSON.stringify(obj["features"][i]["geometry"]);
        feats.push({
            geo:geoValue
        });
    }
    return feats;
}

function createDbGeofence(activityName){
   
    tableName = "geofence_"+activityName;
    var commandCreate=`CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        geo geometry NOT NULL,
        UNIQUE(message,geo))`;
     //console.log("CREATEGEOFENCE")
     //console.log(commandCreate)

    ret = true;
   
        pool.query(commandCreate,(err,res)=>{
            if(err){
                console.log(err.stack);
                ret = false;
            }
        });
    
    return ret;
}

function createDbPath(activityName){
    tableName = "path_"+activityName;
    var commandCreate=`CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        date_time TIMESTAMP WITH TIME ZONE,
        geo geometry NOT NULL,
        UNIQUE(user_id, date_time, geo))`;
        //console.log("CREATEPATH")
        //console.log(commandCreate)
    ret = true;
    
        pool.query(commandCreate,(err,res)=>{
            if(err){
                console.log(err.stack);
                ret = false;
            }
        });
    
    return ret;
}

function insertDbGeofence(activityName, message, geo){
    resCreate = createDbGeofence(activityName);
    if (resCreate == false){
        return false;
    }
    tableName = "geofence_"+activityName;
    commandInsert = `INSERT INTO ${tableName} (message,geo) VALUES (
        '${message}',
        ST_GeomFromGeoJSON('${geo}')) ON CONFLICT (message,geo) DO NOTHING`;
    console.log("INSERTGEOFENCE")
    console.log(commandInsert)
    ret = true;
    
        pool.query(commandInsert,(err,res)=>{
            if(err){
                console.log(err.stack);
                ret = false;
            }
        });
    
    return ret;
}

function insertDbPath(activityName, geo, user_id_val="root",date_time_val="null"){
    resCreate = createDbPath(activityName);
    if (resCreate == false){
        return false;
    }
    tableName = "path_"+activityName;
    commandInsert = `INSERT INTO ${tableName} (user_id,date_time,geo) VALUES (
        '${user_id_val}', ${date_time_val}, ST_GeomFromGeoJSON('${geo}') ) ON CONFLICT (user_id,date_time,geo) DO NOTHING`;
        console.log("INSERTPATH")
        console.log(commandInsert)
    ret = true;
        
        pool.query(commandInsert,(err,res)=>{
            if(err){
                console.log(err.stack);
                ret = false;
            }
        });
        
    
    return ret;
}

function insertDbPathFromString(activityName, geo, user_id_val="user"){
    resCreate = createDbPath(activityName);
    if (resCreate == false){
        return false;
    }
    tableName = "path_"+activityName;
    commandInsert = `INSERT INTO ${tableName} (user_id,date_time,geo) VALUES (
        '${user_id_val}', to_timestamp(${Date.now()}/1000.0), ST_GeomFromText('${geo}', 4326) ) ON CONFLICT (user_id,date_time,geo) DO NOTHING`;
        console.log("INSERTPATH")
        console.log(commandInsert)
    ret = true;
        
        pool.query(commandInsert,(err,res)=>{
            if(err){
                console.log(err.stack);
                ret = false;
            }
        });
        
    
    return ret;
}

function getMessageFromGeofence(point,activity, callback) {
    ret = null;
    tableName= "geofence_"+activity;
    /*commandSelect =  `SELECT g.message, g.gdump FROM (
    SELECT message, ST_DumpPoints(geo) AS gdump FROM ${tableName} WHERE (
        ST_Contains(geo,ST_GeomFromText('${point}', 4326)))
        ) AS g`;*/
    commandSelect =  `
        SELECT message, ST_AsGeoJson(geo) :: json->'coordinates' AS coordinates FROM ${tableName} WHERE (
            ST_Contains(geo,ST_GeomFromText('${point}', 4326)))
            `;
    
        pool.query(commandSelect,(err,res)=>{
            /*if(err){
                console.log(err.stack);
            }
            else {
                ret = res[0];
            }*/
            callback(err,res);
        })
    
    //return ret;
}


function createAll(){
    createDbGeofence("walk");
    createDbPath("walk");
    featsGeofenceWalk = getValuesFromGeofenceFile("geofence_walk.geojson");
    featsPathWalk = getValuesFromPathFile("path_walk.geojson");
    for (let i=0;i<featsGeofenceWalk.length;i++){
        insertDbGeofence("walk",featsGeofenceWalk[i].message,featsGeofenceWalk[i].geo);
    }
    for (let j=0;j<featsPathWalk.length;j++){
        insertDbPath("walk",featsPathWalk[j].geo);
    }
}

function connectPg(){
    client.connect();
    pool.connect()
}

function disconnectPg(){
    client.end();
    pool.end();
}

function getAllGeofenceGeo(activity, callback){
    ret = [];
    tableName= "geofence_"+activity;
    commandSelect =  `SELECT ST_AsText(geo) FROM ${tableName}`;
    
    pool.query(commandSelect,(err,res)=>{
        callback(err,res);
    })
}

function getAllPathGeo(activity, callback){
    ret = [];
    tableName= "path_"+activity;
    commandSelect =  `SELECT ST_AsText(geo) FROM ${tableName}`;
    
    pool.query(commandSelect,(err,res)=>{
        /* if(err){
            console.log(err.stack);
        }
        else {
            //console.log(res)
            for (let i=0; i<res.rows.length; i++){
                //console.log(res.rows[i].st_asgeojson)
                ret.push(res.rows[i].st_asgeojson);
            }
             
        }*/
        callback(err,res);
    })

    /* pool.query(commandSelect)
        .then(res =>
        {for (let i=0; i<res.rows.length; i++){
            //console.log(res.rows[i].st_asgeojson)
            ret.push(res.rows[i].st_asgeojson);
        }})
        .catch(err=>{
            console.log(err.stack)
        }) */


   /*  console.log(ret)
     client
        .query(commandSelect)
        .then(res => {
            for (let i=0; i<res.rows.length; i++){
                //console.log(res.rows[i].st_asgeojson)
                ret.push(res.rows[i].st_asgeojson);
            }
            console.log(ret)
        })
        .catch(e => console.error(e.stack))
        console.log(ret); 
    return ret; */
}

function getAllPathCluster(activity, callback){
    ret = [];
    tableName= "path_"+activity;
    commandSelect =  `SELECT kmean, count(*), ST_AsText(ST_MinimumBoundingCircle(ST_Collect(geom))) as bbox 
    FROM
    (
        SELECT ST_ClusterKMeans(geo, 5) OVER() AS kmean, ST_Centroid(geo) as geom
        FROM 
		(
			SELECT ST_EndPoint(geo) as geo from ${tableName}
		) kksub
    ) ksub
    GROUP BY kmean;`;
    
    pool.query(commandSelect,(err,res)=>{
        callback(err,res);
    })
}


function getAllPathEndPoint(activity, callback){
    ret = [];
    tableName= "path_"+activity;
    commandSelect =  `SELECT ST_AsText(ST_EndPoint(geo)) as geo from ${tableName};`;
    
    pool.query(commandSelect,(err,res)=>{
        callback(err,res);
    })
}

module.exports.createAll = createAll;
module.exports.getAllPathGeo = getAllPathGeo;
module.exports.getAllGeofenceGeo = getAllGeofenceGeo;
module.exports.getAllPathCluster = getAllPathCluster;
module.exports.getAllPathEndPoint = getAllPathEndPoint;
module.exports.getMessageFromGeofence = getMessageFromGeofence;
module.exports.insertDbPathFromString = insertDbPathFromString;
module.exports.connectPg = connectPg;
module.exports.disconnectPg = disconnectPg;