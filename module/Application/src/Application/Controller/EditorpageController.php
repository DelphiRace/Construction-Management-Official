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

class EditorpageController extends AbstractActionController
{
	//不執行任何動作
	public function indexAction()
    {
		$this->viewContnet['pageContent'] = 'Please Select Your Action and Try Again!';
        return new ViewModel($this->viewContnet);
    }
	//取得選單
	public function typeunitAction()
    {
        //session_start();
		$VTs = new clsSystem;
		$VTs->initialization();
		
		//-----BI開始----- typeunit 單位表IUD頁面
        //取得db資料
        $data = $VTs->json2data($VTs->UrlDataGet("http://127.0.0.1:88/editor/getdbdata?page=typeunit"));
//        $tag_input=$VTs->GetHtmlContent($this->getTagHtml('input'));
//        $tag_select=$VTs->GetHtmlContent($this->getTagHtml('select'));
//        $tag_title=$VTs->GetHtmlContent($this->getTagHtml('title'));
//        $btn_insert=$this->getBtnInsert($VTs,'frm_typeunit','addID','editor/getInertHtml','typeunit');
//        $btn_insert=$this->getBtnInsert();
//        $btn_insert=$this->getBtnInsert();
//        print_r( $data);
		//echo $client[1]->uid;
        //取得pageHTML
        $pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\editor\\typeunit.html";
        $tdPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\editor\\td4.html";
        $pageHTML=$VTs->GetHtmlContent($pagePath);
        $tdHTML=$VTs->GetHtmlContent($tdPath);
        //塞入資料
     
         $tr='';
        foreach($data as $trData) {
            $td=$tdHTML;
            $td=str_replace('@@td1@@',$trData->uid,$td);
            $td=str_replace('@@td2@@',$trData->unit1,$td);
            $td=str_replace('@@td3@@',$trData->unit2,$td);
            $td=str_replace('@@td4@@',$trData->name,$td);
            $td=str_replace('@@selectval@@',$trData->typeid_a,$td);
            $td=str_replace('@@updata@@',$VTs->CreateModifyOptionBtn(["uid"=>$trData->uid], 'null', 'cls_input', 'cls_span','null'),$td);
            $tr.=$td;
        }
        $data = $VTs->json2data($VTs->UrlDataGet("http://127.0.0.1:88/editor/getdbdata?page=type_a"));
        $str='';
        foreach($data as $opData) {
            $str.='<option value='.$opData->uid.'>'.$opData->name.'</option>';
            }
        $tr=str_replace('@@select@@',$str,$tr);
        $pageHTML=str_replace('@@trlist@@',$tr,$pageHTML).$VTs->CreateInsertOptionBtn('tableid','editorpage/getaddhtml?type=0','null');
        //顯示畫面
        
		$pageContent = $pageHTML;
		//-----BI結束-----
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    public function getAddHtmlAction()
    {
        //session_start();
		$VTs = new clsSystem;
		$VTs->initialization();
		
		//-----BI開始----- typeunit 單位表IUD頁面
            $type=$_GET["type"];
        
            switch ($type){
                case '0':
                    $path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\editor\\typeunit_addlist.html";
                    $html=$VTs->GetHtmlContent($path);
                    $data = $VTs->json2data($VTs->UrlDataGet("http://127.0.0.1:88/editor/getdbdata?page=type_a"));
                    $str='';
                    foreach($data as $opData) {
                        $str.='<option value='.$opData->uid.'>'.$opData->name.'</option>';
                            }
                    $html=str_replace('@@select@@',$str,$html);
                    break;
            }
            $pageContent=$html.$VTs->CreateFinishOptionBtn(["uid"=>1], 'test/tw', 'inputClass', 'contentClass');
        //-----BI結束-----
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    private function getTagHtml($type){
        switch($type){
            case 'input':
                $path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\editor\\material\\input.html";
                break;
            case 'title':
                $path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\editor\\material\\title.html";
                break;
            case 'select':
                $path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\editor\\material\\select.html";
                break;
        }
 
        return $path;
    }
        private function getBtnInsert($VTs,$tbID,$addID,$actionUrl,$type){
            $path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\editor\\material\\btn_insert.html";
            $html=$VTs->GetHtmlContent($path);
            $html=str_replace('@@tbID@@',$tbID,$html);
            $html=str_replace('@@addID@@',$addID,$html);
            $html=str_replace('@@actionUrl@@',$actionUrl,$html);
            $html=str_replace('@@type@@',$type,$html);
        return $html;
    }

}
