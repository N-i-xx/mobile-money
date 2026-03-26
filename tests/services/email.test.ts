import { EmailService } from "../../src/services/email";
import nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("EmailService", () => {
  let emailService: EmailService;
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: "123" });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });
    
    // Reset env
    process.env.NODE_ENV = "development";
    process.env.SMTP_HOST = "smtp.test.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASS = "pass";
    
    emailService = new EmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send a transaction receipt email", async () => {
    const mockTransaction = {
      id: "tx-123",
      referenceNumber: "REF-123",
      type: "deposit",
      amount: "100.00",
      phoneNumber: "+237670000000",
      provider: "mtn",
      stellarAddress: "GABC...",
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    await emailService.sendTransactionReceipt("user@example.com", mockTransaction);

    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "user@example.com",
      subject: expect.stringContaining("REF-123"),
      html: expect.stringContaining("100.00 XAF"),
    }));
  });

  it("should send a transaction failure email", async () => {
    const mockTransaction = {
      id: "tx-456",
      referenceNumber: "REF-456",
      type: "withdraw",
      amount: "50.00",
      phoneNumber: "+237670000001",
      provider: "orange",
      stellarAddress: "GDEF...",
      status: "failed",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    await emailService.sendTransactionFailure("user@example.com", mockTransaction, "Insufficient funds");

    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "user@example.com",
      subject: expect.stringContaining("REF-456"),
      html: expect.stringContaining("Insufficient funds"),
    }));
  });

  it("should skip email sending in test environment", async () => {
    process.env.NODE_ENV = "test";
    
    await emailService.sendEmail({
      to: "test@test.com",
      subject: "test",
      html: "test",
      text: "test"
    });

    expect(mockSendMail).not.toHaveBeenCalled();
  });
});
