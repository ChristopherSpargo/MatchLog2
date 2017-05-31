import { Matchlog2Page } from './app.po';

describe('matchlog2 App', () => {
  let page: Matchlog2Page;

  beforeEach(() => {
    page = new Matchlog2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
