# Browser Agent Playground - Flower Ordering Automation

This project uses **Stagehand** for natural language browser automation to
automatically order flowers online. Stagehand is absolutely goated for making
browser automation more resilient and easier to maintain!

## Features

- 🌹 **Natural Language Automation**: Uses Stagehand to control the browser with
  simple English commands
- 🧠 **AI-Powered**: Leverages LLMs to understand webpage structure and adapt to
  changes
- ☁️ **Browserbase Integration**: Runs on cloud browsers for reliability and
  scalability
- 🛡️ **Safe by Default**: Runs in dry-run mode to prevent accidental orders
- 📊 **Order Summary**: Extracts and displays order details before submission

## Prerequisites

1. **Browserbase Account**: Sign up at
   [browserbase.com](https://browserbase.com)
2. **OpenAI API Key**: Get one from
   [platform.openai.com](https://platform.openai.com)
3. **Node.js**: Version 16 or higher

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**: Create a `.env` file with the following
   variables:
   ```bash
   # Browserbase Configuration
   BROWSERBASE_API_KEY=your_browserbase_api_key_here

   # LLM Provider API Key (required for Stagehand)
   OPENAI_API_KEY=your_openai_api_key_here

   # Flower Order Details
   FLOWER_PRODUCT_KEYWORDS=roses valentine bouquet
   FLOWER_CARD_MESSAGE=Happy Valentine's Day! Love you!

   # Recipient Information
   FLOWER_RECIPIENT_NAME=Jane Doe
   FLOWER_RECIPIENT_ADDRESS1=123 Main Street
   FLOWER_RECIPIENT_CITY=San Francisco
   FLOWER_RECIPIENT_STATE=CA
   FLOWER_RECIPIENT_ZIP=94102
   FLOWER_RECIPIENT_PHONE=555-123-4567

   # Payment Information (Use test/sandbox credentials only!)
   PAYMENT_CARD_NUMBER=4111111111111111
   PAYMENT_CARD_EXP=12/26
   PAYMENT_CARD_CVC=123
   PAYMENT_CARD_ZIP=94102
   ```

## Running the Script

### Development Mode (Dry Run)

```bash
npm run dev
```

This will run through the entire flow but **stop before submitting** the order.

### Production Mode

1. First test in dry run mode
2. Verify all details in the order summary
3. Uncomment the final submission line in `order_flowers.ts`
4. Run again to actually place the order

## How It Works

The script uses Stagehand's natural language capabilities:

1. **Navigation**: Goes to the flower website
2. **Search**: Uses `page.act()` to search for flowers
3. **Selection**: Picks the first product from results
4. **Customization**: Selects size and delivery options
5. **Cart**: Adds flowers to cart
6. **Checkout**: Navigates to checkout
7. **Forms**: Uses Stagehand agent to fill shipping/payment forms
8. **Summary**: Extracts order details with `page.extract()`
9. **Dry Run**: Stops before final submission

## Key Advantages of Stagehand

- **Resilient**: Adapts to website changes automatically
- **Natural**: Write automation in plain English
- **Powerful**: Handles complex forms and iframes seamlessly
- **Controllable**: Mix AI automation with precise Playwright controls

## Safety Notes

⚠️ **Important**:

- The script runs in dry-run mode by default
- Use only test/sandbox payment credentials
- Never commit real payment info to version control
- Test thoroughly before any production use

## Customizing LLM Provider

You can switch LLM providers by changing the `modelName` in `order_flowers.ts`:

```typescript
modelName: "gpt-4o", // OpenAI GPT-4o
// modelName: "claude-3-5-sonnet-20241022", // Anthropic Claude
// modelName: "gemini-2.0-flash-exp", // Google Gemini
```

## Troubleshooting

- **"Cannot find module"**: Run `npm install`
- **API Key errors**: Check your `.env` file
- **Timeout issues**: The site might be slow; increase timeout values
- **Element not found**: Stagehand should adapt, but some sites have anti-bot
  measures

## Learn More

- [Stagehand Documentation](https://docs.stagehand.dev)
- [Browserbase Documentation](https://docs.browserbase.com)
- [Example Stagehand Projects](https://github.com/browserbase/stagehand/tree/main/examples)
