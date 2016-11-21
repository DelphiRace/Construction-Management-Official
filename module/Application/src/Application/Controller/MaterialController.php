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

class MaterialController extends AbstractActionController
{
    //list 材料進貨清單狀態 在Material為主頁
    public function listAction(){
        //session_start();
        $VTs = new clsSystem;
        $VTs->initialization();
        try{
        //-----BI開始----- 
            //判斷有無登入
            if(empty($_SESSION)){

                $pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\index\\login_page.html";
                $pageContent = $VTs->GetHtmlContent($pagePath);

            }else{  
                $mpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\material\\list.html";
                $html=$VTs->GetHtmlContent($mpath);
                $arrdata["userName"]=$_SESSION['userName'];
                $arrdata["uuid"]=$_SESSION['uuid'];
                $html=$VTs->ContentReplace($arrdata,$html);
                $pageContent=$html;
            }    
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $VTs->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
        $VTs = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }

    //application 材料申請頁
    public function applicationAction()
    {
        
        //session_start();
		$VTs = new clsSystem;
		$VTs->initialization();
        try{
		//-----BI開始-----  
            if(empty($_SESSION)){
                $pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\index\\login_page.html";
                $pageContent = $VTs->GetHtmlContent($pagePath);
            }else{  
                $mpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\material\\application.html";
                $html=$VTs->GetHtmlContent($mpath);
                $arrdata["userName"]=$_SESSION['userName'];
                $arrdata["uuid"]=$_SESSION['uuid'];
                $html=$VTs->ContentReplace($arrdata,$html);
                $pageContent=$html;
            }                
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $VTs->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }

    //getlisthtml 取得list頁面所需list 
    public function getListHtmlAction()
    {

        //session_start();
        $VTs = new clsSystem;
        $VTs->initialization();
        //-----BI開始----- 
        try{
            $trstr="<tr>
                        <th>項次</th>
                        <th>訂單編號</th>
                        <th>品項</th>
                        <th>數量</th>
                        <th>申請日期</th>
                        <th>狀態</th>
                        <th>詳細資料</th>
                    </tr>";
            //接資料
            $ls_petition=$_POST['data'];
            if($ls_petition==null){
                //無資料時顯示無資料
                $trstr="<tr align='center'><td colspan=7>無資料</td></tr>";
               
            }else{
                //取得tr原始html
                $tr_path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\material\\list_tr.html";
                $tr=$VTs->GetHtmlContent($tr_path);

                //解析資料
                foreach($ls_petition as  $id => $lsData) {
                    $trs=$tr;
                    $status='';
                    // $color='block';
                     $status='待確認';
                    if ($lsData['chksend']!=-1){
                        $status='待進場';
                    }
                    if ($lsData['chkin']!=-1){
                        $status='待審查';
                    }
                    if ($lsData['chkqc']!=-1){
                        $status='自檢完畢';
                    }

                    $arrdata=array(
                            "id"=>$id+1,
                            "uid"=>$lsData['uid'],
                            "adate"=>$lsData['datep'],
                            "ma_name"=>$lsData['ma_name'],
                            "count"=>$lsData['count'],
                            "status"=>$status,
                        );
                    $trs=$VTs->ContentReplace($arrdata,$trs);
                    $trstr.=$trs;
                }
 
            }

            //印出html
            $pageContent=$trstr;
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $VTs->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
        $VTs = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }

    //chkinfo 取得list項目的詳細資料 
    public function chkinfoAction()
    {
        //session_start();
        $VTs = new clsSystem;
        $VTs->initialization();
        
        try{
            //取得list_info原始html
            $path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\material\\list_info.html";
            $html=$VTs->GetHtmlContent($path);

            //接資料
            $data=$_POST['data'];
       
            //塞資料
            $arrdata=array(
                    "uid"=>$data['uid'],
                    "no"=>'AA0000'.$data['uid'],
                    "cpname"=>$data['cpname'],
                    "keyman"=>$data['keyman'],
                    "phone"=>$data['mobile'],
                    "mname"=>$data['mname'],
                    "count"=>$data['count'],
                    "date"=>$data['date'],
                    "aname"=>$data['aname'],
                    "place"=>$data['place'],
                    "mplace"=>$data['place_work'],
                    "aphone"=>$data['amobile'],
                    "quid"=>$data['quid'],
                );
            
            if($data['check']){

                if(!empty($data['datein'])){

                    $arrdata['btn_check']='none';
                    $arrdata['btn_in']='none';
                }else{      
   
                    $arrdata['btn_check']='none';
                    $arrdata['btn_in']='';
                }
            }else{
                 $arrdata['btn_check']='';
                 $arrdata['btn_in']='none';
            }

            $pageContent=$html=$VTs->ContentReplace($arrdata,$html);
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $VTs->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
        $VTs = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }

    //詳細資料按下確認後寄出email
   public function sendemailAction()
    {
        //session_start();
        $VTs = new clsSystem;
        $VTs->initialization();
        
        try{
             $data=$_POST['data'];
             $str="廠商資訊"."\n";
             $str="訂單編號:".'AA0000'.$data['uid']."\n";
             $str.="公司名稱:".$data['cpname']."\n";
            $str.="品項:".$data['mname']."\n";
            $str.="數量:".$data['count']."\n";
            $str.="聯絡人:".$data['keyman']."\n";
            $str.="電話:".$data['mobile']."\n";
            $str.="===========================\n";
            $str.="申請人資訊\n";
            $str.="申請人:".$data['aname']."\n";
            $str.="電話:".$data['amobile']."\n";
            $str.="放置地點:".$data['place']."\n";
            $str.="施作部位:".$data['place_work']."\n";
            $str.="預計進場時間：".$data['date']."\n";
            $VTs->Tomail("veracity.core.gmail.com","hope080122@gmail.com","訂貨",$str);
            $html='sendEmail';
            //印出html
            $pageContent=$html;
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $VTs->WriteLog("IndexController", "indexAction", $error->getMessage());
        }
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
        $VTs = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
  
}
