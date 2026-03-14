# AI Backend Reference - FinWise Financial PWA

## SDK Choice: z-ai-web-dev-sdk (TypeScript/Node.js)

This SDK is already installed in your environment and is ideal for Next.js API routes.

---

## 1. Available API Methods

### Chat Completions (Main Chatbot)

```typescript
import ZAI from 'z-ai-web-dev-sdk';

const zai = await ZAI.create();

// Basic chat
const completion = await zai.chat.completions.create({
  messages: [
    { role: 'assistant', content: 'You are FinWise, a financial assistant.' },
    { role: 'user', content: 'What is my net worth?' }
  ],
  thinking: { type: 'disabled' }
});

console.log(completion.choices[0]?.message?.content);
```

### Vision (Receipt Scanning, OCR)

```typescript
const completion = await zai.chat.completions.createVision({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Extract transaction details from this receipt' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } }
    ]
  }],
  thinking: { type: 'disabled' }
});
```

### Text-to-Speech (Voice Output)

```typescript
const response = await zai.audio.tts.create({
  input: 'Your net worth is ₹12,45,890',
  voice: 'tongtong',
  speed: 1.0,
  response_format: 'wav',
  stream: false
});

const arrayBuffer = await response.arrayBuffer();
const buffer = Buffer.from(new Uint8Array(arrayBuffer));
```

### Speech-to-Text (Voice Input)

```typescript
const response = await zai.audio.asr.create({
  file_base64: audioBase64String
});

console.log(response.text); // Transcribed text
```

### Image Generation (Goal Visualization)

```typescript
const response = await zai.images.generations.create({
  prompt: 'Dream home in Goa, modern villa with swimming pool',
  size: '1024x1024'
});

const imageBase64 = response.data[0].base64;
```

### Web Search (Real-time Stock Prices)

```typescript
const searchResult = await zai.functions.invoke("web_search", {
  query: "RELIANCE stock price today",
  num: 5
});

// searchResult is array of { url, name, snippet, host_name, rank, date, favicon }
```

---

## 2. Lite Plan Limits & Optimization

### Constraints
```
- RPM: ~3-5 requests per minute
- TPM: ~40,000 tokens per minute
- Max tokens per request: ~4,000
```

### Rate Limiting Strategy

```typescript
// lib/rate-limiter.ts
export class RateLimiter {
  private requests: number[] = [];
  private maxRPM: number;
  private windowMs: number = 60000;

  constructor(maxRPM: number = 3) {
    this.maxRPM = maxRPM;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);

    if (this.requests.length >= this.maxRPM) {
      const waitTime = this.windowMs - (now - this.requests[0]);
      if (waitTime > 0) {
        await new Promise(r => setTimeout(r, waitTime));
      }
    }

    this.requests.push(Date.now());
  }
}

export const aiRateLimiter = new RateLimiter(3);
```

---

## 3. API Endpoints for Next.js

### File Structure
```
/app/api/
├── chat/
│   └── route.ts           # Main chatbot
├── categorize/
│   └── route.ts           # Transaction categorization
├── insights/
│   └── route.ts           # Financial insights
├── vision/
│   └── receipt/
│       └── route.ts       # Receipt scanning
├── voice/
│   ├── stt/
│   │   └── route.ts       # Speech to text
│   └── tts/
│       └── route.ts       # Text to speech
└── search/
    └── route.ts           # Web search (stocks)
```

### Main Chat Endpoint

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: any = null;
const conversations = new Map<string, any[]>();

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, financialContext } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const zai = await getZAI();

    // Build system prompt with financial context
    const systemPrompt = `You are FinWise, a friendly AI financial assistant.

User's Financial Snapshot:
- Net Worth: ₹${financialContext?.netWorth?.toLocaleString() || 'N/A'}
- Monthly Income: ₹${financialContext?.monthlyIncome?.toLocaleString() || 'N/A'}
- Monthly Expenses: ₹${financialContext?.monthlyExpenses?.toLocaleString() || 'N/A'}
- Active Goals: ${financialContext?.goals?.length || 0}

Guidelines:
1. Be concise (2-3 sentences max)
2. When user wants to DO something, return an action card JSON
3. Suggest relevant actions based on financial data

Action Card Format:
{
  "type": "action_card",
  "action": "create_goal|transfer|set_budget",
  "data": { ... parameters ... },
  "message": "Summary for user to confirm"
}`;

    // Get conversation history
    let history = conversations.get(sessionId) || [];

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        ...history,
        { role: 'user', content: message }
      ],
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content;

    // Update history
    history.push(
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    );
    if (history.length > 10) history = history.slice(-10);
    conversations.set(sessionId, history);

    // Check for action card
    let actionCard = null;
    try {
      const parsed = JSON.parse(response);
      if (parsed.type === 'action_card') {
        actionCard = parsed;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      response,
      actionCard,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat error:', error);

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Please wait and try again', retryAfter: 20 },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

### Receipt Scanning Endpoint

```typescript
// app/api/vision/receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 });
    }

    const zai = await getZAI();

    const completion = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this receipt and extract as JSON:
{
  "merchant": "store name",
  "amount": 1234.56,
  "date": "YYYY-MM-DD",
  "category": "food|shopping|utilities|transport|other",
  "items": [{"name": "item", "price": 100}]
}`
          },
          {
            type: 'image_url',
            image_url: {
              url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
            }
          }
        ]
      }],
      thinking: { type: 'disabled' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Web Search for Stocks

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const zai = await getZAI();

    const results = await zai.functions.invoke("web_search", {
      query,
      num: 5
    });

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### TTS for Voice Output

```typescript
// app/api/voice/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { text, speed = 1.0 } = await req.json();

    if (!text || text.length > 1024) {
      return NextResponse.json(
        { error: 'Text required (max 1024 chars)' },
        { status: 400 }
      );
    }

    const zai = await getZAI();

    const response = await zai.audio.tts.create({
      input: text,
      voice: 'tongtong',
      speed: speed,
      response_format: 'wav',
      stream: false
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 4. Transaction Categorization (Optimized)

### Hybrid Approach: Rules + AI Fallback

```typescript
// services/categorizer.ts

const CATEGORIES = {
  food: ['swiggy', 'zomato', 'restaurant', 'cafe', 'pizza', 'dominos', 'mcdonalds'],
  transport: ['uber', 'ola', 'petrol', 'fuel', 'metro', 'railway', 'irctc'],
  shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'reliance', 'bigbasket'],
  utilities: ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge', 'bsnl'],
  entertainment: ['netflix', 'spotify', 'prime', 'hotstar', 'bookmyshow'],
  health: ['hospital', 'pharmacy', 'apollo', 'medicines', '1mg'],
  investment: ['mutual fund', 'sip', 'zerodha', 'groww', 'upstox'],
  income: ['salary', 'credit', 'transfer from']
};

// Rule-based (FREE, instant)
function quickCategorize(narration: string): string | null {
  const lower = narration.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }
  return null;
}

// AI fallback (uses API)
async function aiCategorize(zai: any, narration: string, amount: number): Promise<string> {
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: 'Transaction categorizer. Respond with category only.' },
      { role: 'user', content: `Categorize: "${narration}" ₹${amount}. Categories: ${Object.keys(CATEGORIES).join(', ')}` }
    ],
    thinking: { type: 'disabled' }
  });

  const result = completion.choices[0]?.message?.content?.toLowerCase();
  return Object.keys(CATEGORIES).includes(result) ? result : 'other';
}

// Main function
export async function categorizeTransaction(zai: any, narration: string, amount: number): Promise<string> {
  // Try rule-based first (saves API call)
  const quick = quickCategorize(narration);
  if (quick) return quick;

  // Fall back to AI
  return await aiCategorize(zai, narration, amount);
}
```

---

## 5. Available Models

| Model | Use Case | SDK Method |
|-------|----------|------------|
| `glm-5` | General chat, fast | `model: "glm-5"` |
| `glm-4.7` | Advanced reasoning | `model: "glm-4.7"` |
| `glm-4.6v` | Vision (images) | `createVision()` |
| `cogvideox-3` | Video generation | `videos.generations()` |
| `cogview-4` | Image generation | `images.generations()` |

---

## 6. Frontend Integration

### React Hook for Chat

```typescript
// hooks/useAIChat.ts
import { useState, useCallback } from 'react';

export function useAIChat(sessionId: string) {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    actionCard?: any;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text: string, financialContext: any) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId, financialContext })
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        actionCard: data.actionCard
      }]);

    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return { messages, isLoading, sendMessage };
}
```

---

## 7. Cost Estimation (Lite Plan)

| Feature | Calls/Day | Calls/Month | Optimization |
|---------|-----------|-------------|--------------|
| Chatbot | 500 | 15,000 | Context caching |
| Categorization | 100 | 3,000 | Rule-based first (80% saved) |
| Receipt Scan | 50 | 1,500 | Cache results |
| **Total** | | **~19,500** | Well within limits |

---

## Next Steps

1. **Implement API routes** using the code above
2. **Build frontend** with the React hook
3. **Test with mock data** first
4. **Add rate limiting** before production
5. **Monitor usage** and optimize
