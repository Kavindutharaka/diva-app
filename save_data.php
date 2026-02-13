<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Only POST allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$name  = isset($input['name'])  ? trim($input['name'])  : '';
$tp    = isset($input['tp'])    ? trim($input['tp'])    : '';
$score = isset($input['score']) ? intval($input['score']) : 0;

// Sri Lankan time (Asia/Colombo = UTC+5:30)
date_default_timezone_set('Asia/Colombo');
$dt = date('Y-m-d H:i:s');

$file = __DIR__ . '/save_data.csv';

if (!file_exists($file)) {
    $fp = fopen($file, 'w');
    fputcsv($fp, ['name', 'tp', 'score', 'dt']);
    fclose($fp);
}

$fp = fopen($file, 'a');
if ($fp) {
    fputcsv($fp, [$name, $tp, $score, $dt]);
    fclose($fp);
    echo json_encode(['status' => 'success', 'message' => 'Data saved']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Could not open file']);
}
?>
