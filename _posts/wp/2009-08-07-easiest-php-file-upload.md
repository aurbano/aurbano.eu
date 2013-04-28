---
title: Easiest PHP file upload
author: Alex
layout: post
permalink: /blog/2009/08/07/easiest-php-file-upload/
categories:
  - PHP
  - Programming
tags:
  - ajax
  - chat
  - class
  - control
  - handler
  - javascript
  - php
  - remote
  - upload
---
# 

Hello people,  
I want to share with all of you a file upload class I have developed, that makes it stupid simple to upload files haha

## The PHP class:

First of all, here is the PHP class you will need:

    <?php
    //Uploader class, by Alex
    // This class is meant to handle all kinds of file uploads for DJs Music
    // Images, music... all here
    
    class Uploader{
    	var $maxSize;
    	var $allowedExt;
    	var $fileInfo = array();
    	
    	function config($maxSize,$allowedExt){
    		$this->maxSize = $maxSize;
    		$this->allowedExt = $allowedExt;
    	}
    
    function generateRandStr($length){
          $randstr = "";
          for($i=0; $i< $length; $i  ){
             $randnum = mt_rand(0,61);
             if($randnum < 10){
                $randstr .= chr($randnum 48);
             }else if($randnum < 36){
                $randstr .= chr($randnum 55);
             }else{
                $randstr .= chr($randnum 61);
             }
          }
          return $randstr;
       }
    	
    	function check($uploadName){
    		if(isset($_FILES[$uploadName])){
    			$this->fileInfo['ext'] = substr(strrchr($_FILES[$uploadName]["name"], '.'), 1);
    			$this->fileInfo['name'] = basename($_FILES[$uploadName]["name"]);
    			$this->fileInfo['size'] = $_FILES[$uploadName]["size"];
    			$this->fileInfo['temp'] = $_FILES[$uploadName]["tmp_name"]; 
    			if($this->fileInfo['size']< $this->maxSize){
    				if(strlen($this->allowedExt)>0){
    					$exts = explode(',',$this->allowedExt);
    					if(in_array($this->fileInfo['ext'],$exts)){
    						return true;
    					}
    					echo 'Invalid file extension. Allowed extensions are '.$this->allowedExt;
    					return false; //failed ext
    				}
    				echo 'Sorry but there is an error in our server. Please try again later.';
    				return false; //All ext allowed
    			}else{
    				if($this->maxSize < 1000000){
    					$rsi = round($this->maxSize/1000,2).' Kb';
    				}else if($this->maxSize < 1000000000){
    					$rsi = round($this->maxSize/1000000,2).' Mb';
    				}else{
    					$rsi = round($this->maxSize/1000000000,2).' Gb';
    				}
    				echo 'File is too big. Maximum allowed size is '.$rsi;
    				return false; //failed size
    			}
    		}
    		echo 'Oops! An unexpected error occurred, please try again later.';
    		return false; //Either form not submitted or file/s not found
    	}
    	
    	function upload($name,$dir,$fname=false){
    		if(!is_dir($dir)){
    			echo 'Sorry but there is an error in our server. Please try again later.';
    			return false; //Directory doesn't exist! 
    		}
    		if($this->check($name)){
    			//Process upload. All info stored in array fileinfo:
    			//Dir OK, keep going:
    			//Get a new filename:
    			if(!$fname){
    				$this->fileInfo['fname'] = $this->generateRandStr(15).'.'.$this->fileInfo['ext'];
    			}else{
    				$this->fileInfo['fname'] = $fname;
    			}
    			while(file_exists($dir.$this->fileInfo['fname'])){
    				$this->fileInfo['fname'] = $this->generateRandStr(15).'.'.$this->fileInfo['ext'];
    			}
    			//Unique name gotten
    			// Move file:
    			if(@move_uploaded_file($this->fileInfo['temp'], $dir.$this->fileInfo['fname'])){
    				//Done
    				return true;
    			}else{
    				echo 'The file could not be uploaded, although everything went ok :S ... Please try again later.';
    				return false; //File not moved
    			}
    		}else{
    			return false;
    		}
    	}
    
    };
    //Initialize the object:
    $up = new Uploader;
    ?>

Alright this is the code. You shouldn’t have to modify it, simply include it where you process the upload and the class will initiate itself inside the variable *$up*

## Usage:

For this example I will suppose you have a basic HTML form as follows:

    

As you can see, the action is process.php, which is, in this example, where the picture upload will be processed.

In the file process.php we will first include the upload handler, then configure it, and finally try to upload the file *into the directory pictures/*. Please take into account that it **must be writable** (CHMOD 777)

process.php:

    <?php
    //include the class:
    include('handleUpload.php');
    $up->config('2000000','jpg,gif,png');
    if($up->upload('uploadPic','pictures/')){
    	echo 'File uploaded. File information:   
    ';
    	echo $up->fileInfo['ext'].'  
    ';
    	echo $up->fileInfo['name'].'  
    ';
    	echo $up->fileInfo['size'];
    }
    // If the file was not uploaded, the error will have been echoed automatically
    ?>
    

As you can see there is no *}else{* because the handler echoes the errors by itself. You can change this behavior easily by setting up your own function as desired.

In this example we have configured it to allow a maximum of **2000000 **bytes per upload, and only **jpg, gif, and png** pictures. 

Now that the file is uploaded you have some information about it in the $up object. The format (*$up->fileInfo['ext']*), the name (*$up->fileInfo['name']*), and finally the size in bytes (*$up->fileInfo['size']*).

The handler also generates a random name, and ensures it is not already in the directory. The new name is stored in the fileInfo array as mentioned above.

I hope you found this useful ![:)][1] 

 [1]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_smile.gif