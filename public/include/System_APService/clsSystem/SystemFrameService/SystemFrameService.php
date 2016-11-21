<?php		
	namespace SystemFrameService;
	
	class clsFrame {
	#新增、修改、刪除按鈕產生
		public function CreateBasisOptionBtn($BtnType, $BtnContent, $DataArray, $ActionID = 'uid', $BtnStyleClass = '', $listID, $actionUrl, $processFunction, $inputClass, $contentClass){
			$btnStr = '';
			$btnSetArr = ["Insert","Modify","Delete","Finish"];
			if(!empty($DataArray) or $BtnType == 'Insert'){
				if(in_array($BtnType,$btnSetArr)){
					$btnStr = $this->CreateBtn($BtnType, $BtnContent, $DataArray, $ActionID, $BtnStyleClass);
				}else{
					$btnStr = 'Btn Not Setting';
				}
			}else{
				$btnStr = 'Btn Not Setting';
			}
			return $btnStr;
		}
        
        //新增按鈕
        public function CreateInsertOptionBtn($BtnContent, $listID, $actionUrl, $processFunction, $BtnStyleClass){
            $btnStr = '';
            
            if($BtnContent){
                $btnStr = str_replace( "@@class@@", $BtnStyleClass, $BtnContent);
                $btnStr = str_replace( "@@onclick@@", "sysFrameInsertBtn('".$listID."', '".$actionUrl."', ".$processFunction.");", $btnStr);
            }else{
                $btnStr = 'Btn Not Setting';
            }
            
            return $btnStr;
        }
        
        //修改按鈕
        public function CreateModifyOptionBtn($BtnContent, $DataArray, $actionUrl, $inputClass, $contentClass, $processFunction, $ActionID = 'uid', $BtnStyleClass){
            $btnStr = '';
            
            if($BtnContent && !empty($DataArray[$ActionID])){
                $btnStr = str_replace( "@@class@@", $BtnStyleClass, $BtnContent);
                $btnStr = str_replace("@@actionID@@", $DataArray[$ActionID], $btnStr);
                $btnStr = str_replace( "@@onclick@@", "sysFrameModifyBtn($(this), '".$actionUrl."', '".$inputClass."', '".$contentClass."', ".$processFunction.");", $btnStr);
            }else{
                $btnStr = 'Btn Not Setting';
            }
            
            return $btnStr;
        }
        
        //刪除按鈕
        public function CreateDeleteOptionBtn($BtnContent, $DataArray, $actionUrl, $rowID, $processFunction, $ActionID = 'uid', $BtnStyleClass){
            $btnStr = '';
            
            if($BtnContent && !empty($DataArray[$ActionID])){
                $btnStr = str_replace( "@@class@@", $BtnStyleClass, $BtnContent);
                $btnStr = str_replace("@@actionID@@", $DataArray[$ActionID], $btnStr);
                $btnStr = str_replace( "@@onclick@@", "sysFrameDeleteBtn($(this), '".$rowID."', '".$actionUrl."', ".$processFunction.");", $btnStr);
            }else{
                $btnStr = 'Btn Not Setting';
            }
            
            return $btnStr;
        }
        
        //完成按鈕
        public function CreateFinishOptionBtn($BtnContent, $DataArray, $actionUrl, $inputClass, $contentClass, $processFunction, $ActionID = 'uid', $BtnStyleClass){
            $btnStr = '';
            
            if($BtnContent && !empty($DataArray[$ActionID])){
                $btnStr = str_replace( "@@class@@", $BtnStyleClass, $BtnContent);
                $btnStr = str_replace("@@actionID@@", $DataArray[$ActionID], $btnStr);
                $btnStr = str_replace( "@@onclick@@", "sysFrameDeleteBtn($(this), '".$inputClass."', '".$contentClass."', '".$actionUrl."', ".$processFunction.");", $btnStr);
            }else{
                $btnStr = 'Btn Not Setting';
            }
            
            return $btnStr;
        }
        
		//創建新增按鈕，非public函式
		private function CreateBtn($BtnType, $BtnContent, $DataArray, $ActionID, $BtnStyleClass){
			$BtnContent = str_replace("@@class@@",$BtnStyleClass,$BtnContent);
			if(!empty($DataArray)){
				$BtnContent = str_replace("@@actionID@@",$DataArray[$ActionID],$BtnContent);
			}
			$BtnContent = str_replace("@@onclick@@","sysFrameInsertBtn(listID, actionUrl, processFunction);",$BtnContent);
			return $BtnContent;
		}
		
	}
?>