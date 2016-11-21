<?php		
	namespace ctrlDBService;
	
	class ctrDB_MySQL {
		//定義共用變數
		public $conn;
		//CreateDBConnection(sServer, sDatabase, sUser, sPassWord) as boolean
		//資料庫連線
		public function CreateDBConnection($sServer,$sDatabase,$sUser,$sPassWord){			
			$this->conn = new \mysqli($sServer, $sUser, $sPassWord,$sDatabase);
			$this->conn->set_charset("utf8");
			if ($this->conn->connect_error) {
				$this->conn = false;
			}
			//回傳
			return $this->conn;
		}
		
		//用於單純INSERT、UPDATE、DELETE等
		//ExecuteNonQuery(sSqlText)
		public function ExecuteNonQuery($sSqlText){
			if( !empty($sSqlText) ){
				$stmt = $this->conn->multi_query($sSqlText);
				return ($stmt)?true:false;
			}
		}
		
		//讀取資料 QueryData(sSqlText) as DataTable
		public function QueryData($sSqlText){
			$data = null;
			if( !empty($sSqlText) ){
				$stmt = $this->conn->query($sSqlText);
				$data = $this->Data2Array($stmt);
				
			}
			return $data;	
		}
		
		//建立Transcation機制 CreateMySqlTranscation
		public function Transcation(){
			$sSqlText = 'START TRANSACTION';
			$this->ExecuteNonQuery($sSqlText);
		}
		
		//Commit Transction機制 CommitMySqlTranscation
		public function Commit(){
			$sSqlText = 'COMMIT';
			$this->ExecuteNonQuery($sSqlText);
		}
		
		//Rollback Transction機制 RollbackMySqlTranscation
		public function Rollback(){
			$sSqlText = 'ROLLBACK';
			$this->ExecuteNonQuery($sSqlText);
		}
		
		//關閉資料庫連線 CloseConnection
		public function DBClose(){
			$this->conn->close();
		}

		//取得AI新增的ＩＤ
        public function NewInsertID(){
           return $this->conn->insert_id;
        }
		
		//資料庫轉換資料
		private function Data2Array($DBQueryData, $kind=0){
			$data = null;
			if($DBQueryData){
				$i=0;
				if( $DBQueryData and $DBQueryData->num_rows){
					while ($ar = $DBQueryData->fetch_array(MYSQLI_ASSOC)) {
						$j=0;
						foreach($ar as $key=>$val){
							//echo $key."=>".$val;
							if( !empty($pk) ){
								$p = $ar[$pk];
								if($kind==0) $data[$p][$key]=$val;
								elseif($kind==1) $data[$p][$j]=$val;
							}
							else{
								if($kind==0) $data[$i][$key]=$val;
								elseif($kind==1) $data[$i][$j]=$val;
							}
							$j++;
						}
						$i++;
					}
				}
			}
			return $data;
		}
		
		//Log紀錄
		public function SetAPPLog($iUserID, $sUserName, $sHostName, $sLogMsg, $blCn2=false, $sLogSource="操作紀錄", $iLogType=1, $sPhyAddr="(NULL)"){
			global $SystemToolsService;
			try{
				$sKey = "logtime,userid,username,hostname,logsource,logtype,logmsg,phyaddr";
				$strSQL = "insert into sys_aplog (" . $sKey . ") 
						values('". date("Y-m-d H:i:s") . "', '" . $iUserID . "', '" . $sUserName . "', 
						'" . $sHostName . "', '" . $sLogSource . "', ".$iLogType . ", '" . $sLogMsg . "', '"  . $sPhyAddr . "')";
				$SystemToolsService->ThreadLog("clsDB_MySQL", "SetAPPLog", $strSQL);
				$this->ExecuteNonQuery($strSQL);
			}catch(Exception $error){
				$SystemToolsService->ThreadLog("clsDB_MySQL", "SetAPPLog", $error->getMessage(), "", 1);
			}
		}
	}
?>