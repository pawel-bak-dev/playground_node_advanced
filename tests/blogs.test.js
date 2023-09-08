const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a[href="/blogs/new"]');
  });

  test('Can see blog create form', async () => {
    const url = await page.url();
    const label = await page.getContentsOf('form label');

    expect(url).toMatch('/blogs/new');
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid input', async () => {
    beforeEach(async () => {
      await page.type('input[name="title"]', 'Test Title');
      await page.type('input[name="content"]', 'Test Content');
      await page.click('form button[type="submit"]');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });
    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const valueTitle = await page.getContentsOf('.card-title');
      const valueContent = await page.getContentsOf('.card-content p');

      expect(valueTitle).toEqual('Test Title');
      expect(valueContent).toEqual('Test Content');
    });
  });

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button[type="submit"]');
    });

    test('the form shows an error message', async () => {
      const textTitle = await page.getContentsOf('.title .red-text');
      const textContent = await page.getContentsOf('.content .red-text');

      expect(textTitle).toEqual('You must provide a value');
      expect(textContent).toEqual('You must provide a value');
    });
  });
});

describe('When not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      body: {
        title: 'Test title',
        content: 'Test content'
      }
    }
  ];

  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });
});
