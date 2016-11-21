<?php
/*
    Delete Method for api
*/
use SystemCtrl\ctrlSystem;

class deleteMethodController
{
    //執行刪除
    public function deleteAction()
    {
        $SysClass = new ctrlSystem;
        $SysClass->initialization();
        try{
            if(!empty($_POST["apiMethod"]) && !empty($_POST["deleteObj"])){
                $apiServer = dirname(__DIR__) . '/../public/include/apiServer.ini';

                // 取得ＡＰＩ設定檔
                $apiURLIni = $SysClass->GetINIInfo($apiServer,"",'server','',true,false);
                $apiURL = $apiURLIni["apiURL"];
                
                $sendDeleteObj = http_build_query($_POST["deleteObj"]);
                $apiMethod = $_POST["apiMethod"];

                // 判斷作業系統
                // $OSCommand = 'ver';
                // $OS = $SysClass->cmdExecute($OSCommand);
                // // 刪除方法 組合指令
                // // EX: $apiURL 加上 'ASS/api/ctrlAdmin/Delete_AssTypeOffice?iUid=1'
                // // windows
                // if($OS){
                //     $curlPath = dirname(__DIR__).'\\..\\public\\include\\windows_curl\\curl.exe';
                //     $curlCMD = $curlPath;

                // }else{//other
                //     $curlCMD = "curl";
                // }
                
                // $curlCMD = $curlCMD.' "'.$apiURL.$apiMethod."?".$sendDeleteObj.'" -X DELETE --compressed';
                // // echo $curlCMD;
                // // echo $pageContent;
                // $pageContent = $SysClass->cmdExecute($curlCMD);
                $target_url = $apiURL.$apiMethod."?".$sendDeleteObj;
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL,$target_url);
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
                // curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $rs = curl_exec ($ch);
                curl_close ($ch);
                $pageContent = $rs;
            }else{
                $action = [];
                $action["status"] = false;
                $action["errorMsg"] = "apiMethod or deleteObj is empty";

                $pageContent = $SysClass->Data2Json($action);
            }
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $SysClass->WriteLog("SupplyController", "editorAction", $error->getMessage());
        }
         //關閉資料庫連線
        // $SysClass->DBClose();
        //釋放
        $SysClass = null;
        $this->viewContnet['pageContent'] = $pageContent;
    }

}
