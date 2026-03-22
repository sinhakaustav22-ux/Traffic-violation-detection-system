import { client, TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER } from '../config/twilio.js';
import { query } from '../config/db.js';
import { FINES } from '../constants/fines.js';

const composeMessage = (violationDetails) => {
  const { violation_type, location, created_at, vehicle_number, fine_amount } = violationDetails;
  const section = FINES[violation_type]?.section || 'Applicable Law';
  const dateStr = new Date(created_at).toLocaleString();
  
  return `CTVDS ALERT: ${violation_type} detected at ${location} on ${dateStr}. Vehicle: ${vehicle_number}. Fine: Rs.${fine_amount} under ${section}. Campus Traffic Authority.`;
};

export const sendSMSAlert = async (phoneNumber, violationDetails) => {
  if (!client) throw new Error('Twilio client not configured');
  const messageBody = composeMessage(violationDetails);
  
  try {
    const message = await client.messages.create({
      body: messageBody,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    await query(
      'INSERT INTO sms_alerts (violation_id, channel, sent_to, message_sid, status) VALUES ($1, $2, $3, $4, $5)',
      [violationDetails.id, 'SMS', phoneNumber, message.sid, 'SENT']
    );
    
    return message.sid;
  } catch (error) {
    await query(
      'INSERT INTO sms_alerts (violation_id, channel, sent_to, status) VALUES ($1, $2, $3, $4)',
      [violationDetails.id, 'SMS', phoneNumber, 'FAILED']
    );
    throw error;
  }
};

export const sendWhatsAppAlert = async (phoneNumber, violationDetails) => {
  if (!client) throw new Error('Twilio client not configured');
  const messageBody = composeMessage(violationDetails);
  
  try {
    const message = await client.messages.create({
      body: messageBody,
      from: TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phoneNumber}`
    });
    
    await query(
      'INSERT INTO sms_alerts (violation_id, channel, sent_to, message_sid, status) VALUES ($1, $2, $3, $4, $5)',
      [violationDetails.id, 'WHATSAPP', phoneNumber, message.sid, 'SENT']
    );
    
    return message.sid;
  } catch (error) {
    await query(
      'INSERT INTO sms_alerts (violation_id, channel, sent_to, status) VALUES ($1, $2, $3, $4)',
      [violationDetails.id, 'WHATSAPP', phoneNumber, 'FAILED']
    );
    throw error;
  }
};

export const sendBothAlerts = async (phoneNumber, violationDetails) => {
  const results = { sms: null, whatsapp: null };
  try {
    results.sms = await sendSMSAlert(phoneNumber, violationDetails);
  } catch (e) {
    results.sms = { error: e.message };
  }
  
  try {
    results.whatsapp = await sendWhatsAppAlert(phoneNumber, violationDetails);
  } catch (e) {
    results.whatsapp = { error: e.message };
  }
  
  return results;
};
