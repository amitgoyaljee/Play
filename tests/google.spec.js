
import { test, expect } from '@playwright/test';
const Page1 = require('./demo/page1');

test("my fun",async({page})=>{
    const page1Object=new Page1(page)
     await page.goto('https://www.google.com/');
     await page1Object.searchTxtFill("amit") 

});