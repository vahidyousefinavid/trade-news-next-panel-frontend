import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, category } = await req.json();
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const key = process.env.ANTHROPIC_API_KEY;

  if (key) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 900,
          messages: [{
            role: 'user',
            content: `یک خبر اقتصادی و تجاری فارسی حرفه‌ای بنویس.
عنوان: ${title}
${category ? `دسته‌بندی: ${category}` : ''}

خروجی را دقیقاً به این فرمت JSON برگردان (بدون هیچ توضیح اضافه):
{
  "summary": "خلاصه یک پاراگرافی خبر (حداکثر ۱۵۰ کلمه)",
  "content": "متن کامل خبر به فارسی (حداقل ۳ پاراگراف، هر پاراگراف با خط جدید جدا شده)"
}`,
          }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text || '';
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json(parsed);
          }
        } catch {}
      }
    } catch {}
  }

  /* ── Demo mode (no API key or Claude call failed) ── */
  const demoContent = getDemoContent(title, category);
  return NextResponse.json(demoContent);
}

function getDemoContent(title: string, category: string) {
  const summaries: Record<string, string> = {
    بورس:      `بازار سهام در پی تحولات اخیر اقتصادی با نوسانات قابل توجهی روبرو شد. ${title} از جمله مهم‌ترین رویدادهایی است که معامله‌گران را به دقت بیشتر واداشته است. کارشناسان اقتصادی با تحلیل وضعیت موجود، راهکارهای مختلفی را برای مدیریت ریسک پیشنهاد می‌دهند.`,
    ارز:       `بازار ارز در روزهای اخیر شاهد تغییرات محسوسی بوده است. ${title} یکی از عواملی است که بر نرخ‌های برابری تأثیر مستقیم داشته. سیاست‌های ارزی بانک مرکزی در این خصوص مورد توجه تحلیلگران قرار گرفته است.`,
    default:   `${title} یکی از مهم‌ترین رویدادهای اقتصادی هفته جاری به شمار می‌رود. این موضوع از زوایای مختلف توسط کارشناسان اقتصادی مورد بررسی قرار گرفته و آثار قابل توجهی بر فضای کسب‌وکار داشته است.`,
  };

  const catKey = Object.keys(summaries).find(k => category?.includes(k)) || 'default';
  const summary = summaries[catKey];

  const content = `${title}

در روزهای اخیر، ${title.toLowerCase()} به یکی از محوری‌ترین موضوعات در فضای اقتصادی و تجاری کشور تبدیل شده است. کارشناسان و فعالان اقتصادی با دقت این رویداد را رصد می‌کنند و تحلیل‌های گوناگونی از آن ارائه داده‌اند.

از دیدگاه اقتصادی، این موضوع می‌تواند تأثیرات چندجانبه‌ای داشته باشد. برخی تحلیلگران معتقدند که آثار مثبت این رویداد در میان‌مدت به‌وضوح قابل مشاهده خواهد بود، در حالی که گروهی دیگر نسبت به پیامدهای احتمالی آن هشدار می‌دهند. مطالعات انجام شده نشان می‌دهد که اثرگذاری این رویداد بر بازارهای مرتبط قابل توجه بوده است.

نهادها و سازمان‌های ذیربط نیز در این خصوص واکنش‌هایی داشته‌اند و اقداماتی را برای مدیریت شرایط در دستور کار قرار داده‌اند. فعالان اقتصادی انتظار دارند که در هفته‌های آینده وضوح بیشتری در این زمینه حاصل شود.

در سطح کلان، این رویداد در چارچوب تحولات اقتصادی منطقه و جهان قابل ارزیابی است. کارشناسان توصیه می‌کنند که فعالان بازار با رصد دقیق تحولات، تصمیمات آگاهانه‌ای اتخاذ نمایند.`;

  return { summary, content };
}
