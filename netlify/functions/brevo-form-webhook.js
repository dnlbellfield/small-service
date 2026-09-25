// Configure Netlify Forms to POST its submission webhook to this endpoint.
// Netlify retains the submission first; email failure therefore never loses the inquiry.
const clean = value => String(value || '').replace(/[<>]/g, '');
export default async request => {
  if (request.method !== 'POST') return new Response('Method not allowed', {status:405});
  const token = request.headers.get('x-email-clarity-webhook-token') || new URL(request.url).searchParams.get('token');
  if (!process.env.FORM_WEBHOOK_TOKEN || token !== process.env.FORM_WEBHOOK_TOKEN) return new Response('Unauthorized', {status:401});
  let payload; try { payload=await request.json(); } catch { return new Response('Invalid JSON',{status:400}); }
  const d=payload.data || payload; const field=d.data || d; const name=clean(field.name), email=clean(field.email), service=clean(field.service);
  if (!email || !name) return new Response('Missing required inquiry data',{status:400});
  const business=process.env.BUSINESS_NAME || 'Coastal Home Cleaning', reply=process.env.BUSINESS_EMAIL || 'hello@example.com', timeframe=process.env.RESPONSE_TIMEFRAME || 'one business day';
  const message={sender:{name:business,email:reply},to:[{email,name}],replyTo:{email:reply,name:business},subject:`We received your quote request — ${business}`,htmlContent:`<p>Hi ${name},</p><p>Thank you for requesting a quote from ${business}. We received your inquiry and expect to respond within ${timeframe}.</p><p>Your request is not an appointment booking. If you need to add anything, reply to this email or contact us at ${reply}.</p>`};
  const owner=process.env.OWNER_EMAIL; const details=['name','email','phone','service','zip','preferred_date','message'].map(k=>`<tr><th>${k}</th><td>${clean(field[k])}</td></tr>`).join('');
  const sends=[message]; if(owner) sends.push({sender:{name:business,email:reply},to:[{email:owner}],subject:`New quote request: ${service || 'service not specified'}`,htmlContent:`<h1>New quote request</h1><table>${details}</table>`});
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':process.env.BREVO_API_KEY,'content-type':'application/json'},body:JSON.stringify(sends)});
  if(!response.ok) return new Response('Email provider unavailable',{status:502});
  return new Response('Accepted',{status:202});
};
