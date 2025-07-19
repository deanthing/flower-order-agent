import 'dotenv/config';
import { Stagehand } from '@browserbasehq/stagehand';
import { Browserbase } from '@browserbasehq/sdk';
import { z } from 'zod';

async function main() {
  // Initialize Browserbase SDK for live session access
  const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY!,
  });

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

    // 7. INTERRUPT AT CHECKOUT STAGE - Get live link for manual completion
    console.log("\n🛒 CHECKOUT STAGE REACHED - MANUAL INTERVENTION REQUIRED");
    
    try {
      // Try multiple ways to get the session ID
      let sessionId: string | null = null;
      
      // Method 1: Try to get from Stagehand context
      sessionId = (stagehand as any).sessionId || (stagehand as any).context?.sessionId || (stagehand as any)._sessionId;
      
      // Method 2: If not found, get the most recent active session
      if (!sessionId) {
        console.log("🔍 Searching for active session...");
        const sessions = await bb.sessions.list();
        const activeSessions = sessions.filter((session: any) => session.status === 'RUNNING');
        if (activeSessions.length > 0) {
          // Get the most recent active session
          sessionId = activeSessions[activeSessions.length - 1].id;
          console.log(`✓ Found active session: ${sessionId}`);
        }
      }
      
      if (sessionId) {
        // Get live view link from Browserbase
        const liveViewLinks = await bb.sessions.debug(sessionId);
        const liveViewLink = liveViewLinks.debuggerFullscreenUrl;
        
        console.log("\n🔗 BROWSERBASE LIVE LINK:");
        console.log(`👆 Click here to take control: ${liveViewLink}`);
        console.log("\nYou can now:");
        console.log("- Fill in shipping information");
        console.log("- Add gift messages");
        console.log("- Fill in your credit card information");
        console.log("- Complete the payment process");
        console.log("- Submit the order when ready");
        console.log("\n⚠️  The browser session will remain open for manual completion");
        console.log("⚠️  Remember to close this script when done to end the session");
        
        // Keep the session alive for manual completion
        console.log("\n⏳ Session is live and waiting for manual completion...");
        console.log("Press Ctrl+C to end the session when finished");
        
        // Keep the process alive indefinitely until user interrupts
        await new Promise(() => {
          process.on('SIGINT', () => {
            console.log('\n\n👋 Session ending...');
            stagehand.close().then(() => {
              console.log('🏁 Browser session closed');
              process.exit(0);
            });
          });
        });
        
      } else {
        console.log("❌ Could not retrieve session ID for live link");
        console.log("💡 The browser session is still active - you can find it in your Browserbase dashboard");
        console.log("📱 Go to: https://dashboard.browserbase.com/sessions");
        console.log("Please complete checkout manually and then press Ctrl+C to end this script");
        
        // Keep the process alive
        await new Promise(() => {
          process.on('SIGINT', () => {
            console.log('\n\n👋 Session ending...');
            stagehand.close().then(() => {
              console.log('🏁 Browser session closed');
              process.exit(0);
            });
          });
        });
      }
    } catch (error) {
      console.error("❌ Error getting live view link:", error);
      console.log("💡 The browser session is still active - you can find it in your Browserbase dashboard");
      console.log("📱 Go to: https://dashboard.browserbase.com/sessions");
      console.log("Please complete checkout manually and then press Ctrl+C to end this script");
      
      // Keep the process alive
      await new Promise(() => {
        process.on('SIGINT', () => {
          console.log('\n\n👋 Session ending...');
          stagehand.close().then(() => {
            console.log('🏁 Browser session closed');
            process.exit(0);
          });
        });
      });
    }

  } catch (error) {
    console.error("❌ Error during flower ordering:", error);
    console.log("🏁 Closing browser session due to error");
    await stagehand.close();
    throw error;
  }
  // Note: Browser session intentionally kept open for manual checkout completion
  // Session will be closed when user presses Ctrl+C
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
