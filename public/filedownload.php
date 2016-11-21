<?php

    function collect_file($url, $SendArray){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_AUTOREFERER, false);
        // curl_setopt($ch, CURLOPT_REFERER, "http://www.xcontest.org");
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $SendArray);

        curl_setopt($ch, CURLOPT_HEADER, 0);
        $result = curl_exec($ch);
        $header = curl_getinfo($ch);
        curl_close($ch);
        $rs["result"] = $result;
        $rs["size"] = $header["size_download"];
        return $rs;
    }

    if(!empty($_POST)){
        // start loop here
        $SendArray = array();
        $SendArray["uid"] = $_POST["uid"];

        $new_file_name = $_POST["fileName"];
        $strIniFile = dirname(__DIR__) . '\\config\\apiServer.ini';
        if(!file_exists($strIniFile)){
            $strIniFile = str_replace("\\","/",$strIniFile);
        }
        $apiIni = parse_ini_file($strIniFile);
        
        $url = $apiIni["rsApiURL"]."fileDownloadAPI";

        $file = collect_file($url, $SendArray);
        // 檔案大小大於0才下載
        if($file["size"] > 0){
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="'.$new_file_name.'"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: '.$file["size"]);
            ob_clean();
            flush();
            print($file["result"]);
        }else{
            echo "can not find file";
        }
    }else{
        echo "please, use method : POST";
    }
    exit;
    // end loop here