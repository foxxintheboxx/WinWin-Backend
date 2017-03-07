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
    const coin = client.record.getRecord( 'object/complete/' + coinUid )
    coinsNearUser.whenReady( r => {
      const data = r.get()
      if (data[coidUid]) {
        coin.whenReady( c => {
          const coinData = c.get()
          if (!c.value) {
            c.delete() // Get record will have created the coin. Lets delete it.
            response.send( { error: 'Coin doesnt exist!' } )
          } if (!coinData.owner) {
            c.set('owner', userUid)
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
  const userLocation = client.record.getRecord( 'location/' + uid );
  userLocation.whenReady( record => {
    const data = record.get()
    if ( data.lng && data.lat ) {
      // change to subscribe only to path or make other parts of record unwritable
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
  if (isSubscribed && typeof lists[ match ] === 'undefined') {
    response.accept();
    const uid = match.split('/')[1];
    userLocationDidChange(uid);
  } else {
    // stop publishing data
    console.log('unsubscribed');
    if ( lists[ match ] ) {
      console.log('deleting ' + match)
      lists[ match ].discard()
      delete lists[ match ]
    }
  }
});

client.on('error', (error, event, topic) => {
  console.log(error, event, topic)
})

module.exports = client;
