import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { FINES } from '../constants/fines.js';
import dotenv from 'dotenv';
dotenv.config();

const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const generateChallan = (violation, challan, officerName) => {
  return new Promise((resolve, reject) => {
    try {
      createDir('challans');
      const pdfPath = path.join('challans', `${challan.challan_number}.pdf`);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);
      
      const collegeName = process.env.COLLEGE_NAME || 'Campus Traffic Authority';
      
      // HEADER
      doc.fontSize(20).font('Helvetica-Bold').text('CAMPUS TRAFFIC VIOLATION CHALLAN', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(16).font('Helvetica').text(collegeName, { align: 'center' });
      doc.moveDown(1);
      
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);
      
      const dateStr = new Date(challan.issued_at).toLocaleDateString();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Challan No: ${challan.challan_number}`, 50, doc.y, { continued: true });
      doc.text(`Date: ${dateStr}`, { align: 'right' });
      doc.moveDown(2);
      
      // VIOLATION DETAILS
      doc.fontSize(14).font('Helvetica-Bold').text('Violation Information', 50, doc.y, { underline: true });
      doc.moveDown(1);
      
      const details = [
        { label: 'Violation Type', value: violation.violation_type.replace(/_/g, ' ') },
        { label: 'Legal Section', value: FINES[violation.violation_type]?.section || 'N/A' },
        { label: 'Location', value: violation.location },
        { label: 'Date & Time', value: new Date(violation.created_at).toLocaleString() },
        { label: 'Vehicle Number', value: violation.vehicle_number },
        { label: 'Vehicle Type', value: violation.vehicle_type },
        { label: 'Confidence Score', value: `${(violation.confidence_score * 100).toFixed(1)}%` }
      ];
      
      doc.fontSize(12).font('Helvetica');
      details.forEach(detail => {
        doc.font('Helvetica-Bold').text(`${detail.label}:`, 50, doc.y, { continued: true, width: 150 });
        doc.font('Helvetica').text(`  ${detail.value}`, 200, doc.y);
        doc.moveDown(0.5);
      });
      
      doc.moveDown(1);
      
      // FINE DETAILS
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);
      
      doc.fontSize(14).font('Helvetica-Bold').text(`Fine Amount: Rs. ${violation.fine_amount}/-`, 50, doc.y);
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('Payable within 60 days to Campus Traffic Authority');
      doc.moveDown(0.5);
      doc.text('Payment note: Contact college administrative office');
      
      doc.moveDown(4);
      
      // FOOTER
      const footerY = doc.page.height - 150;
      doc.fontSize(12).font('Helvetica');
      doc.text(`Issued by: ${officerName}`, 50, footerY);
      doc.text('Authorized Signatory', 400, footerY);
      doc.moveTo(400, footerY - 5).lineTo(545, footerY - 5).stroke();
      
      doc.fontSize(10).font('Helvetica-Oblique').text('This is a computer-generated document — CTVDS v1.0', 50, doc.page.height - 50, { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(pdfPath);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};
