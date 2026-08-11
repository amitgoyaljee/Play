class Page1 {
  constructor(page) { this.page = page; }
  async searchTxtFill(text) { await this.page.fill('xpath=//*[@name="q"]', text); }
}
module.exports = Page1;