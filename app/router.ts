import { Application, Context } from 'egg';
import { Strategy as LocalStrategy } from 'passport-local';

// TODO: 身份登录状态维持
export default (app: Application) => {

  const middleware = app.middleware as any;
  const auth = middleware.auth();
  console.log(auth);
  // 使用passport-local策略
  app.passport.use(new LocalStrategy({
    passReqToCallback: true,
  }, (req, username, password, done) => {

    const user = {
      provider: 'local',
      username,
      password,
    };

    app.passport.doVerify(req, user, done);
  }));

  // 处理用户信息
  app.passport.verify(async (ctx: Context, user: any) => {
    console.log('isAuthenticated', ctx.isAuthenticated());
    if (user.username === 'allin') {
      return user;
    }
  });
  app.passport.serializeUser(async (ctx: Context, user: any) => {
    console.log(user);
  });
  app.passport.deserializeUser(async (ctx: Context, user: any) => {
    console.log(user);
  });

  const { controller, router } = app;

  const { home, user } = controller;

  router.get('/', home.index);
  router.get('/test', home.test);
  router.get('/testSocket', home.testSocket);
  router.post('/create', home.create);

  router.get('/user', auth, user.index);

  // 鉴权成功后的回调页面
  router.get('/authCallback', controller.home.authCallback);

  // 渲染登录页面，用户输入账号密码
  router.get('/login', controller.home.login);

  // 登录校验
  router.post('/login', app.passport.authenticate('local', { successRedirect: '/authCallback' }));

  // socket.io
  app.io.of('/').route('home', app.io.controller.home.server);
  app.io.route('message', app.io.controller.message.index);

};
