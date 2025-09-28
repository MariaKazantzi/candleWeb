/**
 * Import function triggers from their respective submodules:
 *
 * const {onC    // Send email in both development and production
    // You'll need to configure this with your actual Yahoo credentials
    const transporter = nodemailer.createTransporter({
      service: 'yahoo',
      auth: {
        user: process.env.YAHOO_USER || config.email.yahoo.user,
        pass: process.env.YAHOO_APP_PASSWORD || config.email.yahoo.appPassword
      }
    });quire("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");
const config = require("./config");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Contact form submission handler
exports.sendContactEmail = onRequest({cors: true}, async (request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    response.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    // Handle both JSON and form data
    let name, email, phone, message;
    
    if (request.headers['content-type'] && request.headers['content-type'].includes('application/json')) {
      ({name, email, phone, message} = request.body);
    } else {
      // Handle form data
      name = request.body.name;
      email = request.body.email;
      phone = request.body.phone;
      message = request.body.message;
    }

    // Validate required fields
    if (!name || !email || !message) {
      response.status(400).json({
        success: false, 
        message: 'Please fill in all required fields.'
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      response.status(400).json({
        success: false, 
        message: 'Please enter a valid email address.'
      });
      return;
    }

    // Send email in both development and production
    // You'll need to configure this with your actual Yahoo credentials
      const transporter = nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: process.env.YAHOO_USER || config.email.yahoo.user, // Use from config.js
          pass: process.env.YAHOO_APP_PASSWORD || config.email.yahoo.appPassword // Use from config.js
        }
      });

    // Email content
    const mailOptions = {
      from: config.email.yahoo.user, // Use your actual Yahoo email as sender
      to: config.email.yahoo.user,
      replyTo: email,
      subject: 'New Contact Form Message from Simply Scented Website',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #8B5A3C; color: white; padding: 20px; text-align: center;">
            <h2>New Contact Form Message</h2>
            <p>Simply Scented Website</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px;">
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Name:</strong><br>
              ${name}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Email:</strong><br>
              ${email}
            </div>
            ${phone ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Phone:</strong><br>
              ${phone}
            </div>` : ''}
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Message:</strong><br>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #8B5A3C;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Received:</strong><br>
              ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      `
    };

    // Log the contact submission for development tracking
    logger.info(`📧 Contact form submission from: ${name} (${email})`);

    // Send email
    await transporter.sendMail(mailOptions);

    logger.info(`Contact form submission from: ${name} (${email})`);

    response.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.'
    });

  } catch (error) {
    logger.error('Error sending contact email:', error);
    response.status(500).json({
      success: false,
      message: 'There was an error sending your message. Please try again later.'
    });
  }
});
