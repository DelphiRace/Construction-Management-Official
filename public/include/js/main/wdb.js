//針對不同瀏覽器實作 IDBFactory 的方式不同 的共通寫法
var idbf = window.indexedDB || window.mozIndexedDB || window.msIndexedDB;

//建立資料庫
function CreateDB()
{
    //連接並開啟 MyFirstIDB，如果不存在就先建立之。
    var idb = idbf.open("MyFirstIDB");

    //連接失敗時的錯誤處理
    idb.onerror = function (e) {
        document.getElementById("divResult").innerHTML += e.target.error + "<br/>";
    }

    //開啟成功後取得 IndexedDB 的實體
    idb.onsuccess = function (e) {
        idb = e.target.result;
        document.getElementById("divResult").innerHTML += "MyFirstIDB 建立完成"
            + " - 狀態：" + this.readyState
            + " - 目前版本：" + idb.version
            + "<br/>";
    }

    //版本異動時觸發
    idb.onupgradeneeded = function (e) {
        document.getElementById("divResult").innerHTML += "版本異動"
            + " - 舊版本：" + e.oldVersion
            + " - 新版本：" + e.newVersion
            + " - 目前版本：" + idb.version
            + "<br/>";
    }
}

//刪除資料庫
function DeleteDB() {
    idbf.deleteDatabase("MyFirstIDB");
}