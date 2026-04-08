


async function GET() {
  return Response.json({ message: 'Payment webhook endpoint' });
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('Webhook masuk:', body);

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Webhook error' }, { status: 500 });
  }
}