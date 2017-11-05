const mm = require('plover-test-mate');
const co = require('co');


describe('plover-route/lib/plugin', () => {
  it('config routes', () => {
    const app = mm({
      applicationRoot: __dirname,
      routes: r => {
        r.get('/profile', 'users#show');
        r.use('/hello', ctx => {
          ctx.body = 'hello';
        });
      }
    });

    app.install('plover-web');
    app.install(require('../lib/plugin'));

    app.use(ctx => {
      if (ctx.route) {
        ctx.body = ctx.route;
      }
    });

    return co(function* () {
      yield app.get('/profile').expect({
        module: 'users',
        action: 'show',
        query: {}
      });

      yield app.get('/hello').expect('hello');
    });
  });


  it('routes not config', () => {
    const app = mm({
      applicationRoot: __dirname
    });

    app.install('plover-web');
    app.install(require('../lib/plugin'));

    (true).should.be.ok();
  });


  describe('http method', () => {
    const app = mm({
      applicationRoot: __dirname,
      web: {
        csrf: {
          ignore: ['/*']
        }
      }
    });

    app.install('plover-web');
    app.install(require('../lib/plugin'));

    app.use(ctx => {
      ctx.body = ctx.method;
    });


    it('put with _method', () => {
      return co(function* () {
        yield app.agent.post('/update')
          .send({ _method: 'put' })
          .expect('PUT');
      });
    });


    it('patch with header: x-http-method-override', () => {
      return co(function* () {
        yield app.agent.post('/update')
          .set('X-HTTP-Method-Override', 'patch')
          .expect('PATCH');
      });
    });
  });
});
