const {test,expect}= require('@playwright/test')

// const{hello1,hello2}=require('./demo/hello.js')

// console.log(hello1());
// console.log(hello2());


test('test', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await page.getByRole('combobox', { name: 'Search' }).click();
  await page.getByRole('combobox', { name: 'Search' }).fill('aaa');
});