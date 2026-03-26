import nodemailer from "nodemailer";
import { Transaction } from "../models/transaction";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      console.log("Skipping email send in test environment");
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Mobile Money" <no-reply@mobilemoney.com>',
        ...options,
      });
    } catch (error) {
      console.error("Email delivery failed:", error);
      // We don't throw here to prevent blocking the transaction flow
      // but in a real app, we might want to retry or log to a dedicated service
    }
  }

  async sendTransactionReceipt(email: string, transaction: Transaction): Promise<void> {
    const subject = `Transaction Receipt - ${transaction.referenceNumber}`;
    const html = this.getReceiptHtml(transaction);
    const text = `Your transaction of ${transaction.amount} ${transaction.type === 'deposit' ? 'to' : 'from'} ${transaction.stellarAddress} was successful. Reference: ${transaction.referenceNumber}`;

    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendTransactionFailure(email: string, transaction: Transaction, reason: string): Promise<void> {
    const subject = `Transaction Failed - ${transaction.referenceNumber}`;
    const html = this.getFailureHtml(transaction, reason);
    const text = `Your transaction of ${transaction.amount} failed. Reason: ${reason}. Reference: ${transaction.referenceNumber}`;

    await this.sendEmail({ to: email, subject, html, text });
  }

  private getReceiptHtml(transaction: Transaction): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4a90e2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          .details { margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 4px; }
          .amount { font-size: 24px; font-weight: bold; color: #2ecc71; text-align: center; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Transaction Successful</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Your ${transaction.type} has been processed successfully.</p>
          <div class="details">
            <div class="amount">${transaction.amount} XAF</div>
            <p><strong>Reference:</strong> ${transaction.referenceNumber}</p>
            <p><strong>Provider:</strong> ${transaction.provider.toUpperCase()}</p>
            <p><strong>Phone:</strong> ${transaction.phoneNumber}</p>
            <p><strong>Wallet:</strong> ${transaction.stellarAddress}</p>
            <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
          </div>
          <p>Thank you for using Mobile Money!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mobile Money Inc. All rights reserved.
        </div>
      </body>
      </html>
    `;
  }

  private getFailureHtml(transaction: Transaction, reason: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          .error-box { background: #fdf2f2; border: 1px solid #fbd5d5; color: #9b1c1c; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Transaction Failed</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Unfortunately, your ${transaction.type} could not be completed at this time.</p>
          <div class="error-box">
            <strong>Reason:</strong> ${reason}
          </div>
          <p><strong>Reference:</strong> ${transaction.referenceNumber}</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mobile Money Inc. All rights reserved.
        </div>
      </body>
      </html>
    `;
  }
}
