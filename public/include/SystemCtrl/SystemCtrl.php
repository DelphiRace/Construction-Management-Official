<?php
	//宣告命名空間
	namespace SystemCtrl;
	
	//先載入各物件
	$systemApPath = glob( __DIR__ ."\\*\\*\\*.php");
	
	if(!empty($systemApPath)){
		foreach($systemApPath as $systemApContent){
			include_once($systemApContent);
			//print_r($systemApContent);
		}
    }else{
        //先載入各物件
        $systemApPath = glob( __DIR__ ."/*/*/*.php");
        if(!empty($systemApPath)){
            foreach($systemApPath as $systemApContent){
                include_once($systemApContent);
                //print_r($systemApContent);
            }
        }
    }
    
    
	//載入結束
	//引用物件命名空間
	use ctrlDBService\ctrDB_MySQL;
	use ctrlToolsService\ctrlTools;
	use ctrlAPISettingService\ctrlAPISetting;

	//引用完畢
	
	class ctrlSystem{
		//資料庫連線參數
		public $ctrlDBService;
		//相關工具
		public $ctrlToolsService;
		// API設置工具
		public $ctrlAPISettingService;
		//ini相關設定
		public $iniSet;
		//使用者資訊
		public $userInfo;
		//log file setting
		public $logFileSetting;
		
		//供呼叫程式初始化設定
		public function initialization($DBSection = null, $DBconn = false){
			@session_start();
			//相關工具設定
			//基礎的資安防護
			$SysClass = new ctrlTools;
			if(!empty($_POST)){
				$_POST = $SysClass->replacePackage($_POST);
			}
			
			if(!empty($_GET)){
				$_GET = $SysClass->replacePackage($_GET);
			}
			//結束基礎的資安防護

			//取得資料庫設定值
			$strIniFile = dirname(__DIR__) . '\\..\\..\\config\\connDB.ini';
            if(!file_exists($strIniFile)){
                $strIniFile = dirname(__DIR__) . '/../../config/connDB.ini';
            }
			$sSection = 'connDB';
            if(!$DBSection){
                $DBSection = 'defaultDB';
            }
			if($DBconn){
				//取得連線資料庫資料
				$DBConfig = $SysClass->GetINIInfo($strIniFile,$sSection,'servername','',true,true);
				// print_r($DBConfig);
				$sServer = $DBConfig["connDB"]["servername"];
				$sUser = $DBConfig["connDB"]["user"];
				$sPassWord = $DBConfig["connDB"]["password"];
	            // 取得資料庫
				$sDatabase = $DBConfig[$DBSection]["defaultDB"];
				
				// 放到共同變數中
				$iniSet["DBSet"]["sServer"] = $sServer;
				$iniSet["DBSet"]["sUser"] = $sUser;
				$iniSet["DBSet"]["sPassWord"] = $sPassWord;
				$iniSet["DBSet"]["sDatabase"] = $sDatabase;
				
			}
			//載入LOG設定檔
			$strIniFile = __DIR__ . '\\..\\setlog.ini';
            if(!file_exists($strIniFile)){
                $strIniFile = __DIR__ . '/../setlog.ini';
            }
            $sSection = "log";
			$this->logFileSetting = $SysClass->GetINIInfo($strIniFile,$sSection,'write','');

			//存到變數，以重複利用
			$this->ctrlToolsService = $SysClass;
			//釋放
			$SysClass = null;
			//相關工具設定結束
			
			if($DBconn){
				// 建立資料庫連線
				$SysClass = new ctrDB_MySQL;
				$SysClass->CreateDBConnection($sServer,$sDatabase,$sUser,$sPassWord);
				//存到變數，以重複利用
				$this->ctrlDBService = $SysClass;
				//釋放
				$SysClass = null;
			}

			// API設置工具
			$SysClass = new ctrlAPISetting;
			$this->ctrlAPISettingService = $SysClass;
			// 釋放
			$SysClass = null;
			
		}
	#檢查ＳＥＳＳＩＯＮ
		public function CheckLogin(){
			if(empty($_SESSION)){
				header("Location: ./login.html");
				exit();
			}else{
				header("location: ./content.html");
				exit();
			}
			return true;
		}
	#結束檢查ＳＥＳＳＩＯＮ

	#ctrlDBService
		//資料庫連線
		public function CreateDBConnection($sServer='', $sDatabase='', $sUser='', $sPassWord=''){
			$sServer = ($sServer)?$sServer:$iniSet["DBSet"]["sServer"];
			$sDatabase = ($sDatabase)?$sDatabase:$iniSet["DBSet"]["sDatabase"];
			$sUser = ($sUser)?$sUser:$iniSet["DBSet"]["sUser"];
			$sPassWord = ($sPassWord)?$sPassWord:$iniSet["DBSet"]["sPassWord"];
			
			$conn = $this->ctrlDBService->CreateDBConnection($sServer,$sDatabase,$sUser,$sPassWord);
			//回傳
			return $conn;
		}
		
		//用於單純INSERT、UPDATE、DELETE等
		//ExecuteNonQuery(sSqlText)
		public function Execute($sSqlText){
			$execut = false;
			if( !empty($sSqlText) ){
				$execut = $this->ctrlDBService->ExecuteNonQuery($sSqlText);
				$callFunction = debug_backtrace();
				$callFunction = $callFunction[0];
				if(!$execut){
					// print_r('Error SQL: '.$sSqlText);
					$this->WriteLog($callFunction["class"], $callFunction["function"], "SQL Error:".$sSqlText);
				}
				if($this->logFileSetting){
					$this->WriteLog($callFunction["class"], $callFunction["function"], "SQL:".$sSqlText);
				}
			}
			return $execut;
		}
		
		//讀取資料 QueryData(sSqlText) as DataTable
		public function QueryData($sSqlText){
			if( !empty($sSqlText) ){
				$data = $this->ctrlDBService->QueryData($sSqlText);
				if($this->logFileSetting){
					$callFunction = debug_backtrace();
					$callFunction = $callFunction[0];
					$this->WriteLog($callFunction["class"], $callFunction["function"], "SQL:".$sSqlText."\nData:".$this->Data2Json($data));
				}
			}
			return $data;	
		}
		
		//建立Transcation機制 CreateMySqlTranscation
		public function Transcation(){
			$this->ctrlDBService->Transcation();
		}
		
		//Commit Transction機制 CommitMySqlTranscation
		public function Commit(){
			$this->ctrlDBService->Commit();
		}
		
		//Rollback Transction機制 RollbackMySqlTranscation
		public function Rollback(){
			$this->ctrlDBService->Rollback();
		}
		
		//關閉資料庫連線 CloseConnection
		public function DBClose(){
			$this->ctrlDBService->DBClose();
		}

		//取得AI新增的ＩＤ
        public function NewInsertID(){
            return $this->ctrlDBService->NewInsertID();
        }
	#這裡是ctrlDBService 結束	
		
	#這裡是	ctrlToolsService
	#modIO
		//讀取頁面Html檔案
		public function GetHtmlContent($fPath){
			return $this->ctrlToolsService->GetHtmlContent($fPath);
		}
		
		//讀取INI檔資料 GetINIInfo(strIniFile, sSection, sKeyName, sDefaultValue = "") As String
		public function GetINIInfo($strIniFile,$sSection,$sKeyName,$sDefaultValue = "",$originDataArray = false, $process_sections = false){
			return $this->ctrlToolsService->GetINIInfo($strIniFile,$sSection,$sKeyName,$sDefaultValue,$originDataArray,$process_sections);
		}
		
		//使用cmd執行指令
		public function cmdExecute($sCommand){
			return $this->ctrlToolsService->cmdExecute($sCommand);
		}
		
		//建立資料夾 CreateDirectory(sPath)
		public function CreateDirectory($sPath){
			$this->ctrlToolsService->CreateDirectory($sPath);
		}
		
		//建立檔案 CreateFile(sFileFullPath)
		public function CreateFile($sFileFullPath,$sFileContent, $writeType = "w"){
			return $this->ctrlToolsService->CreateFile($sFileFullPath,$sFileContent,$writeType);
		}
		
		//複製檔案 CopyFile(sOrgFileFullPath, sOutFileFullPath)
		public function CopyFile($sOrgFileFullPath, $sOutFileFullPath){
			$this->ctrlToolsService->CopyFile($sOrgFileFullPath, $sOutFileFullPath);
		}
		
		//複製資料夾 CopyField(sOrgFieldPath, sOutFieldPath)
		public function CopyField($sOrgFieldPath, $sOutFieldPath){
			$this->ctrlToolsService->CopyField($sOrgFieldPath, $sOutFieldPath);
		}
		
		//刪除檔案 DelFile(sFilePath)
		public function DelFile($sFilePath){
			$this->ctrlToolsService->DelFile($sFilePath);
		}
		
		//刪除資料夾 DelField(sFieldPath)
		public function DelField($sFieldPath){
			$this->ctrlToolsService->DelField($sFieldPath);
		}
		
        //產生ＰＤＦ檔案
        public function Page2PDF($ChangePagePagth , $saveFileName, $zoom = 1){
            return $this->ctrlToolsService->Page2PDF($ChangePagePagth , $saveFileName, $zoom);
        }
        
        
		//寫LOG檔 ThreadLog(ctrlName, funName, sDescribe = "", sEventDescribe = "", iErr = 0) 
		public function WriteLog($ctrlName, $funName, $sDescribe = "", $sEventDescribe = "", $iErr = 0){
			global $callFunction;
			//$ctrlToolsService = $this->ctrlToolsService;
			$callFunction = debug_backtrace();
			$callFunction = $callFunction[0];
			
			$this->ctrlToolsService->ThreadLog($ctrlName, $funName, $sDescribe, $sEventDescribe, $iErr);
			
			//畫面操作事件
			if($sEventDescribe != ""){
				$this->SetAPPLog($sEventDescribe);
			}

			//釋放
			$ctrlDBService = null;
			$ctrlToolsService = null;
			$callFunction = null;
		}

		//寫入使用者APP Log
		public function SetAPPLog($sLogMsg, $sLogSource = "操作紀錄", $blCn2 = false, $iLogType = 1, $sPhyAddr = "(NULL)", $blFiahMarket = false){
			global $ctrlToolsService;
			$ctrlToolsService = $this->ctrlToolsService;
			try{
				if(!empty($_SESSION)){
					$uuid = $_SESSION["uuid"];
					$sClerk = $_SESSION["ac"];
					$cHost = $_SESSION["userName"];
				}else{
					$uuid = 0;
					$sClerk = "system";
					$cHost = "系統動作";
				}
				//寫入
				$this->ctrlDBService->SetAPPLog($uuid, $sClerk, $cHost, $sLogMsg, $blCn2, $sLogSource, $iLogType, $sPhyAddr);
			}catch(Exception $error){
				$this->WriteLog("ctrlTools", "SetAPPLog", $error->getMessage(), "", 1);
			}
		}

	#modIO結束
		
	#modDataFormate
		//日期轉換
		public function DateTime($changeType,$Date=null){
			$dateStr = $this->ctrlToolsService->DateTime($changeType,$Date);
			if(!$dateStr){
				print_r("Error Date Type: ".$changeType."; or Date: ".$Date);
				return false;
			}
			return $dateStr;
		}
		
		//資料轉換成json(encode)
		public function Data2Json($Data){
			return $this->ctrlToolsService->Data2Json($Data);
		}
		
		//json轉換成資料轉(decode)
		public function Json2Data($JsonData,$original = true){
			return $this->ctrlToolsService->Json2Data($JsonData, $original);
		}
		//資料內容取代
		public function ContentReplace($processData,$replaceContent){
			$processContent = $this->ctrlToolsService->ContentReplace($processData,$replaceContent);
			if(!$processContent){
				$callFunction = debug_backtrace();
				$callFunction = $callFunction[0];
				$this->WriteLog($callFunction["class"], $callFunction["function"], "內容取代錯誤\n");
			}else{
				return $processContent;
			}
		}
	#modDataFormate結束
		
	#DataInformationSecurity
		//資訊全重複檢查是否有遺漏的，並取代為HTML CODE
		public function replacePackage($arr){
			$tmpArr = $this->ctrlToolsService->replacePackage($arr);
			return $tmpArr;
		}
	#DataInformationSecurity結束
		
	#modArrayDebug
		public function debug($DataArray){
			$this->ctrlToolsService->debug($DataArray);
		}
	#modArrayDebug結束
	
	#modCurl相關
		//POST
		public function UrlDataPost($url, $SendArray, $contentType = "application/x-www-form-urlencoded; charset=UTF-8") {
			//回傳結果是對象URL執行結果
			return $this->ctrlToolsService->UrlDataPost($url, $SendArray,$contentType);
		}
		//GET
		public function UrlDataGet($url,$obj) {
			//回傳結果是對象URL執行結果
			return $this->ctrlToolsService->UrlDataGet($url,$obj);
		}
		//DELETE
		public function UrlDataDelete($url, $SendArray, $contentType = "application/x-www-form-urlencoded; charset=UTF-8") {
			//回傳結果是對象URL執行結果
			return $this->ctrlToolsService->UrlDataDelete($url,$SendArray,$contentType);
		}
		//DELETE
		public function UrlDataPut($url, $SendArray, $contentType = "application/x-www-form-urlencoded; charset=UTF-8") {
			//回傳結果是對象URL執行結果
			return $this->ctrlToolsService->UrlDataPut($url,$SendArray,$contentType);
		}
	#modCurl結束
	#modMail
		public function Tomail($sender,$recipient,$mailTitle,$msg){
			//回傳true/false
			return $this->ctrlToolsService->Tomail($sender,$recipient,$mailTitle,$msg);
		}
	#modMail結束	
	
	
		public function creatINI($assoc_arr, $path, $has_sections=false, $append = false){
			$this->ctrlToolsService->creatINI($assoc_arr, $path, $has_sections, $append);
		}
    #這裡是	ctrlToolsService 結束

	#API Setting
		public function GetAPIUrl($iniIndex = "", $original = false){
			return $this->ctrlAPISettingService->GetAPIUrl($iniIndex, $original);
		}
	}
	
	
?>