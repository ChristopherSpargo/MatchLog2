import { Matchlog2HomePage } from './home.po';

describe('matchlog2 App', () => {
  let page: Matchlog2HomePage;

  beforeAll(() => {
    page = new Matchlog2HomePage();
    page.navigateTo();
    page.getPageSize();
  });

  it('should display both lines of the logo text', () => {
    expect(page.getLogoText1()).toEqual('MatchLog', 'line 1 error');
    expect(page.getLogoText2()).toEqual('Tennis Logs', 'line 2 error');
  });

  it('should display about text', ()=> {
    page.getMenuItem(['aboutMenuBtn','aboutMatchLogBtn']).click();
    expect(page.getAboutTitle()).toEqual('Use MatchLog','no help');
    page.closeAboutPanel();
  });

  it('should have a Sign In button', ()=> {
    expect(page.getMenuItem(['signInBtn']).getText()).toContain('Sign In','No Sign In');
  });
});
