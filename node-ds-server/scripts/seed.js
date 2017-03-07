const deepstream = require('deepstream.io-client-js');
const _ = require("underscore");
const constants = deepstream.CONSTANTS

const client = deepstream(process.env.HOST).login({ username: "nodeserver", password:"1234" });
client.on( 'connectionStateChanged', ( connectionState ) => {
  if (connectionState === constants.CONNECTION_STATE.OPEN) {
    let count;
    let completed = 0;
    let block = false;
    for ( count = 0; count < 20; count++ ) {
      const recordName = "coins/" + client.getUid();
      let record = client.record.getRecord(recordName);
      console.log("CREATING " + recordName);
      const div = Math.pow(10, 6);
      record.whenReady(() => {
        record.set({
          location: {
            type: "Point",
            coordinates: { lng: _.random(32058640, 32071833) / div, lat: _.random(34766230, 34786015) / div }
          },
          value: _.random(1, 5) * 10,
          user: ""
        },err => {
          if (err) {
            console.log('Record set with error:', err)
          } else {
            console.log('Record set without error')
          }
          completed += 1;
          if (completed === 20) {
            client.close();
          }
        });
      });
    }
    console.log("COMPLETE")
  }
});
