import * as OTPAuth from 'otplib'
import QRCode from 'qrcode'

// Configure TOTP with 30-second window and 6-digit codes
OTPAuth.authenticator.options = {
  window: 1,
  step: 30,
  digits: 6,
}

export function generateSecret(): string {
  return OTPAuth.authenticator.generateSecret()
}

export function generateTOTP(secret: string): string {
  return OTPAuth.authenticator.generate(secret)
}

export function verifyTOTP(code: string, secret: string): boolean {
  return OTPAuth.authenticator.check(code, secret)
}

export function getTimeRemaining(): number {
  const now = Math.floor(Date.now() / 1000)
  const step = 30
  return step - (now % step)
}

export function generateTOTPUri(secret: string, name: string, issuer: string = 'MFA Share'): string {
  return OTPAuth.authenticator.keyuri(name, issuer, secret)
}

export async function generateQRCode(uri: string): Promise<string> {
  try {
    return await QRCode.toDataURL(uri)
  } catch {
    throw new Error('Failed to generate QR code')
  }
}

export function parseTOTPUri(uri: string): { secret: string; name: string; issuer: string } | null {
  try {
    const url = new URL(uri)
    if (url.protocol !== 'otpauth:' || url.host !== 'totp') {
      return null
    }
    
    const secret = url.searchParams.get('secret')
    const issuer = url.searchParams.get('issuer') || 'Unknown'
    const name = decodeURIComponent(url.pathname.slice(1))
    
    if (!secret || !name) {
      return null
    }
    
    return { secret, name, issuer }
  } catch {
    return null
  }
} 