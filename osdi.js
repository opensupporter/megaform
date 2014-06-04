/*
object osdiConnection

grab form, then pull fields

*/

/* test stuff */



function testFill() {
	 $("#osdi-email").val("kermit@defrog.com");
  $("#osdi-given-name").val("Kermit");
  $("#osdi-family-name").val("De Frog");
  $("#osdi-mobile-phone").val("2125551212");
  $("#osdi-address1").val("401 I St. SW");
  $("#osdi-locality").val("Washington");
  $("#osdi-region").val('DC');
  $("#osdi-postal-code").val('20024');

}

/* config stuff */

/* localhost */
var osdiServers = [
	{
		"name" : "Salsa",
		"signup_uri" : "http://localhost:3000/proxy/salsa/person_signup_helper"
	},
	{
		"name" : "VAN",
		"signup_uri" : "http://localhost:3000/api/v1/person_signup_helper"
	},
	{
		"name" : "Trilogy",
		"signup_uri" : "http://localhost:3000/api/v1/person_signup_helper"
	}
		
];

/* live servers */
var osdiServers = [
	{
		"name" : "Salsa",
		"signup_uri" : "http://salsa.demo.osdi.io/proxy/salsa/person_signup_helper"
	},
	{
		"name" : "VAN",
		"signup_uri" : "http://salsa.demo.osdi.io/proxy/van/person_signup_helper"
	},
	{
		"name" : "Trilogy",
		"signup_uri" : "http://trilogy.demo.osdi.io/api/v1/person_signup_helper"
	}
		
];


var thankYouUri = "/thankyou.html";

/* App stuff */

$( document ).ready(function() {
    console.log( "Document Ready!" );
    
  $('#test-fill').click(testFill);

  $('#osdi-signup').click(osdiSignup);
  $('#donate-button').click(donateButton);

});

/* sequential Ajax hell */

/* UI stuff */

function osdiSignup() {
	event.preventDefault(); /* dont actually submit */

	$('#myModal').modal('show')

	

	setTimeout(osdiSignupInner,300);
	

}

function osdiSignupInner() {

	var person = processForm();
	var count = osdiServers.length

	for ( i=0; i< count ; i++) {
		console.log("Sending to " + osdiServers[i]['name'])
		uploadPerson(person,osdiServers[i]['signup_uri'],osdiServers[i]['name']);

	}
	
}

function processForm() {
  if ( ! present($('#osdi-given-name').val())
   && !present($('#osdi-family-name').val())
   && ! present($('#osdi-email').val())
   ) {
    return null;
  }
    
  var q={};
  q['data'] = {};
  var p = q['data'];
  p['add_tags'] = []
  
  var tags = p['add_tags'];


  p['given_name']=$('#osdi-given-name').val();
  p['family_name']=$('#osdi-family-name').val();
  p['email_addresses']= [ { 
      "address" : $('#osdi-email').val(),
      "primary" : true
    }];


  p['phone_numbers'] = [];
  p['phone_numbers'][0] = {
    'number' : $('#osdi-mobile-phone').val(),
    'sms_permission' : $('#sms_permission').val()
  }


  var a={
    "address_lines": [ $('#osdi-address1').val(),$('#osdi-address2').val() ],
    "locality": $('#osdi-locality').val(),
    "region": $('#osdi-region').val(),
    "postal_code": $('#osdi-postal-code').val()
  }
  p['postal_addresses'] = [ a ];
  
  // // handle checkboxes for tags
  // if ( $('#volunteer').prop('checked') ){
  //   tags.push('volunteer');
  // }
  $( ".tags" ).each(function() {
    if ( $( this ).prop('checked') ) {
     tags.push( $(this).val() ); 
    }
    
  });

  console.log('Generated person ');
  console.log(q);
  return q;


}

/* osdi protocol stuff */


function uploadPerson(person, resourceUrl,serverName) {
  // serialize to JSON
  var json = JSON.stringify(person['data']);

  var response;
  var response_json;
  // busy on
 
  // do POST to server synchronous
  // Settings to pass to jquery to fetch the data
  osdiLog('Uploading person ' + personEmail(person));
 
  response = exec_ajax(json,resourceUrl);

  response_json = response.responseText;
  person['save_response'] = response_json;
  person['status_code'] = response.status;
  person['request_id'] = response.getResponseHeader('OSDI-Request-ID');

  if ( response.status > 299) {
    osdiLog("Upload Error " + personEmail(person) + " status " + response.status);
    osdiLog(getOSDIStatus(response.responseText));
  } else {
    osdiLog("Upload Success " + serverName + " status " + response.status);
    showProgress("Upload Success " + serverName + " status " + response.status);
  }
  console.log(response);
  // busy off


}


function exec_ajax(json,resourceUrl) {
  var response;

   var ajaxSettings = {
    // The url to flickrs api
    url: resourceUrl,
    // The format we want it in
    dataType: 'json',
    async: false,
    type: "POST",
    data: json,
    // The function to execute when the api has finished loading
    //success: apiSuccessOSDI,
  };
  // Pass all the settings to being fetching the data
  response = $.ajax(ajaxSettings);
  console.log(response.status + ' POST ' + resourceUrl );
  return response;
}

/* utility stuff */

function osdiLog(msg) 
{
  console.log(msg);
}


function getOSDIStatus(json) {
  var obj;
  var str;
  try {
    obj = JSON.parse(json);
    str = obj['osdi:status']['status'] + ' ' + obj['osdi:status']['description'];  
  } catch (e) {
    str = "Undetermined";
  }
  
  return str;

}

function present(obj) {
  if ( obj != undefined && obj != null && obj != ""
    && obj != "undefined" && obj != "null"){
    return true;

  } else {
    return false;
  }
}
function personEmail(person) {
  var pe = person['data']['email_addresses'][0]['address'];
  return pe;
}

function showProgress(msg) {
	var old = $('#progress').html();
	var status = old + '<br/>' + msg;
	$("#progress").html(status);
}

function donateButton() {
	window.location = thankYouUri;
}