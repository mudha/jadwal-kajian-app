import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET() {
    try {
        if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
            console.error('ImageKit keys missing in server');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const authenticationParameters = imagekit.getAuthenticationParameters();
        return NextResponse.json({
            ...authenticationParameters,
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
        });
    } catch (error) {
        console.error('ImageKit Auth Error:', error);
        return NextResponse.json({ error: 'Failed to generate auth parameters' }, { status: 500 });
    }
}
