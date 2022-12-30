// This file is applicable for Schengen countries only which has a URL - visa.vfsglobal.com

const puppeteer = require(`puppeteer`);
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
  authStrategy: new LocalAuth()
});

//
//Center - 9 
// Category - auto-select
// sub category { 
  // Business - 1 
  // tourist - 3
//}


//Country and login Details 
const COUNTRY = require(`../models/countries`);
const LOGIN_DETAILS = require(`../models/login-details`);
let visaCategory = '';

(async () => {
  // ----- connecting whatsapp client ------
  await client.on('qr', qr => {
      qrcode.generate(qr, {small: true});
  });

  await client.on('ready', () => {
      console.log('Client is ready!');
  });

  await client.initialize();

  // ----- connecting whatsapp client ended ------


  // -----------Creating browser and page ------------
  const browser = await puppeteer.launch({
    headless: false
  });

  // Create a page
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(1000000000); 

  // Login site 
  await page.goto(COUNTRY.SWISS.VFS_URL);

  // -----------Creating browser and page ended ------------
  await page.waitForNavigation({waitUntil :'networkidle2'});
  await page.waitForTimeout(3000)

  // -----------Logging in----------------
  //Setting Email
  await page.waitForSelector('input[type=text]')
  await page.type('input[type=text]',LOGIN_DETAILS.EMAIL)

  //Setting Password
  await page.waitForSelector('input[type=password]')
  await page.type('input[type=password]',LOGIN_DETAILS.PASSWORD)


  // Waiting for the page to get loaded
  await page.waitForTimeout(2000)
  await page.waitForSelector(`form button`)
  // clicking on the sign in button
  await page.click(`form button`)

  // -----------Logging in ended ------------

  //After logged in 
  await page.waitForNavigation({waitUntil :'networkidle2'});
  await page.waitForTimeout(3000);


  // -----------Clicked on start booking ------------

  const buttons = await page.$$('button');
  for(let i = 0; i <buttons.length ;i++) {
    await buttons[i].evaluate(b => b.click());
  } 

  // ----------- start booking ended ------------

   await page.waitForTimeout(3000);

  //-----------selecting dropdowns -------------
    await page.waitForSelector(`form .mat-form-field`);
    const selects = await page.$$(`.mat-select`)

    //Selecting application Centre
    await selects[0].evaluate(b => b.click());
    await page.waitForTimeout(1000);
    await page.waitForSelector(`#mat-select-0-panel`)
    const options = await page.$$(`.mat-option`)
    await options[9].evaluate((b) => b.click());
    
    await page.waitForTimeout(5000);

    //------ CATEGORY AUTO SELECTED IN CASE OF SWISS VISA --- //
    //Selecting appointment category 
    // await selects[1].evaluate(b => b.click());
    // await page.waitForTimeout(1000);
    // await page.waitForSelector(`#mat-select-2-panel`)
    // const options2 = await page.$$(`.mat-option`)
    // await options2[6].evaluate((b) => b.click());

    // await page.waitForTimeout(3000);


    //selecting Sub-category
    await selects[2].evaluate(b => b.click());
    await page.waitForTimeout(1000);
    await page.waitForSelector(`#mat-select-4-panel`)
    const options3 = await page.$$(`.mat-option`)
    await options3[1].evaluate((b) => b.click());
    visaCategory = 'Business';
    // --------------Dropdown selection ended ------------

    await page.waitForTimeout(3000);


    // ------------- Getting earliest date ----------
    await page.waitForSelector(`.alert`);
    const alert = await page.$$(`.alert`)
    if(!alert || alert?.length < 1) return;
    const earliestDate = await alert[0].evaluate((e) => e.innerText);
    console.log("🚀 ~ file: index.js ~ line 83 ~ earliestDate", earliestDate)
    // ------------- earliest date ended ----------


    // --------- sending whatsapp message --------
    const text = `${COUNTRY.SWISS.VISA_COUNTRY} - ${visaCategory}\n${earliestDate}`;
    const chatId = LOGIN_DETAILS.WHATSAPP_RECIPIENT.substring(1) + "@c.us";
    client.sendMessage(chatId, text);
    // ---------- whatsapp message ended --------


    //------------Checking session expiry dialog ------------
    async function clickOnSessionActive() { 
       const sessionDialog = await page.$$(`.mat-modal-delete-document`);
        if(sessionDialog && sessionDialog.length > 0) { 
          console.log(`session expiry dialog found`,)
          const dialogButtons = await page.$$(`.mat-dialog-actions button`)
          await dialogButtons[1].evaluate(b => b.click());
        } else { 
          return;
        }

      setTimeout(clickOnSessionActive, LOGIN_DETAILS.SESSION_DIALOG_CHECK_TIME);
    }
  
    clickOnSessionActive();
    //-------------Session expiry dialog ended---------------


    //-------------- Changing dropdown sub-category to get latest dates ------------
      async function callFunctionEveryFiveMinutes() {
        // Toggling selection between sub-category tourist and business.
        await page.waitForSelector(`form .mat-form-field`);
        const selects = await page.$$(`.mat-select`)
        await selects[2].evaluate(b => b.click());
        await page.waitForTimeout(1000);
        await page.waitForSelector(`#mat-select-4-panel`)
        const options3 = await page.$$(`.mat-option`)
        if(visaCategory == 'Business') { 
          await options3[3].evaluate((b) => b.click());
          visaCategory = 'Tourist';
        } else { 
          await options3[1].evaluate((b) => b.click());
          visaCategory = 'Business';
        }

        await page.waitForTimeout(3000);

        // ------------- Getting earliest date ----------
        await page.waitForSelector(`.alert`);
        const alert = await page.$$(`.alert`)
        const earliestDate = await alert[0].evaluate((e) => e.innerText);
        console.log("🚀 ~ file: index.js ~ line 83 ~ earliestDate", earliestDate)
        // ------------- earliest date ended ----------


        // --------- sending whatsapp message --------
        const text = `${COUNTRY.SWISS.VISA_COUNTRY} - ${visaCategory}\n${earliestDate}`;
        const chatId = LOGIN_DETAILS.WHATSAPP_RECIPIENT.substring(1) + "@c.us";
        await client.sendMessage(chatId, text);
        // ---------- whatsapp message ended --------

        // call the function again in 10 minutes
        setTimeout(callFunctionEveryFiveMinutes, LOGIN_DETAILS.FETCHING_INTERVAL);
      }

      
      setTimeout(() => {
        console.log(`executing first time only`)
        callFunctionEveryFiveMinutes();
      },60000);      

    //-------------------Changing dates ended-------------------

})();

//TODO: There is an issue of session timed out but still the dates are running 



   