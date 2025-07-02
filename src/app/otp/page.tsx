
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { Mail } from 'lucide-react';
import { verifyOtp, resendOtp } from '@/services/user';

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [userInfo, setUserInfo] = useState<{ userId: string; email: string } | null>(null);
const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('otpUser');
    if (data) {
      setUserInfo(JSON.parse(data));
    } else {
      router.push('/');
    }
  }, []);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleResend = async () => {
  if (!userInfo?.email) return toast.error('User info missing');

  setLoading(true);
  try {
    await resendOtp(userInfo.email);
    toast.success('OTP resent');
  } catch (err) {
    toast.error('Failed to resend OTP');
  } finally {
    setLoading(false);
  }
};



  const handleVerify = async () => {
  if (otp.length !== 6) {
    toast.error('Please enter the full 6-digit OTP');
    return;
  }

  try {
    const res = await verifyOtp({ userId: userInfo?.userId, otp });

    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user)); // ✅ Save user with _id, name, email, etc.

    toast.success('OTP verified!');
    
    // Delay redirect so toast is visible
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Invalid or expired OTP');
  }
};


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* ✅ Local toaster to show OTP messages */}
      <Toaster position="top-center" />

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a one-time password to {userInfo?.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Label htmlFor="otp">Enter OTP</Label>
            <InputOTP maxLength={6} id="otp" value={otp} onChange={(val) => setOtp(val)}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button className="w-full" onClick={handleVerify}>
            Verify
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <Button
  variant="link"
  className="p-0 h-auto"
  onClick={handleResend}
  disabled={loading}
>
  {loading ? 'Sending...' : 'Resend'}
</Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
