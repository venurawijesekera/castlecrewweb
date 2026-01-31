import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Env } from "@/lib/runtime";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const body: any = await request.json();
        const { firstName, lastName, email, phone, subject, message } = body;

        // Validation
        if (!firstName || !email || !phone || !message) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        const ctx = getRequestContext();
        const env = ctx.env as unknown as Env;

        if (!env.RESEND_API_KEY) {
            console.error("Missing RESEND_API_KEY");
            return NextResponse.json({ error: "Email service misconfigured" }, { status: 500 });
        }

        // Send via Resend REST API
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'Castle Crew <onboarding@resend.dev>', // Keep as onboarding for now unless domain is verified
                to: ['info@castlecrew.cc', 'info.castlecrewlk@gmail.com'],
                reply_to: email,
                subject: `Website Inquiry: ${subject}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #f00000; margin-bottom: 20px;">New Website Inquiry</h2>
                        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="white-space: pre-wrap;"><strong>Message:</strong><br/>${message}</p>
                    </div>
                `
            })
        });

        const resData = await res.json();

        if (!res.ok) {
            console.error("Resend API Error:", resData);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Your message has been sent successfully!"
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
