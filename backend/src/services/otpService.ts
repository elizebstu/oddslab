import prisma from '../db/prisma';

// OTP expiry time in minutes
const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;

/**
 * Generate a random numeric OTP code
 */
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to email (mock implementation - logs to console)
 * In production, integrate with email service like SendGrid, AWS SES, etc.
 */
async function sendOtpEmail(email: string, code: string, type: string): Promise<void> {
  const purpose = type === 'login' ? 'login verification' : 'password reset';
  console.log(``);
  console.log(`====================================`);
  console.log(`[EMAIL MOCK] OTP for ${purpose}`);
  console.log(`To: ${email}`);
  console.log(`Code: ${code}`);
  console.log(`Expires in: ${OTP_EXPIRY_MINUTES} minutes`);
  console.log(`====================================`);
  console.log(``);

  // In production, use actual email service:
  // await sendEmail({
  //   to: email,
  //   subject: `Your Oddslab ${purpose} code`,
  //   text: `Your verification code is: ${code}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
  // });
}

/**
 * Create and send a new OTP code
 */
export async function createAndSendOtp(email: string, type: 'login' | 'reset_password'): Promise<void> {
  // Delete any existing unused OTPs of the same type for this email
  await prisma.otpCode.deleteMany({
    where: {
      email,
      type,
      used: false,
    },
  });

  // Generate new OTP
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Save to database
  await prisma.otpCode.create({
    data: {
      email,
      code,
      type,
      expiresAt,
    },
  });

  // Send email
  await sendOtpEmail(email, code, type);
}

/**
 * Verify an OTP code
 */
export async function verifyOtp(email: string, code: string, type: 'login' | 'reset_password'): Promise<boolean> {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      type,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Mark as used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return true;
}

/**
 * Get remaining time in seconds before OTP expires
 */
export async function getOtpExpiry(email: string, type: 'login' | 'reset_password'): Promise<number | null> {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      email,
      type,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(otpRecord.expiresAt);
  const remainingSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

  return Math.max(0, remainingSeconds);
}
