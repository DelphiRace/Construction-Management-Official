function showNoticeToast(msg) {
    // $().toastmessage('showNoticeToast', msg);
    $().toastmessage('showToast', {
        text     : msg,
        sticky   : false,
        position : 'top-right',
        type     : 'notice',
        stayTime : 5000
    });
}