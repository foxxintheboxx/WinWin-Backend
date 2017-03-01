$(function(){
	/************************************
	* Connect and login to deepstreamHub
	************************************/
	//establish a connection. You can find your endpoint url in the
	//deepstreamhub dashboard
  var ds = deepstream('0.0.0.0:6020');

	//display the connection state at the top
	ds.on( 'connectionStateChanged', function( connectionState ){
		$( '#connection-state' ).text( connectionState );
	});

	//authenticate your connection. We haven't activated auth,
	//so this method can be called without arguments
	ds.login({ username: "aaron", password: "1234" });

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
        record.subscribe("result",function( value ){
          console.log("yooo");
          $( '#display-sub' ).text( value + " subscription" );
        }, true);
      }
			$( '#display-response' ).text( (resp.result || err.toString()) + " response" );
		});
	});
});
