$(function() {
	$( ".date" ).datepicker({
		dateFormat: "yy-mm-dd",
		onSelect: function(dateText, inst) {
			var dateTmp = dateText.split("-");
			var dateStr = "民國"+(parseInt(dateTmp[0]) - 1911) + "年"+dateTmp[1]+"月"+dateTmp[2]+"日";
			$(this).val(dateStr);
		}
	});
	setInputNumberOnly();
	  //只能輸入數字
	  // $(".inputNumberOnly").keypress(function(event){
	  //   return event.charCode >= 48 && event.charCode <= 57;
	  // });
});
jQuery(function($){
	$.datepicker.regional['zh-TW'] = {
		closeText: '關閉',
		prevText: '&#x3c;上月',
		nextText: '下月&#x3e;',
		currentText: '今天',
		monthNames: ['一月','二月','三月','四月','五月','六月',
		'七月','八月','九月','十月','十一月','十二月'],
		monthNamesShort: ['一','二','三','四','五','六',
		'七','八','九','十','十一','十二'],
		dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
		dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
		dayNamesMin: ['日','一','二','三','四','五','六'],
		weekHeader: '周',
		dateFormat: 'yy/mm/dd',
		firstDay: 0,
		isRTL: false,
		showMonthAfterYear: true,
		yearSuffix: '年'
	};
	$.datepicker.setDefaults($.datepicker.regional['zh-TW']);
});

function getInput(){
	// var tmpSendData = {};
	// tmpSendData.sData = getUsetInput();
	// // sendData = $.param(sendData);
	// console.log(tmpSendData);
	// var sendData = "sData="+JSON.stringify(getUsetInput());
	// var sendUrl = "http://211.21.170.17:8080/wsContract/Main.asmx/SetMain";
	// // sendRequest("post",sendUrl,sendData,"json","xml","getResponses");
	// sendRequest("post",sendUrl,sendData,"json","xml","getResponses");
	// console.log(sendData);
}

function getResponses(rsXml){
	var content = processJsonInXml(rsXml);
	console.log(content);
}