import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img
            src="/assets/images/tesajalogo.jpg"
            alt="Logo"
            className="h-full w-full rounded-md object-cover"
            {...props}
        />
    );
}
