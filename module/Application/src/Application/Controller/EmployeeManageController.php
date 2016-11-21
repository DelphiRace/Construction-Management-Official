<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2015 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use System_APService\clsSystem;

class EmployeemanageController extends AbstractActionController
{
	public function indexAction()
    {
		$VTs = new clsSystem;
		$VTs->initialization();
		try{
			//-----BI開始-----
			$pathString = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting";
			if(empty($_SESSION)){
	            $pagePath = $pathString . "\\index\\login_page.html";
	            $pageContent = $VTs->GetHtmlContent($pagePath);
			}else{
				$apurl = "http://211.21.170.18:99";
				// $apurl = "http://127.0.0.1:99";
				
				$indexPage = $pathString . "\\employeemanage\\index.html";
				$html = $VTs->GetHtmlContent($indexPage);
				$html = str_replace("@@userName@@",$_SESSION["userName"],$html);
				
				$arr = $VTs->json2data($VTs->UrlDataGet($apurl."/employeemanage/getdata"));
				//$VTs->debug($arr);
				
				$listPage = "";
				$trs = "";
				if($arr->status){
					foreach($arr->dataList as $data){
						$listPage = $pathString . "\\employeemanage\\list.html";
						$tr = $VTs->GetHtmlContent($listPage);
						$tr = str_replace("@@name@@", $data->name, $tr);
						
						$ID = str_replace(substr($data->sid,3, 4), "****", $data->sid);
						$tr = str_replace("@@ID@@", $ID , $tr);
						
						$tr = str_replace("@@sex@@", $data->sex, $tr);
						$tr = str_replace("@@birthday@@", $data->birthday, $tr);
						
						// 地址：郵遞區號/縣市/鄉鎮區市/村里/鄰/路/巷弄號
						// $address = $data->zip . $data->city . $data->area . $data->vil . $data->verge . $data->road . $data->addr;
						// $tr = str_replace("@@address@@", $address, $tr);
							
						$tr = str_replace("@@mobile@@", $data->mobile, $tr);
						// $tr = str_replace("@@telphone@@", $data->tel_h, $tr);
						// $tr = str_replace("@@email@@", $data->email, $tr);
						
						$tr = str_replace("@@uid@@", $data->uid, $tr);
						
						$trs .= $tr;
					}
					$html = str_replace("@@content@@", $trs, $html);
				}else{
					$html = str_replace("@@content@@", $arr->msg, $html);
				}
				
				$pageContent = $html;
			}
			//----BI結束----
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("EmployeemanageController", "newPageAction", $error->getMessage());
		}
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
	
	public function editPageAction(){
		$VTs = new clsSystem;
		$VTs->initialization();
		try{
			//-----BI開始-----
			$pathString = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting";
			if(empty($_SESSION)){
	            $pagePath = $pathString . "\\index\\login_page.html";
	            $pageContent = $VTs->GetHtmlContent($pagePath);
			}else{
				if(!empty($_POST)){
					$apurl = "http://211.21.170.18:99";
					//$apurl = "http://127.0.0.1:99";
					$action = $_POST["action"];
					// echo $action;
					
					$editPagePath = $pathString . "\\employeemanage\\newPage.html";
					$editPage = $VTs->GetHtmlContent($editPagePath);
					
					switch($action){
						case "insertData":
							$basicInfoPagePath = $pathString . "\\employeemanage\\basicInfo.html";
							break;
						case "updateData":
							$basicInfoPagePath = $pathString . "\\employeemanage\\basicInfo_edit.html";
							break;
						default:
					}
					$basicInfoPage = $VTs->GetHtmlContent($basicInfoPagePath);
					
					$addressPagePath = $pathString . "\\employeemanage\\address.html";
					$addressPage = $VTs->GetHtmlContent($addressPagePath);
					
					$communicationPagePath = $pathString . "\\employeemanage\\communication.html";
					$communicationPage = $VTs->GetHtmlContent($communicationPagePath);
					
					$dataArr = ["userName"=>$_SESSION["userName"],
								"basicInfo"=>$basicInfoPage,
								"address"=>$addressPage,
								"communication"=>$communicationPage];
					$editPage = $VTs->ContentReplace($dataArr,$editPage);					

					
					switch($action){
						case "insertData":
							$optionData = $VTs->json2data($VTs->UrlDAtaGet($apurl."/employeemanage/getdata?type=relationOption"));
							// $VTs->debug($option);
							$selectElement = "<select id='relation'><option value='0'>-請選擇-</option>";
							if(!empty($optionData)){
								foreach($optionData->dataList as $data){
									$optionElement = "<option value='".$data->uid."'>".$data->relation."</option>";
									$selectElement .= $optionElement;
								}
							}else{
								// echo "AP Action getdata has problem.";
							}
							$selectElement .= "</select>";
							
							//basicInfo
							$dataArr = ["name"=>"",
										"sid"=>"",
										"birthday"=>""];
							$editPage = $VTs->ContentReplace($dataArr,$editPage);

							//address
							$dataArr = ["zip"=>"",
										"city"=>"",
										"area"=>"",
										"vil"=>"",
										"verge"=>"",
										"road"=>"",
										"addr"=>""];
							$editPage = $VTs->ContentReplace($dataArr,$editPage);
							
							//communication
							$dataArr = ["belong"=>"",
										"relation"=>$selectElement,
										"relation1"=>"",
										"mobile"=>"",
										"tel_h"=>"",
										"tel_o"=>"",
										"tel_ext"=>"",
										"email"=>""];
							$editPage = $VTs->ContentReplace($dataArr,$editPage);
							
							//function arg
							$dataArr = ["action"=>$action,
										"uid"=>"" ];
							$editPage = $VTs->ContentReplace($dataArr,$editPage);

							$pageContent = $editPage;
							break;
						case "updateData":
							$uid = $_POST["uid"];
							// echo "uid: ".$uid;
							
							$arr = $VTs->json2data($VTs->UrlDataGet($apurl."/employeemanage/getdata?uid=".$uid.""));
							if( $arr->status ){
								// $VTs->debug($arr);
								$optionData = $VTs->json2data($VTs->UrlDAtaGet($apurl."/employeemanage/getdata?type=relationOption"));
								$selectElement = "<select id='relation'><option value='0'>-請選擇-</option>";
								foreach($optionData->dataList as $data){
									if( $arr->dataList[0]->relation == $data->relation ){
										$optionElement = "<option value='".$data->uid."' selected>".$data->relation."</option>";
									}else{
										$optionElement = "<option value='".$data->uid."'>".$data->relation."</option>";
									}
									
									$selectElement .= $optionElement;
								}
								$selectElement .= "</select>";
								
								//basicInfo
								$basicDataArr = ["name"=>$arr->dataList[0]->name,
												 "sid"=>$arr->dataList[0]->sid,
												 "sex"=>$arr->dataList[0]->sex,
												 "birthday"=>$arr->dataList[0]->birthday];
								$editPage = $VTs->ContentReplace($basicDataArr,$editPage);
								
								//address
								$addressDataArr = ["zip"=>$arr->dataList[0]->zip, 
												   "city"=>$arr->dataList[0]->city,
												   "area"=>$arr->dataList[0]->area,
												   "vil"=>$arr->dataList[0]->vil, 
												   "verge"=>$arr->dataList[0]->verge, 
												   "road"=>$arr->dataList[0]->road, 
											       "addr"=>$arr->dataList[0]->addr];
								$editPage = $VTs->ContentReplace($addressDataArr,$editPage);
								
								//commonication
								$communicatonDataArr = ["belong"=>$arr->dataList[0]->belong,
														"relation"=>$selectElement,
														"relation1"=>$arr->dataList[0]->relation1, 
														"mobile"=>$arr->dataList[0]->mobile, 
														"tel_h"=>$arr->dataList[0]->tel_h,
														"tel_o"=>$arr->dataList[0]->tel_o, 
														"tel_ext"=>$arr->dataList[0]->tel_ext,
														"email"=>$arr->dataList[0]->email];
								$editPage = $VTs->ContentReplace($communicatonDataArr,$editPage);
								
								//function arg
								$dataArr = ["action"=>$action,
											"uid"=>", '".$uid."'"];
								$editPage = $VTs->ContentReplace($dataArr,$editPage);

								
								$pageContent = $editPage;
							}else{
								$pageContent = "Query has error!";
							}
							
							
							break;
						default:
							$pageContent = "EditPage action has error!";
					}
				}
				
			}
			//----BI結束----
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("EmployeemanageController", "editPageAction", $error->getMessage());
		}
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
	}
	
}
