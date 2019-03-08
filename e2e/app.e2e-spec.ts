import { Angular2ModeloPmmgPage } from './app.po';

describe('exemplofrontend App', function() {
  let page: Angular2ModeloPmmgPage;

  beforeEach(() => {
    page = new Angular2ModeloPmmgPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
