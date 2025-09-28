<?php
// Prevent any output before JSON response
ob_start();

// Set error reporting to prevent warnings from being output
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Clean any output that might have been generated
ob_clean();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

// Validate required fields
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Sanitize input
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Email configuration
$to = 'mariakazantzi@yahoo.com'; // Your email address
$subject = 'New Contact Form Message from Simply Scented Website';

// Email body
$email_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8B5A3C; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #8B5A3C; }
        .value { margin-top: 5px; }
        .message-content { background-color: white; padding: 15px; border-left: 4px solid #8B5A3C; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>New Contact Form Message</h2>
            <p>Simply Scented Website</p>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>Name:</div>
                <div class='value'>{$name}</div>
            </div>
            <div class='field'>
                <div class='label'>Email:</div>
                <div class='value'>{$email}</div>
            </div>";

if (!empty($phone)) {
    $email_body .= "
            <div class='field'>
                <div class='label'>Phone:</div>
                <div class='value'>{$phone}</div>
            </div>";
}

$email_body .= "
            <div class='field'>
                <div class='label'>Message:</div>
                <div class='message-content'>{$message}</div>
            </div>
            <div class='field'>
                <div class='label'>Received:</div>
                <div class='value'>" . date('Y-m-d H:i:s') . "</div>
            </div>
        </div>
    </div>
</body>
</html>
";

// Email headers
$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: noreply@simplyscented.com',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

// Attempt to send email
try {
    $mail_sent = mail($to, $subject, $email_body, implode("\r\n", $headers));
    
    if ($mail_sent) {
        // Log the successful submission (optional)
        $log_entry = date('Y-m-d H:i:s') . " - Contact form submission from: {$name} ({$email})\n";
        file_put_contents('contact_logs.txt', $log_entry, FILE_APPEND | LOCK_EX);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Thank you for your message! We\'ll get back to you soon.'
        ]);
    } else {
        throw new Exception('Mail function returned false');
    }
} catch (Exception $e) {
    // Log the error
    $error_log = date('Y-m-d H:i:s') . " - Email sending failed: " . $e->getMessage() . "\n";
    file_put_contents('contact_error_logs.txt', $error_log, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'success' => false, 
        'message' => 'There was an error sending your message. Please try again later or contact us directly.'
    ]);
}

// End output buffering and send response
ob_end_flush();
?>