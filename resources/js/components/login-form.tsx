import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                    Enter your email below to login to your account
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                </Button>

                {/* <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <a href="/register" className="underline underline-offset-4">
                        Sign up
                    </a>
                </p> */}
            </div>
        </form>
    );
}
