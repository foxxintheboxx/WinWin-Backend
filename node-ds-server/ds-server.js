const _ = require('underscore');

const deepstream = require('deepstream.io-client-js')
const MongoDBStorageConnector = require( 'deepstream.io-storage-mongodb' );

const client = deepstream(process.env.HOST)
const db = new MongoDBStorageConnector( {
  connectionString: process.env.DB,
  splitChar: '/'
});

client.rpc.provide( 'multiply-number', ( data, response ) => {
     const result = data.value * data.multiplier;
     response.send({ result, name:'digits/1'});
});

client.rpc.provide( 'pickup-coin', ( data, repsonse ) => {
    const coinUid = data.coin
    const userUid = data.uid
    const coinsNearUser = client.record.getRecord( 'nearuser/' + userUid )
    const coin = client.record.getRecord( 'coins/' + coinUid )
    coinsNearUser.whenReady( r => {
      const data = r.get()
      if (data[coidUid]) {
        coin.whenReady( c => {
          const coinData = c.get()
          if (!c.value) {
            c.delete() // Get record will have created the coin. Lets delete it.
            response.send( { error: 'Coin doesnt exist!' } )
          } else if (!coinData.owner) {
            const userCriteria = { uid: uiderUid }            const value =
            c.set('owner', userUid)
            db.update( 'user', userCriteria, { $set : }, { upsert: true }, null )
            response.send( { success: 'You picked up a $' + coinData.value + ' coin!' })
            coin.discard()
          } else {
            response.send( { error: 'Coin already has an owner!' } )
            coin.discard()
          }
        })
      } else {
        response.send( { error: 'this coins is not near you location!' } )
        coin.discard()
      }
    })
});

var lists = {};

const userLocationDidChange = (uid) => {
  const userLocation = client.record.getRecord( 'userlocation/' + uid );
  userLocation.whenReady( record => {
    const data = record.get()
    if ( data.lng && data.lat ) {
      // change to subscribe only to path or make other parts of record unwritable
      console.log("subscribed to " + uid);
      record.subscribe( (data) => {
        const lat = data.lat;
        const lng = data.lng;
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
        };
        let coinsNearUser = client.record.getRecord('nearuser/' + uid);
        db.find( 'coins', query, ( err, docs ) => {
            const ids = _.reduce( docs, ( memo, doc ) => {
              memo[doc.ds_key] = true
              return memo
            }, {});
            coinsNearUser.set( ids );
        });
      });
    }
  });
};

// https://github.com/deepstreamIO/deepstream.io-client-js/issues/306
client.record.listen( 'nearuser/.*', ( match, isSubscribed, response ) => {
  const uid = match.split('/')[1];
  let updateParams = {}
  updateParams[uid] = true
  const serverId = { uid: client.uid }
  if (isSubscribed && typeof lists[ match ] === 'undefined') {
    response.accept();
    db.update( 'servers', serverId, { $set : updateParams }, { upsert: true }, null )
    userLocationDidChange(uid);
    lists[match] = true
  } else {
    // stop publishing data
    console.log('unsubscribed');
    if ( lists[ match ] ) {
      console.log('deleting ' + match)
      db.update( 'servers', serverId, { $unset : updateParams }, null, null )
      delete lists[ match ]
    }
  }
});

client.on('error', (error, event, topic) => {
  console.log(error, event, topic)
});

client.setup = (uid) => {
  client.uid = uid
  const serverId = { uid: client.uid }
  db.findOne( 'servers', serverId, ( err, serverData ) => {
    if (serverData === null) return
    delete serverData.uid
    _.keys( serverData, (userUid) => {
      userLocationDidChange(userUid)
    });
  });
};

module.exports = client;
