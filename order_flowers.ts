import 'dotenv/config';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

async function main() {
  // Initialize Stagehand with Browserbase
  const stagehand = new Stagehand({
    env: "BROWSERBASE", // Use Browserbase cloud browsers
    projectId: '89303595-5220-4e1a-b681-47873827457b',
    apiKey: process.env.BROWSERBASE_API_KEY!,
    modelName: "gpt-4o", // You can also use "claude-3-5-sonnet-20241022" or "gemini-2.0-flash-exp" 
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY!, // Add your OpenAI API key
    }
  });

  await stagehand.init();
  const page = stagehand.page;

  try {
    console.log("Starting flower ordering automation...");

    // 1. Navigate to flower site
    await page.goto('http://www.flowerssf.com/?utm_source=openai', { waitUntil: 'domcontentloaded' });
    console.log("✓ Navigated to flower site");

    // 2. Search for flowers using natural language
    await page.act(`Search for "${process.env.FLOWER_PRODUCT_KEYWORDS}" in the search box`);
    await page.waitForTimeout(2000); // Allow search results to load
    console.log("✓ Searched for flowers");

    // 3. Select the first flower product
    await page.act("Click on the first flower product in the search results");
    console.log("✓ Selected flower product");

    // 4. Customize flower options (size, delivery date, etc.)
    // Try to select medium size if available
    try {
      await page.act("Select medium size if size options are available");
      console.log("✓ Selected medium size");
    } catch (e) {
      console.log("• No size options found, continuing...");
    }

    // Try to select delivery date if available
    try {
      await page.act("Select a delivery date for next week if date picker is available");
      console.log("✓ Selected delivery date");
    } catch (e) {
      console.log("• No delivery date picker found, continuing...");
    }

    // 5. Add to cart
    await page.act("Add this flower arrangement to cart");
    await page.waitForTimeout(1000);
    console.log("✓ Added flowers to cart");

    // 6. Go to checkout
    await page.act("Go to checkout or proceed to checkout");
    await page.waitForTimeout(2000);
    console.log("✓ Navigated to checkout");

    // 7. Use Stagehand agent for complex form filling
    const agent = stagehand.agent();
    
    console.log("Using AI agent to fill shipping information...");
    await agent.execute(`
      Fill out the recipient shipping information with the following details:
      - Name: ${process.env.FLOWER_RECIPIENT_NAME}
      - Address: ${process.env.FLOWER_RECIPIENT_ADDRESS1}
      - City: ${process.env.FLOWER_RECIPIENT_CITY}
      - State: ${process.env.FLOWER_RECIPIENT_STATE}
      - ZIP: ${process.env.FLOWER_RECIPIENT_ZIP}
      - Phone: ${process.env.FLOWER_RECIPIENT_PHONE}
    `);
    console.log("✓ Filled shipping information");

    // 8. Add gift message if field exists
    try {
      await page.act(`Add gift message: "${process.env.FLOWER_CARD_MESSAGE}"`);
      console.log("✓ Added gift message");
    } catch (e) {
      console.log("• No gift message field found, continuing...");
    }

    // 9. Continue to payment
    await page.act("Continue to payment or proceed to payment");
    await page.waitForTimeout(2000);
    console.log("✓ Proceeded to payment section");

    // 10. Fill payment information using agent for complex form handling
    console.log("Using AI agent to fill payment information...");
    await agent.execute(`
      Fill out the payment information with the following details:
      - Card Number: ${process.env.PAYMENT_CARD_NUMBER}
      - Expiration: ${process.env.PAYMENT_CARD_EXP}
      - CVV/CVC: ${process.env.PAYMENT_CARD_CVC}
      - Billing ZIP: ${process.env.PAYMENT_CARD_ZIP}
      
      Handle any iframes or embedded payment forms as needed.
    `);
    console.log("✓ Filled payment information");

    // 11. Extract order summary before submitting
    const orderSummary = await page.extract({
      instruction: "Extract the order total, item details, and delivery information",
      schema: z.object({
        total: z.string().describe("The total price of the order"),
        items: z.string().describe("Description of flower items"),
        deliveryInfo: z.string().describe("Delivery date and recipient info"),
      }),
    });

    console.log("\n📋 Order Summary:");
    console.log(`Total: ${orderSummary.total}`);
    console.log(`Items: ${orderSummary.items}`);
    console.log(`Delivery: ${orderSummary.deliveryInfo}`);

    // 12. STOP HERE - Don't actually submit (this is a dry run)
    console.log("\n🛑 DRY RUN COMPLETE - Order ready but not submitted");
    console.log("To submit, uncomment the line below and run again:");
    console.log("// await page.act('Submit order' or 'Place order');");

    // Uncomment this line ONLY when you're ready to actually place the order:
    // await page.act("Submit the order or place the order");

  } catch (error) {
    console.error("❌ Error during flower ordering:", error);
    throw error;
  } finally {
    await stagehand.close();
    console.log("🏁 Browser session closed");
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
