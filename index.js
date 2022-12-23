const puppeteer = require(`puppeteer`);
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
  authStrategy: new LocalAuth()
});
let visaCategory = '';

//IMPORTANT CREDENTIALS 
const EMAIL = 'moinsaz2000@gmail.com';
const PASSWORD = '@Asdfghjkl786@';
const WHATSAPP_RECIPIENT = '919920791683';
const DATE_FETCHING_TIME = 120000;


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
  await page.goto('https://visa.vfsglobal.com/ind/en/deu/login');

  // -----------Creating browser and page ended ------------


  // -----------Logging in----------------
  //Setting Email
  await page.waitForSelector('input[type=text]')
  await page.type('input[type=text]',EMAIL)

  //Setting Password
  await page.waitForSelector('input[type=password]')
  await page.type('input[type=password]',PASSWORD)


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
    await options[11].evaluate((b) => b.click());
    
    await page.waitForTimeout(3000);

    //Selecting appointment category 
    await selects[1].evaluate(b => b.click());
    await page.waitForTimeout(1000);
    await page.waitForSelector(`#mat-select-2-panel`)
    const options2 = await page.$$(`.mat-option`)
    await options2[6].evaluate((b) => b.click());


    await page.waitForTimeout(3000);


    //selecting Sub-category
    await selects[2].evaluate(b => b.click());
    await page.waitForTimeout(1000);
    await page.waitForSelector(`#mat-select-4-panel`)
    const options3 = await page.$$(`.mat-option`)
    await options3[8].evaluate((b) => b.click());
    visaCategory = 'Business';
    // --------------Dropdown selection ended ------------

    await page.waitForTimeout(3000);


    // ------------- Getting earliest date ----------
    await page.waitForSelector(`.alert`);
    const alert = await page.$$(`.alert`)
    const earliestDate = await alert[0].evaluate((e) => e.innerText);
    console.log("🚀 ~ file: index.js ~ line 83 ~ earliestDate", earliestDate)
    // ------------- earliest date ended ----------


    // --------- sending whatsapp message --------
    const text = `Category - ${visaCategory}\nDate - ${earliestDate}`;
    const chatId = WHATSAPP_RECIPIENT.substring(1) + "@c.us";
    client.sendMessage(chatId, text);
    // ---------- whatsapp message ended --------


    //This calles will happen every 5 mins
    setInterval(async () => {
      await page.waitForSelector(`form .mat-form-field`);
      const selects = await page.$$(`.mat-select`)
      await selects[2].evaluate(b => b.click());
      await page.waitForTimeout(1000);
      await page.waitForSelector(`#mat-select-4-panel`)
      const options3 = await page.$$(`.mat-option`)
      if(visaCategory == 'Business') { 
        await options3[5].evaluate((b) => b.click());
        visaCategory = 'Tourist';
      } else { 
        await options3[8].evaluate((b) => b.click());
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
      const text = `Category - ${visaCategory}\nDate - ${earliestDate}`;
      const chatId = WHATSAPP_RECIPIENT.substring(1) + "@c.us";
      await client.sendMessage(chatId, text);
      // ---------- whatsapp message ended --------
    
    }, DATE_FETCHING_TIME);

})();


   