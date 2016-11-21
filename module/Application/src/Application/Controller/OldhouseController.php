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

class OldhouseController extends AbstractActionController
{
    public function reportAction(){
        //echo "targetid:".$_GET["targetid"];
        $VTs = new clsSystem;
        $VTs->initialization('oldhouseDB');
        
        //-----BI開始-----  
        try{
            $page = $_GET["page"];

            #序號
            $no = 1;

            switch($page){
                case "main_page":
                    $html_path=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\oldhouse\\table-2.html";
                    #主頁面
                    $html=$VTs->GetHtmlContent($html_path);

                    #檢驗基本資料
                    $strSQL = "select t2.`hname`, t2.`htel`, t2.`hmobil`,
                                       t2.`ZipCode`, t2.`City`, t2.`Area`, t2.`Vil`, t2.`Verge`, t2.`Road`, t2.`addr`,
                                       t3.desc 'strType', t1.`htmid1`, t1.`htmid2`, t5.desc 'type', t1.date, t8.name 'ename', t7.`licenseid` 'license'
                               from qc_info as t1
                                    left join qc_house as t2 on t2.uid = t1.`huid`
                                        left join house_type as t3 on t3.`uid` = t1.htid
                                    left join house_type_structure as t5 on t5.uid = t1.htsid
                                    left join `eng_engineer_city` as t6 on t6.uid = t2.`ecid`
                                    left join `eng_engineer` as t7 on t7.uid = t6.`eid`
                                        left join `ass_common` as t8 on t8.uid = t7.`cmid`
                               where huid = ".$_GET["targetid"]."
                               limit 1";
                    $data = $VTs->QueryData($strSQL);
                //$VTs->Debug($data);

                    $scale1 = (!empty($data[0]["htmid1"])) ? " ".$data[0]["htmid1"]." ": " _ ";
                    $scale2 = (!empty($data[0]["htmid2"])) ? " ".$data[0]["htmid2"]." ": " _ ";
                    #主頁面基本資料置換
                    $dataArr = [
                        "owner" => $data[0]["hname"],
                        "tel" => $data[0]["htel"],
                        "mobile" => $data[0]["hmobil"],
                        "addr" => $data[0]["ZipCode"]." ".$data[0]["City"]." ".$data[0]["Area"]." ".$data[0]["Vil"]." ".$data[0]["Verge"]." ".$data[0]["Road"]." ".$data[0]["addr"],
                        "strType" => $data[0]["strType"],
                        "scale" => "地上".$scale1."層  地下".$scale2."層",
                        "type" => $data[0]["type"],
                        "date" => $data[0]["date"],
                        "ename" => $data[0]["ename"],
                        "license" => $data[0]["license"]
                    ];
                    $html = $VTs->ContentReplace($dataArr,$html);
                //print_r($html);

                    #主頁面量化資料欄位
                    $quantity_tr_path = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\oldhouse\\tr1.html";
                    $quantity_tr = $VTs->GetHtmlContent($quantity_tr_path);

                    $strSQL="SELECT t1.uid,
                            t10.`desc` as eng_str, t11.`desc` as problem, t1.`length`, t1.`width`, t1.`depth`, t1.`area`,
                             t1.`remark`, t13.`imgfile`, t12.unit1 level
                            FROM qc_item AS t1
                             LEFT JOIN qc_info AS t2 ON t2.uid = t1.ifid
                             LEFT JOIN qc_house AS t3 ON t3.uid = t2.huid
                              LEFT JOIN house_type AS t4 ON t4.uid = t2.htid
                             LEFT JOIN house_type_model AS t5 ON t5.uid = t2.htmid1 OR t5.uid = t2.htmid2
                             LEFT JOIN house_type_structure AS t6 ON t6.uid = t2.htsid
                             LEFT JOIN eng_engineer_city AS t7 ON t7.uid = t3.ecid
                             LEFT JOIN eng_engineer AS t8 ON t8.uid = t7.eid
                             LEFT JOIN ass_common AS t9 ON t9.uid = t8.cmid
                             LEFT JOIN eng_str AS t10 ON t10.`uid` = t1.`strid`
                             LEFT JOIN qc_checkitem AS t11 ON t11.uid = t1.ciid
                             LEFT JOIN eng_unit AS t12 ON t12.uid = t1.val
                             LEFT JOIN img_picture AS t13 ON t13.`uid` = t1.`imgids`
                            WHERE t2.huid = ".$_GET["targetid"]." AND (t1.`length` > 0 OR t1.width > 0 OR t1.depth > 0 OR t1.`area` > 0)
                            ORDER BY t1.val DESC, t1.uid ASC";
                    $data = $VTs->QueryData($strSQL);
                //$VTs->Debug($data[0]);
                //print_r(count($data));
                    $quantity_html = "";

                    for ($i=0; $i < count($data); $i++) {
                        //$VTs->Debug($data[$i]);
                        $tr = $quantity_tr;
                        if($data[$i]["area"] != 0){
                             $value = "面積：".$data[$i]["area"];
                        }else{
                             $value = "長：".$data[$i]["length"]." 寬：".$data[$i]["width"]." 高：".$data[$i]["depth"];
                        }

                        #讀圖檔
                        $filePath = "C:\\xampp\\htdocs\\AP-Service\\public\\old_house_img\\";
                        //$filePath = "D:\\php_dev\\AP-Service\\public\\old_house_img\\";
                        $filePath .= $data[$i]["imgfile"];
                        //print_r($filePath);
                        if(file_exists($filePath)){
                            $imgArr = $VTs->GetINIInfo($filePath,"","","",true);
                        //$VTs->debug($imgArr["img0"]);
                            // $img = "<img src='".$imgArr["img0"]."' width='60%' />
                            //         <img src='".$imgArr["img1"]."' width='60%' />
                            //         <img src='".$imgArr["img2"]."' width='60%' />";
                            $img = count($imgArr) . "張";
                        }else{
                            $img = "0張";
                        }

                        #替換@@
                        $dataArr = [
                            "no" => $no++,
                            "eng_str" => $data[$i]["eng_str"],
                            "problem" => $data[$i]["problem"],
                            "value" => $value,
                            "remark" => $data[$i]["remark"],
                            "photo" => $img,
                            "level" => $data[$i]["level"]
                        ];
                        $tr = $VTs->ContentReplace($dataArr,$tr);


                        $quantity_html .= $tr;
                    }
                    #量化資料End

                    #質化資料
                    $quality_tr_path = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\oldhouse\\tr2.html";
                    $quality_tr = $VTs->GetHtmlContent($quality_tr_path);
                    
                    $strSQL = "SELECT t1.uid,
                                    t10.`desc` as eng_str, t11.`desc` as problem, t1.`length`, t1.`width`, t1.`depth`, t1.`area`,
                                    t1.`remark`, t13.`imgfile`, t12.unit1 level
                                FROM qc_item AS t1
                                    LEFT JOIN qc_info AS t2 ON t2.uid = t1.ifid
                                    LEFT JOIN qc_house AS t3 ON t3.uid = t2.huid
                                    LEFT JOIN house_type AS t4 ON t4.uid = t2.htid
                                    LEFT JOIN house_type_model AS t5 ON t5.uid = t2.htmid1 OR t5.uid = t2.htmid2
                                    LEFT JOIN house_type_structure AS t6 ON t6.uid = t2.htsid
                                    LEFT JOIN eng_engineer_city AS t7 ON t7.uid = t3.ecid
                                    LEFT JOIN eng_engineer AS t8 ON t8.uid = t7.eid
                                    LEFT JOIN ass_common AS t9 ON t9.uid = t8.cmid
                                    LEFT JOIN eng_str AS t10 ON t10.`uid` = t1.`strid`
                                    LEFT JOIN qc_checkitem AS t11 ON t11.uid = t1.ciid
                                    LEFT JOIN eng_unit AS t12 ON t12.uid = t1.val
                                    LEFT JOIN img_picture AS t13 ON t13.`uid` = t1.`imgids`
                                WHERE t2.huid = ".$_GET["targetid"]." AND (t1.`length` = 0 and t1.width = 0 and t1.depth = 0 and t1.`area` = 0)
                                ORDER BY t1.val DESC, t1.uid ASC";
                    $data = $VTs->QueryData($strSQL);
                //$VTs->Debug($data);

                    $quality_html = "";

                    for ($i=0; $i < count($data); $i++) {
                        //$VTs->Debug($data[$i]);
                        $tr = $quality_tr;

                        #讀圖檔
                        $filePath = "C:\\xampp\\htdocs\\AP-Service\\public\\old_house_img\\";
                        //$filePath = "D:\\php_dev\\AP-Service\\public\\old_house_img\\";
                        $filePath .= $data[$i]["imgfile"];
                        //print_r($filePath);
                        if(file_exists($filePath)){
                            $imgArr = $VTs->GetINIInfo($filePath,"","","",true);
                        //$VTs->debug($imgArr["img0"]);
                            // $img = "<img src='".$imgArr["img0"]."' width='60%' />
                            //         <img src='".$imgArr["img1"]."' width='60%' />
                            //         <img src='".$imgArr["img2"]."' width='60%' />";
                            $img = count($imgArr) . "張";
                        }else{
                            $img = "0張";
                        }

                        $dataArr = [
                            "no" => $no++,
                            "eng_str" => $data[$i]["eng_str"],
                            "problem" => $data[$i]["problem"],
                            "value" => $value,
                            "remark" => $data[$i]["remark"],
                            "photo" => $img,
                            "level" => $data[$i]["level"]
                        ];
                        $tr = $VTs->ContentReplace($dataArr,$tr);

                        $quality_html .= $tr;
                    }
                    #值化資料End

                $dataArr = [
                    "quantity"=> $quantity_html,
                    "quality" => $quality_html
                ];
                $html = $VTs->ContentReplace($dataArr,$html);   
            //print_r($html);

                //$pageContent=$VTs->Data2Json($d);
                $pageContent=$html;
                    break;
                case "img_page":
                    #圖片頁面
                    $img_html_path = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\oldhouse\\table-3.html";
                    $img_html = $VTs->GetHtmlContent($img_html_path);
                    $img_page_path = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\oldhouse\\img_page.html";
                    $img_page = $VTs->GetHtmlContent($img_page_path);

                    #表頭資料
                    $strSQL = "select t2.`hname`, t2.`htel`, t2.`hmobil`,
                                       t2.`ZipCode`, t2.`City`, t2.`Area`, t2.`Vil`, t2.`Verge`, t2.`Road`, t2.`addr`,
                                       t3.desc 'strType', t1.`htmid1`, t1.`htmid2`, t5.desc 'type', t1.date, t8.name 'ename', t7.`licenseid` 'license'
                               from qc_info as t1
                                    left join qc_house as t2 on t2.uid = t1.`huid`
                                        left join house_type as t3 on t3.`uid` = t1.htid
                                    left join house_type_structure as t5 on t5.uid = t1.htsid
                                    left join `eng_engineer_city` as t6 on t6.uid = t2.`ecid`
                                    left join `eng_engineer` as t7 on t7.uid = t6.`eid`
                                        left join `ass_common` as t8 on t8.uid = t7.`cmid`
                               where huid = ".$_GET["targetid"]."
                               limit 1";
                    $data = $VTs->QueryData($strSQL);

                    #圖片頁面header置換
                    $img_header_path = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\oldhouse\\img_header.html";
                    $img_header = $VTs->GetHtmlContent($img_header_path);

                    $dataArr = [
                        "addr" => $data[0]["ZipCode"]." ".$data[0]["City"]." ".$data[0]["Area"]." ".$data[0]["Vil"]." ".$data[0]["Verge"]." ".$data[0]["Road"]." ".$data[0]["addr"],
                        "date" => $data[0]["date"],
                        "ename" => $data[0]["ename"],
                        "license" => $data[0]["license"]
                    ];
                    $img_header = $VTs->ContentReplace($dataArr,$img_header);
                //print_r($img_header);

                    #量化資料
                    #主頁面量化資料欄位
                    $img_content_path = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\oldhouse\\img_content.html";
                    $img_content = $VTs->GetHtmlContent($img_content_path);
                //print_r($img_content);
                    $strSQL="SELECT t1.uid,
                            t10.`desc` as eng_str, t11.`desc` as problem, t1.`length`, t1.`width`, t1.`depth`, t1.`area`,
                             t1.`remark`, t13.`imgfile`, t12.unit1 level
                            FROM qc_item AS t1
                             LEFT JOIN qc_info AS t2 ON t2.uid = t1.ifid
                             LEFT JOIN qc_house AS t3 ON t3.uid = t2.huid
                              LEFT JOIN house_type AS t4 ON t4.uid = t2.htid
                             LEFT JOIN house_type_model AS t5 ON t5.uid = t2.htmid1 OR t5.uid = t2.htmid2
                             LEFT JOIN house_type_structure AS t6 ON t6.uid = t2.htsid
                             LEFT JOIN eng_engineer_city AS t7 ON t7.uid = t3.ecid
                             LEFT JOIN eng_engineer AS t8 ON t8.uid = t7.eid
                             LEFT JOIN ass_common AS t9 ON t9.uid = t8.cmid
                             LEFT JOIN eng_str AS t10 ON t10.`uid` = t1.`strid`
                             LEFT JOIN qc_checkitem AS t11 ON t11.uid = t1.ciid
                             LEFT JOIN eng_unit AS t12 ON t12.uid = t1.val
                             LEFT JOIN img_picture AS t13 ON t13.`uid` = t1.`imgids`
                            WHERE t2.huid = ".$_GET["targetid"]." AND (t1.`length` > 0 OR t1.width > 0 OR t1.depth > 0 OR t1.`area` > 0)
                            ORDER BY t1.val DESC, t1.uid ASC";
                    $data = $VTs->QueryData($strSQL);
                //$VTs->Debug($data);
                    $quantity_page = "";

                    for ($i=0; $i < count($data); $i++) {
                        //$VTs->Debug($data[$i]);
                        $content = $img_content;
                    //print_r($content);
                        if($data[$i]["area"] != 0){
                             $value = "面積：".$data[$i]["area"];
                        }else{
                             $value = "長：".$data[$i]["length"]." 寬：".$data[$i]["width"]." 高：".$data[$i]["depth"];
                        }

                        #讀圖檔
                        $filePath = "C:\\xampp\\htdocs\\AP-Service\\public\\old_house_img\\";
                        //$filePath = "D:\\php_dev\\AP-Service\\public\\old_house_img\\";
                        $filePath .= $data[$i]["imgfile"];
                    //print_r("量化圖檔：".$filePath);
                        if(file_exists($filePath)){
                            $imgArr = $VTs->GetINIInfo($filePath,"","","",true);
                        //$VTs->debug($imgArr["img0"]);
                            $img0 = $imgArr["img0"];
                            $img1 = $imgArr["img1"];
                            $img2 = $imgArr["img2"];                            
                        }else{
                            $img0 = "";
                            $img1 = "";
                            $img2 = "";
                        }

                        #替換@@
                        $dataArr = [
                            "no" => $no++,
                            "eng_str" => $data[$i]["eng_str"],
                            "problem" => $data[$i]["problem"],
                            "value" => $value,
                            "remark" => $data[$i]["remark"],
                            "level" => $data[$i]["level"],
                            "img0" => $img0,
                            "img1" => $img1,
                            "img2" => $img2,
                        ];
                        $content = $VTs->ContentReplace($dataArr,$content);
                    //print_r($content);

                        $quantity_page .= $img_header . $content;
                    }

                //print_r($quantity_page);
                    #量化資料End

                    #質化資料
                                       
                    $strSQL = "SELECT t1.uid,
                                    t10.`desc` as eng_str, t11.`desc` as problem, t1.`length`, t1.`width`, t1.`depth`, t1.`area`,
                                    t1.`remark`, t13.`imgfile`, t12.unit1 level
                                FROM qc_item AS t1
                                    LEFT JOIN qc_info AS t2 ON t2.uid = t1.ifid
                                    LEFT JOIN qc_house AS t3 ON t3.uid = t2.huid
                                    LEFT JOIN house_type AS t4 ON t4.uid = t2.htid
                                    LEFT JOIN house_type_model AS t5 ON t5.uid = t2.htmid1 OR t5.uid = t2.htmid2
                                    LEFT JOIN house_type_structure AS t6 ON t6.uid = t2.htsid
                                    LEFT JOIN eng_engineer_city AS t7 ON t7.uid = t3.ecid
                                    LEFT JOIN eng_engineer AS t8 ON t8.uid = t7.eid
                                    LEFT JOIN ass_common AS t9 ON t9.uid = t8.cmid
                                    LEFT JOIN eng_str AS t10 ON t10.`uid` = t1.`strid`
                                    LEFT JOIN qc_checkitem AS t11 ON t11.uid = t1.ciid
                                    LEFT JOIN eng_unit AS t12 ON t12.uid = t1.val
                                    LEFT JOIN img_picture AS t13 ON t13.`uid` = t1.`imgids`
                                WHERE t2.huid = ".$_GET["targetid"]." AND (t1.`length` = 0 and t1.width = 0 and t1.depth = 0 and t1.`area` = 0)
                                ORDER BY t1.val DESC, t1.uid ASC";
                    $data = $VTs->QueryData($strSQL);
                //$VTs->Debug($data);

                    $quality_page = "";

                    for ($i=0; $i < count($data); $i++) {
                        //$VTs->Debug($data[$i]);
                        $content = $img_content;

                        #讀圖檔
                        $filePath = "C:\\xampp\\htdocs\\AP-Service\\public\\old_house_img\\";
                        //$filePath = "D:\\php_dev\\AP-Service\\public\\old_house_img\\";
                        $filePath .= $data[$i]["imgfile"];
                    //print_r("質化圖檔：".$filePath);
                        if(file_exists($filePath)){
                            $imgArr = $VTs->GetINIInfo($filePath,"","","",true);
                        //$VTs->debug($imgArr["img0"]);
                            $img0 = $imgArr["img0"];
                            $img1 = $imgArr["img1"];
                            $img2 = $imgArr["img2"];
                        }else{
                            $img0 = "";
                            $img1 = "";
                            $img2 = "";
                        }

                        $dataArr = [
                            "no" => $no++,
                            "eng_str" => $data[$i]["eng_str"],
                            "problem" => $data[$i]["problem"],
                            "value" => $value,
                            "remark" => $data[$i]["remark"],
                            "photo" => $img,
                            "level" => $data[$i]["level"],
                            "img0" => $img0,
                            "img1" => $img1,
                            "img2" => $img2
                        ];
                        $content = $VTs->ContentReplace($dataArr,$content);

                        $quality_page .= $img_header . $content;
                    }
                    #值化資料End

                    // $dataArr = [
                    //     "img_header" => $img_header,
                    //     "img_content" => $img_content
                    // ];
                    // $img_page = $VTs->ContentReplace($dataArr,$img_page);

                    $dataArr = [
                        "img_page" => $quantity_page . $quality_page
                    ];
                    $img_html = $VTs->ContentReplace($dataArr,$img_html);

                    $pageContent=$img_html;
                    break;
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
   

    public function ListAction(){
        $VTs = new clsSystem;
        $VTs->initialization('oldhouseDB');
        
        try{
        //-----BI開始-----
            $strSQL = "SELECT t2.`hname`, t2.`htel`, t2.`hmobil`,
                               t2.`ZipCode`, t2.`City`, t2.`Area`, t2.`Vil`, t2.`Verge`, t2.`Road`, t2.`addr`,
                               t3.desc 'strType', t4.desc 'scale', t5.desc 'type', t1.date, t8.name 'ename', t7.`licenseid` 'license'
                        FROM qc_info AS t1
                            LEFT JOIN qc_house AS t2 ON t2.uid = t1.`huid`
                            LEFT JOIN house_type AS t3 ON t3.`uid` = t1.htid
                            LEFT JOIN house_type_model AS T4 ON t4.uid = t1.`htmid1`
                            LEFT JOIN house_type_structure AS t5 ON t5.uid = t1.htsid
                            LEFT JOIN `eng_engineer_city` AS t6 ON t6.uid = t2.`ecid`
                            LEFT JOIN `eng_engineer` AS t7 ON t7.uid = t6.`eid`
                            LEFT JOIN `ass_common` AS t8 ON t8.uid = t7.`cmid`";
            $data = $VTs->QueryData($strSQL);
            //$VTs->Debug($data);

            //$Path = "D:\\php_dev\\AP-Service\\public\\old_house_pdf\\";
            $Path = "..\\old_house_pdf\\";
            $link_html = "";

            if(!empty($data)){
                foreach ($data as $key => $value) {
                    $mainFile = $Path . $value["hname"]."-".$value["htel"].".pdf";
                    $imgsFile = $Path . $value["hname"]."-".$value["htel"]."-imgs.pdf";
                    //$link = $value["hname"]."-".$value["htel"]."<a href = '".$filePath."'>下載PDF</a><br>";
                    $link = $value["ZipCode"].$value["City"].$value["Area"].$value["Vil"].$value["Verge"].$value["Road"].$value["addr"]."<a href = '".$mainFile."'>下載PDF</a>_<a href = '".$imgsFile."'>下載PDF</a><br>";
                    $link_html .= $link;
                }
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
        $this->viewContnet['pageContent'] = $link_html;
        return new ViewModel($this->viewContnet);
    }
}
