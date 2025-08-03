<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require __DIR__ . '/../vendor/autoload.php'; // Adjust path if needed
$config = require __DIR__ . '/../env.php';    // Load credentials

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the JSON data from the request
$input = file_get_contents('php://input');
$orderData = json_decode($input, true);

if (!$orderData) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Your hardcoded email address
$adminEmail = 'mariakazantzi@yahoo.com'; 

// Email configuration
$subject = 'New Order Received - Order #' . $orderData['id'];
$emailContent = buildEmailContent($orderData);

$mail = new PHPMailer(true);
try {
    // SMTP configuration
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $config['GMAIL_USER']; // <-- Replace with your Gmail address
    $mail->Password = $config['GMAIL_PASS'];   // <-- Replace with your Gmail App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom($config['GMAIL_USER'], 'CandleWeb'); // <-- Replace with your Gmail address
    $mail->addAddress($adminEmail);

    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $emailContent;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Order email sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Mailer Error: ' . $mail->ErrorInfo]);
}

function buildEmailContent($order) {
    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>New Order - #' . htmlspecialchars($order['id']) . '</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .order-info { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .customer-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .items-table th { background-color: #f8f9fa; }
            .total-section { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .final-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Order Received</h1>
                <p><strong>Order ID:</strong> #' . htmlspecialchars($order['id']) . '</p>
                <p><strong>Order Date:</strong> ' . date('F j, Y g:i A', strtotime($order['date'])) . '</p>
            </div>

            <div class="customer-info">
                <h2>Customer Information</h2>
                <p><strong>Name:</strong> ' . htmlspecialchars($order['customer']['firstName']) . ' ' . htmlspecialchars($order['customer']['lastName']) . '</p>
                <p><strong>Email:</strong> ' . htmlspecialchars($order['customer']['email']) . '</p>
                <p><strong>Phone:</strong> ' . htmlspecialchars($order['customer']['phone']) . '</p>
                <p><strong>Address:</strong><br>
                   ' . htmlspecialchars($order['customer']['address']) . '<br>
                   ' . htmlspecialchars($order['customer']['city']) . ', ' . htmlspecialchars($order['customer']['postalCode']) . '<br>
                   ' . htmlspecialchars($order['customer']['country']) . '
                </p>
            </div>

            <div class="order-info">
                <h2>Order Items</h2>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Details</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>';

    foreach ($order['items'] as $item) {
        $itemTotal = $item['price'] * $item['quantity'];
        $html .= '
                        <tr>
                            <td>' . htmlspecialchars($item['name']) . '</td>
                            <td>Color: ' . htmlspecialchars($item['color']) . '<br>Scent: ' . htmlspecialchars($item['scent']) . '</td>
                            <td>' . htmlspecialchars($item['quantity']) . '</td>
                            <td>€' . number_format($item['price'], 2) . '</td>
                            <td>€' . number_format($itemTotal, 2) . '</td>
                        </tr>';
    }

    $html .= '
                    </tbody>
                </table>
            </div>

            <div class="total-section">
                <h2>Order Summary</h2>
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>€' . number_format($order['subtotal'], 2) . '</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>€' . number_format($order['shipping'], 2) . '</span>
                </div>
                <div class="total-row final-total">
                    <span>Total:</span>
                    <span>€' . number_format($order['total'], 2) . '</span>
                </div>
            </div>

            <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
                <p><strong>Note:</strong> This is an automated email notification of a new order. Please process this order according to your standard procedures.</p>
            </div>
        </div>
    </body>
    </html>';

    return $html;
}
?>
