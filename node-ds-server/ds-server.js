const deepstream = require('deepstream.io-client-js')
const MongoDBStorageConnector = require( 'deepstream.io-storage-mongodb' );

const client = deepstream(process.env.HOST)
const db = new MongoDBStorageConnector( {
  connectionString: process.env.DB,
  splitChar: '/'
});
db.on( 'ready', () => { db.get('digits/1', (error, data) => console.log(data)) } );

const path = 'digits/1';
const name = 'digits/2';
var myRecord1 = client.record.getRecord(name);
var myRecord = client.record.getRecord( path );

client.rpc.provide( 'multiply-number', ( data, response ) => {
     const result = data.value * data.multiplier;
     const name = myRecord.name;
     response.send({ result, name });
     myRecord.set({'result': result});
});

client.rpc.provide( 'coins-in-range', ( data, response ) => {
    // center LNG 32.065155, LAT 34.780959
    const collection = 'coins';
    const query = {
      location: {
        $nearSphere: {
          $geometry: {
            type : 'Point',
            coordinates : [ data.lng, data.lat ]
          },
          $minDistance: 0,
          $maxDistance: 400
        }
      }
    }
    db.find( "coins", query, (err, data) => {
        console.log(data);
    });
});

client.rpc.provide( 'coins-near-me-list', ( data, response ) => {

}

client.rpc.provide( 'pickup-coin', ( data, repsonse ) => {
    // modify record
    response.send({ });
});

module.exports = client;
