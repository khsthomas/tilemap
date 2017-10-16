<?
//echo $_GET['callback']."({\"layer\":\"".$_GET['LN']."\",\"version\":\"1\"})";
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL,$_GET['url4map']);
curl_setopt($ch, CURLOPT_POST, 0);
//curl_setopt($ch, CURLOPT_POSTFIELDS,"postvar1=value1&postvar2=value2&postvar3=value3");

// in real life you should use something like:
// curl_setopt($ch, CURLOPT_POSTFIELDS, 
//          http_build_query(array('postvar1' => 'value1')));

// receive server response ...
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$server_output = curl_exec ($ch);

curl_close ($ch);

print($server_output);
?>