<?php 
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

function is_valid_callback($subject)
{
    $identifier_syntax
      = '/^[$_\p{L}][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}]*+$/u';

    $reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
      'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue', 
      'for', 'switch', 'while', 'debugger', 'function', 'this', 'with', 
      'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum', 
      'extends', 'super', 'const', 'export', 'import', 'implements', 'let', 
      'private', 'public', 'yield', 'interface', 'package', 'protected', 
      'static', 'null', 'true', 'false');

    return preg_match($identifier_syntax, $subject)
        && ! in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words);
}

$url ="../data/ffGeoJson.json";

if ( isset($_GET['mode']) ) {
	switch($_GET['mode']) {
		case "summary":
			$url = "../data/ffSummarizedDir.json";
			break;
		case "geojson":
			$url ="../data/ffGeoJson.json";
			break;
		default:
			$url ="../data/ffGeoJson.json";
			break;
	}
}

$data = file_get_contents($url);
$json = json_encode($data);
$json = json_decode($json);

# JSON if no callback
if( ! isset($_GET['callback']) )
    exit($json);

# JSONP if valid callback
if(is_valid_callback($_GET['callback']))
    header('Content-Type: application/javascript', true);
    exit("{$_GET['callback']}($json)");

# Otherwise, bad request
header('status: 400 Bad Request', true, 400);

