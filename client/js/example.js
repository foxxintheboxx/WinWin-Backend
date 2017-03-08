$(function(){
	/************************************
	* Connect and login to deepstreamHub
	************************************/
	//establish a connection. You can find your endpoint url in the
	//deepstreamhub dashboard
  var ds = deepstream('localhost:6020');

	//display the connection state at the top
	ds.on( 'connectionStateChanged', function( connectionState ){
		$( '#connection-state' ).text( connectionState );
	});

  $("#object-near-me").on("click", ".object", (e) => {
    console.log(e);
  })
  const coinsNearMeChanged =  (coinsNearMe) => {
    $('#objects-near-me').find('button').remove()
    console.log(_.allKeys(coinsNearMe));
    _.each(_.allKeys(coinsNearMe), (key) => {
      $('#objects-near-me').append(
        '<button class="half right object" id="' + key + '">' + "Coin: " + key + '</button>'
      );
      console.log(key);
    });
  };

	//authenticate your connection. We haven't activated auth,
	//so this method can be called without arguments
  let recordsNearMe;
  let myLocation;
	ds.login({ username: 'aaron', password: '1234' }, (success, data) => {
    if (success) {
      const uid = data.uid;
      myLocation = ds.record.getRecord('userlocation/' + uid);
      myLocation.whenReady( r => {
//        r.set({ lng: 32.069498, lat: 34.785041 })
        $('#lng-value').val(r.get('lng'))
        $('#lat-value').val(r.get('lat'))
        recordsNearMe = ds.record.getRecord('nearuser/' + uid);
        recordsNearMe.subscribe( coinsNearMeChanged, true );
        console.log(r.get());
      });
    }
  });

	/************************************
	* Request Response
	************************************/
  let records = {};

	$('#make-rpc').click(function(){
		// read the value from the input field
		// and convert it into a number
		var data = {
			value: parseFloat( $('#request-value' ).val() ),
      multiplier: parseFloat( $('#response-value' ).val() )
		};

		// Make a request for `multiply-number` with our data object
		// and wait for the response
		ds.rpc.make( 'multiply-number', data, function( err, resp ){

      console.log(resp)
			//display the response (or an error)
      console.log(err)
      if (!records[resp.name]) {
        records[resp.name] = true;
        var record = ds.record.getRecord( resp.name );
        console.log(record.get());
        $( '#display-sub' ).text( resp.result  );
        record.subscribe('result',function( value ){
          console.log('yooo');
          $( '#display-sub' ).text( value + ' subscription' );
        }, true);
      }
			$( '#display-response' ).text( (resp.result || err.toString()) + ' response' );
		});
	});

  $('#update-location').click(function() {
    const local = {
      lng: parseFloat( $('#lng-value' ).val() ),
      lat: parseFloat( $('#lat-value' ).val() )
    };
    console.log(local);
    if (myLocation.isReady) {
      console.log(local);
      myLocation.set(local, (err) => {
        if (err) {
          console.log('Record set with error:', err)
        } else {
          alert('Record set without error')
        }
      });
    }
  });


});
