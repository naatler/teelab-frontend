async function GET() {
  return Response.json({ message: 'Payment webhook endpoint' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Webhook masuk:', body);

    // ✅ Forward ke Laravel
    const laravelResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/webhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-callback-token': process.env.XENDIT_CALLBACK_TOKEN ?? '',
        },
        body: JSON.stringify(body),
      }
    );

    if (!laravelResponse.ok) {
      const error = await laravelResponse.json();
      console.error('Laravel webhook error:', error);
      return Response.json({ error: 'Laravel error' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Webhook error' }, { status: 500 });
  }
}