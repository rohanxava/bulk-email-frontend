// 'use client';
 
// import { useForm } from 'react-hook-form';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-hot-toast';
// import { login } from '@/services/user';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Mail } from 'lucide-react';
 
// const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
//     <title>Google</title>
//     <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.72 1.9-4.26 0-7.75-3.5-7.75-7.75s3.49-7.75 7.75-7.75c2.44 0 4.01 1.02 4.9 1.9l2.73-2.73C19.01 1.02 16.12 0 12.48 0 5.88 0 .04 5.88.04 12.48s5.84 12.48 12.44 12.48c6.92 0 12-4.84 12-12.28 0-.8-.08-1.56-.2-2.28H12.48z" />
//   </svg>
// );
 
// export default function LoginPage() {
//   const router = useRouter();
//   const {
//     register,
//     handleSubmit,
//     formState: { isSubmitting },
//   } = useForm();
 
//  const onSubmit = async (data: any) => {
//   try {
//     const res = await login(data);

//     // Save userId and email to sessionStorage or pass via router
//     sessionStorage.setItem('otpUser', JSON.stringify({
//       userId: res.userId,
//       email: res.email
//     }));

//     toast.success('OTP sent to your email');
//     router.push('/otp'); // navigate to OTP page
//   } catch (error: any) {
//     toast.error(error?.response?.data?.message || 'Login failed');
//   }
// };

 
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-background p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="flex justify-center items-center mb-4">
//             <Mail className="h-8 w-8 text-primary" />
//           </div>
//           <CardTitle className="text-2xl font-bold">Welcome to Agency MailFlow</CardTitle>
//           <CardDescription>Sign in to access your dashboard</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" type="email" placeholder="m@example.com" required {...register('email')} />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input id="password" type="password" required {...register('password')} />
//             </div>
//             <Button type="submit" className="w-full" disabled={isSubmitting}>
//               {isSubmitting ? 'Logging in...' : 'Login'}
//             </Button>
//             <Button asChild variant="outline" className="w-full">
//               <Link href="/dashboard">
//                 <GoogleIcon className="mr-2 h-4 w-4" />
//                 Sign in with Google
//               </Link>
//             </Button>
//           </form>
 
//           <div className="mt-4 text-center text-sm">
//             Don&apos;t have an account?{' '}
//             <Link href="/signup" className="underline">
//               Sign up
//             </Link>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
 
 'use client';

import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { login } from '@/services/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.72 1.9-4.26 0-7.75-3.5-7.75-7.75s3.49-7.75 7.75-7.75c2.44 0 4.01 1.02 4.9 1.9l2.73-2.73C19.01 1.02 16.12 0 12.48 0 5.88 0 .04 5.88.04 12.48s5.84 12.48 12.44 12.48c6.92 0 12-4.84 12-12.28 0-.8-.08-1.56-.2-2.28H12.48z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const res = await login(data);

      sessionStorage.setItem('otpUser', JSON.stringify({
        userId: res.userId,
        email: res.email
      }));

      toast.success('OTP sent to your email');

      // Delay before navigation to let toast show
      setTimeout(() => {
        router.push('/otp');
      }, 500);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* ✅ Local toaster to render messages */}
      <Toaster position="top-center" />

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to XAVA MailFlow</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required {...register('password')} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            {/* <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">
                <GoogleIcon className="mr-2 h-4 w-4" />
                Sign in with Google
              </Link>
            </Button> */}
          </form>

          {/* <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
