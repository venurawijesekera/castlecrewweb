import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

// NOTE: Since we don't have a direct SMTP/Email provider configured yet,
// we will simulate the behavior and log the request.
// In a production environment, you would use a service like Resend, SendGrid, or Postmark.

export async function POST(request: NextRequest) {
    try {
        const body: any = await request.json();
        const { firstName, lastName, email, phone, subject, message } = body;

        // Validation
        if (!firstName || !email || !phone || !message) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        console.log("Contact Form Submission Received:", {
            to: "info@castlecrew.cc",
            cc: "info.castlecrewlk@gmail.com",
            from: `${firstName} ${lastName} <${email}>`,
            phone: phone,
            subject: `Website Inquiry: ${subject}`,
            body: message
        });

        // SIMULATION: In a real Cloudflare Workers/Pages environment, 
        // you would use fetch() to send a request to an email API.

        // Example with a generic fetch (hypothetical):
        /*
        await fetch('https://api.emailservice.com/send', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
            body: JSON.stringify({ ... })
        });
        */

        return NextResponse.json({
            success: true,
            message: "Your message has been sent successfully!"
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
