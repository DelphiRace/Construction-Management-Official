var redirect_url;
var login_code;

$(function(){
  setLogoString();
	//console.log(GetParameters);
	if(typeof GetParameters["redirect_url"] !== "undefined"){
		redirect_url = GetParameters["redirect_url"];
	}
});

function loginEven(){
	var parm = $("#loginInfo").serialize();
	//console.log(parm);
	$.ajax({
		url: configObject.LoginUrl,
		data: parm,
		type:"POST",
		async: true,
		success: function(rs){
			var result = $.parseJSON(rs);
			redirectPage(result);
		}
	});
}

function redirectPage(result){
	if(result.status){
        $.post(configObject.processLoginUrl,result,function(rs){
           //console.log(rs);
           location.href = location.origin;
        });
	}else{
		alert(result.error);
	}
}

function logoutEven(){
	$.ajax({
		url: configObject.Logout,
		type:"POST",
		async: false,
		success: function(rs){
			//location.href = location.origin;
      location.href = "login.html";
		}
	});
}

function setLogoString(){
  $.ajax({
      url: configObject.GetLogo,
      type:"POST",
      async: true,
      dataType: "JSON",
      success: function(rs){
        if(rs.status){
          $("#logo").html(rs.logoString);
        }
      }
  });
}

var GetParameters = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var parametersArr = [];
  var parameters = location.search.substring(1);
  var vars = parameters.split("&");
 
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof parametersArr[pair[0]] === "undefined") {
      parametersArr[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof parametersArr[pair[0]] === "string") {
      var arr = [ parametersArr[pair[0]],decodeURI(pair[1]) ];
      parametersArr[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      parametersArr[pair[0]].push(decodeURI(pair[1]));
    }
  } 
  return parametersArr;
}();