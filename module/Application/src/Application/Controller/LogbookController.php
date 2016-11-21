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

class LogbookController extends AbstractActionController
{
	//不執行任何動作
	public function indexAction()
    {
		 //session_start();
		$SysClass = new clsSystem;
		$SysClass->initialization();
        try{

        //-----BI開始-----  index logbook施工日誌首頁
        if(empty($_SESSION)){
            $pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\index\\login_page.html";
            $pageContent = $SysClass->GetHtmlContent($pagePath);
        }else{  
            //-----BI開始-----  材料類別頁面分流
            if(!empty($_GET['ptype'])){
                $ptype=$_GET['ptype'];
            }else{
                $ptype='list';
            }
            switch($ptype){
                case 'report':
                    $title='建築物施工日誌';
                    break;
                case 'setcontents':
                    $title='建築物施工日誌';
                    break;
                case 'laborsafety':
                    $title="勞安設定";
                    break;
                default:
                    $title='日誌清單';
                    break;
            } 
           //取得主頁html
            $mpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\index.html";
            $html=$SysClass->GetHtmlContent($mpath);



            $arrdata["title"]=$title;
            $arrdata["ptype"]=$ptype;
            $arrdata["userName"]=$_SESSION['userName'];
            $html=$SysClass->ContentReplace($arrdata,$html);
            $pageContent=$html;
        }

 
        //-----BI結束-----

        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $SysClass->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $SysClass->DBClose();
        //釋放
		$SysClass = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    public function listAction()
    {
        //session_start();
        $SysClass = new clsSystem;
        $SysClass->initialization();
        
        //-----BI開始-----  
        try{
            $arr_data=$_POST['data'];
                $html_path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\list.html";
                $html=$SysClass->GetHtmlContent($html_path);
     
                if(empty($arr_data)){
                    
                    $tr='無資料';
                    $html=str_replace('@@tr@@',$tr,$html);
                }else{
                    
                    $tr_path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\tr.html";
                    
                    $tr=$SysClass->GetHtmlContent($tr_path);
                     $trstr='';
                    foreach($arr_data as  $data) {
                         $trs=$tr;
                        $trs=str_replace('@@no@@',$data['no'],$trs);
                        $trs=str_replace('@@date@@',$data['date'],$trs);
                        $trs=str_replace('@@uid@@',$data['uid'],$trs);
                        if(!empty($data['dates'])){
                            $sat="未確認";
                            $color="red";
                        }else{
                            $sat="已確認";
                            $color=""; 
                        }
                        $trstr.=$trs;

                    }
                    $html=str_replace('@@tr@@',$trstr,$html);
                    
                }
                
            $pageContent=$html;
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $SysClass->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $SysClass->DBClose();
        //釋放
        $SysClass = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    public function reportAction()
    {
        //session_start();
        $SysClass = new clsSystem;
        $SysClass->initialization();
        
        //-----BI開始-----  
        try{
            $data=$_POST['data'];
            $html_path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\report.html";
            $html=$SysClass->GetHtmlContent($html_path);

            //基本資訊info
            $info=$data["info"];
            $arrdata = [  
                "no"=>$info['no'],
                "amweather"=>$info['amweather'],
                "pmweather"=>$info['pmweather'],
                "indate"=>$info['date'],
                "week"=>$info['week'],
            ];  
            $html=$SysClass->ContentReplace($arrdata,$html);

            //表頭資訊project
            $project=$data["project"];
            $aday=round((strtotime($info['date'])-strtotime($project["start"]))/3600/24);
            $sday=$project["pday"]-$aday+$project["cday"];
             $arrdata = [
                "prjname"=>$project["prjname"],
                "supplyname"=>$project["supplyname"],
                "pday"=>$project["pday"],
                "aday"=>$aday,
                "sday"=>$sday,
                "cday"=>$project["cday"],
                "start"=>$project["start"],
                "end"=>$project["end"],
            ];
            $html=$SysClass->ContentReplace($arrdata,$html);
            //進度
            $project=$data["schedule"];
            if(!empty($project['price_tbp'])){
                $arrdata['tbp']=$project['price_tbp']."%";
            }else{
                $arrdata['tbp']='';
            }
            if(!empty($project['price_twp'])){
                $arrdata['twp']=$project['price_twp']."%";
            }else{
                $arrdata['twp']='';
            }
            //進度管理tr1
            $trpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\tr1.html";
            $trhtml=$SysClass->GetHtmlContent($trpath);
            $arr_construction=$data["construction"];
            $strhtml1='';
            if(!empty($arr_construction) ){
                foreach($arr_construction as $construction){
                    $tr=$trhtml;
                    $tr=str_replace("@@name@@",$construction["n1"],$tr);
                    $tr=str_replace("@@unit@@",$construction["unit1"],$tr);
                    $tr=str_replace("@@pcount@@",number_format($construction["qty_work"], 2),$tr);
                    $tr=str_replace("@@fcount@@",number_format($construction["qty_budget"], 2),$tr);
                    $tr=str_replace("@@qty_s@@",number_format($construction["qty_s"], 2),$tr);
                    $strhtml1.=$tr;
                }     
            }
            $arrdata["tr1"]=$strhtml1;
            $html=$SysClass->ContentReplace($arrdata,$html);

            //材料管理tr2
            $trpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\tr2.html";
            $trhtml=$SysClass->GetHtmlContent($trpath);
            $materielcount=$data["materielcount"];
            $strhtml2='';
            if(!empty($materielcount) ){
                foreach($materielcount as $materiel){
                    $tr=$trhtml;
                    $tr=str_replace("@@name@@",$materiel["name"],$tr);
                    $tr=str_replace("@@unit@@",$materiel["unit"],$tr);
                    $tr=str_replace("@@pcount@@",$materiel["pcount"],$tr);
                    $tr=str_replace("@@incount@@",$materiel["incount"],$tr);
                    $tr=str_replace("@@count@@",$materiel["count"],$tr);
                    $strhtml2.=$tr;
                }     
    //   

            }
            $arrdata["tr2"]=$strhtml2;
            $html=$SysClass->ContentReplace($arrdata,$html);
            //取得人員機具管理tr3
            $trpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\tr3.html";
            $trhtml=$SysClass->GetHtmlContent($trpath);
            $arr_workcount= $data["workcount"];
    //        print_r($arr_workcount);
            $strhtml3='';
            if(!$arr_workcount==null ){
                foreach($arr_workcount as $workcount){
                    $tr=$trhtml; 
                    $tr=str_replace("@@name@@",$workcount["wtypename"],$tr);
                    $tr=str_replace("@@count@@",$workcount["count"],$tr);
                    $tr=str_replace("@@count_s@@",$workcount["count_s"],$tr);
                    $strhtml3.=$tr;
                }
            }
            $arrdata["tr3"]=$strhtml3;
            $html=$SysClass->ContentReplace($arrdata,$html);

             //日誌內容content
             $content= $data["fifth"];
            $arrdata = [
                "fifth"=>'',
                "seventh"=>'',
                "fourth"=>$data["fifth"],
                "sixth"=>$data["seventh"],
            ];
            $html=$SysClass->ContentReplace($arrdata,$html);
        $pageContent=$html;
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $SysClass->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $SysClass->DBClose();
        //釋放
        $SysClass = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    //設定選項
       public function setcontentAction()
    {
        //session_start();
		$SysClass = new clsSystem;
		$SysClass->initialization();
        try{
		//-----BI開始-----  get prjuid 傳入廠商ＩＤ 回傳品項html option內容
        //取得主頁html
        $mpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\setcontent.html";
        $html=$SysClass->GetHtmlContent($mpath);
        $data=$_POST['data'];
        $content=$data['content'];

        if(empty($content)){
            $weekarray=array("日","一","二","三","四","五","六");
            $arrdata = [
                "no"=>'',
                "today"=>date("Y")."-".date("m")."-".date("d"),
                "isnew"=>1,
                "week"=>$weekarray[date("w")],
                "div_inphid"=>'',
            ];
        //取得天氣列表
            $arr_weather=$data['weather'];

            $whtml='';
            foreach($arr_weather as $weather){
                $whtml.="<option value=".$weather['uid'].">".$weather['name']."</option>";
            }

            $arrdata['amoption']=$whtml;
            $arrdata['pmoption']=$whtml;
            $html=$SysClass->ContentReplace($arrdata,$html);
        }else{

            if(!empty($content['dates'])){
                $arrdata['div_inphid']='none';
                $arrdata['disabled']='disabled';
            }else{
                $arrdata['div_inphid']='';
                $arrdata['disabled']='';
            }
            $html=$SysClass->ContentReplace($arrdata,$html);
            $weekarray=array("日","一","二","三","四","五","六");
            $arrdata = [
                "no"=>'表單編號：'.$content['no'],
                "today"=>$content['date'],
                "isnew"=>0,
                "week"=>$content['week'],
            ];

        //取得天氣列表
            $arr_weather=$data['weather'];
            

            $amhtml='';
            foreach($arr_weather as $weather){
                if($content['am_wthid']==$weather['uid']){
                    $amhtml.="<option value=".$weather['uid']." selected>".$weather['name']."</option>";
                }else{
                   $amhtml.="<option value=".$weather['uid'].">".$weather['name']."</option>"; 
                }
                
            }
             $pmhtml='';
           foreach($arr_weather as $weather){
                if($content['pm_wthid']==$weather['uid']){
                    $pmhtml.="<option value=".$weather['uid']." selected>".$weather['name']."</option>";
                }else{
                   $pmhtml.="<option value=".$weather['uid'].">".$weather['name']."</option>"; 
                }
            }
            $arrdata['amoption']=$amhtml;
            $arrdata['pmoption']=$pmhtml;
  
            $html=$SysClass->ContentReplace($arrdata,$html);
        }


            //表頭資訊project
            $project=$data["project"];
            // print_r($project);
            $aday=round((strtotime(date('Y-m-d'))-strtotime($project["start"]))/3600/24);
            $sday=$project["pday"]-$aday+$project["cday"];
             $arrdata = [
                "prjname"=>$project["prjname"],
                "supplyname"=>$project["supplyname"],
                "pday"=>$project["pday"],
                "aday"=>$aday,
                "sday"=>$sday,
                "cday"=>$project["cday"],
                "start"=>$project["start"],
                "end"=>$project["end"],
            ];
            $html=$SysClass->ContentReplace($arrdata,$html);
            //進度
            $project=$data["schedule"];
            if(!empty($project['price_tbp'])){
                $arrdata['tbp']=$project['price_tbp']."%";
            }else{
                $arrdata['tbp']='';
            }
            // if(!empty($project['price_twp'])){
            //     $arrdata['twp']=$project['price_twp']."%";
            // }else{
                $arrdata['twp']='';
            // }
            //進度管理tr1
            $trpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\tr1.html";
            $trhtml=$SysClass->GetHtmlContent($trpath);
            $arr_construction=$data["construction"];
            $strhtml1='';

            if(!empty($arr_construction) ){
                foreach($arr_construction as $construction){
                    $tr=$trhtml;
                    $tr=str_replace("@@name@@",$construction["n1"],$tr);
                    $tr=str_replace("@@unit@@",$construction["unit1"],$tr);
                    $tr=str_replace("@@pcount@@",number_format($construction["qty_work"], 2),$tr);
                    $tr=str_replace("@@fcount@@",number_format($construction["qty_budget"], 2),$tr);
                    $tr=str_replace("@@qty_s@@",number_format($construction["qty_s"], 2),$tr);
                    $strhtml1.=$tr;
                }     
            }
            $arrdata["tr1"]=$strhtml1;
            $html=$SysClass->ContentReplace($arrdata,$html);

            //材料管理tr2
            $trpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\tr2.html";
            $trhtml=$SysClass->GetHtmlContent($trpath);
            $materielcount=$data["materielcount"];
            $strhtml2='';
            if(!empty($materielcount) ){
                foreach($materielcount as $materiel){
                    $tr=$trhtml;
                    $tr=str_replace("@@name@@",$materiel["name"],$tr);
                    $tr=str_replace("@@unit@@",$materiel["unit"],$tr);
                    $tr=str_replace("@@pcount@@",$materiel["pcount"],$tr);
                    $tr=str_replace("@@incount@@",$materiel["incount"],$tr);
                    $tr=str_replace("@@count@@",$materiel["count"],$tr);
                    $strhtml2.=$tr;
                }     
    //   

            }
            $arrdata["tr2"]=$strhtml2;
            $html=$SysClass->ContentReplace($arrdata,$html);
            //取得人員機具管理tr3
            $trpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\tr3.html";
            $trhtml=$SysClass->GetHtmlContent($trpath);
            $arr_workcount= $data["workcount"];
    //        print_r($arr_workcount);
            $strhtml3='';
            if(!$arr_workcount==null ){
                foreach($arr_workcount as $workcount){
                    $tr=$trhtml;
                    $tr=str_replace("@@name@@",$workcount["wtypename"],$tr);
                    $tr=str_replace("@@count@@",$workcount["count"],$tr);
                    // $tr=str_replace("@@count_s@@",$workcount["count_s"],$tr);
                    $tr=str_replace("@@count_s@@",'',$tr);
                    $strhtml3.=$tr;
                }
            }
            $arrdata["tr3"]=$strhtml3;
            $html=$SysClass->ContentReplace($arrdata,$html);

             //日誌內容content
             $content= $data["fifth"];
            $arrdata = [
                "fifth"=>'',
                "seventh"=>'',
                "fourth"=>$data["fifth"],
                "sixth"=>$data["seventh"],
            ];
            $html=$SysClass->ContentReplace($arrdata,$html);
        
            //印出html
            $pageContent=$html;
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $SysClass->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線  //       $SysClass->DBClose();
        //釋放
		$SysClass = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    public function laborsafetyAction()
    {
        //session_start();
        $SysClass = new clsSystem;
        $SysClass->initialization();
        
        //-----BI開始-----  
        try{


            // $html_path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\logbook\\laborsafety.html";
            // $html=$SysClass->GetHtmlContent($html_path);
            $laborsafety=$_POST['data'];


            if(empty($laborsafety['dates'])){

                if(empty($laborsafety['fifth']) && empty($laborsafety['seventh'])){
                    $arrdata = [
                        "isnew"=>1,
                        "fifth"=>'',
                        "seventh"=>'',
     
                    ];
                }else{
                    $arrdata['isnew']=0;
                    if(!empty($laborsafety['fifth'])){
                        $arrdata['fifth']=$laborsafety['fifth']['contents'];
                    }else{
                        $arrdata['fifth']='';
                    }
                    if(!empty($laborsafety['seventh'])){
                        $arrdata['seventh']=$laborsafety['seventh']['contents'];
                    }else{
                        $arrdata['seventh']='';
                    }

                }
                // $html=$SysClass->ContentReplace($arrdata,$html);
            }else{
                $html="主任已確認,資料無法再進行修改";
            }

            // $pageContent = $
            // foreach($arr_data as  $data) {
            //      $trs=$tr;
            //     $trs=str_replace('@@no@@',$data['no'],$trs);
            //     $trs=str_replace('@@date@@',$data['date'],$trs);
            //     $trs=str_replace('@@uid@@',$data['uid'],$trs);
            //     $trstr.=$trs;

            // }
            // $html=str_replace('@@tr@@',$trstr,$html);
            
                
            $pageContent=$html;
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $SysClass->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $SysClass->DBClose();
        //釋放
        $SysClass = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    

}
