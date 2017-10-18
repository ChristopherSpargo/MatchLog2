import {protractor, browser, by, element, $, $$ } from 'protractor';

export class Matchlog2HomePage {

  smallPage : boolean;

  getPageSize() {
    $("#slideDownBtn").isDisplayed()
    .then((isDisp) => {
      this.smallPage = isDisp;
    })
  }

  navigateTo() {
    return browser.get('/home');
  }

  getLogoText1() {
    console.log("smallPage", this.smallPage);
    let list = $$('.app-logo-text1').filter(el => {return el.isDisplayed()});
    return list.get(0).getText();
  }
  
  getLogoText2() {
    let list = $$('.app-logo-text2').filter(el => {return el.isDisplayed()});
    return list.get(0).getText();
  }

  getAboutTitle() {
    let EC = protractor.ExpectedConditions;
    browser.wait(EC.visibilityOf($('.app-about-title2')), 5000);
    return $('.app-about-title2').getText();
  }

  closeAboutPanel() {
    let EC = protractor.ExpectedConditions;
    $('#aboutCloseBtn').click();
    browser.wait(EC.invisibilityOf($('#aboutCloseBtn')), 5000);
  }

  getMenuItem(path: [string]) {
    let el;
    let EC = protractor.ExpectedConditions;
    if(this.smallPage){
      browser.wait(EC.visibilityOf($('#slideDownBtn')), 5000);
      $('#slideDownBtn').click();
      browser.wait(EC.visibilityOf($('#slideDownMenu')), 5000);
    }
    path.forEach((link, index, arr) => {
      el = $$('#'+link).filter(el => {return el.isDisplayed()}).get(0);
      browser.wait(EC.visibilityOf(el), 5000);
      if(index < arr.length-1){ el.click(); }
    })
    return el;
  }

}
