<?php 
	header('content-type: application/json; charset=utf-8');
	if (!isset($_GET['last'])) { $endpoint = 'https://nunofcguerreiro.com/api-euromillions-xml?result=all'; }
	else { $endpoint = 'https://nunofcguerreiro.com/api-euromillions-xml'; }
	/* 2014-10-31 = 10 - 13 - 20 - 33 - 41 + 3 - 9 */
	/* $s minus date */
	$s = file_get_contents($endpoint);
	$s = simplexml_load_string($s);
	echo json_encode($s);
	
?>