import log4js from 'log4js';

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
  },
  categories: {
    default: { appenders: ['out'], level: 'info' },
    app: { appenders: ['out'], level: 'info' },
    session: { appenders: ['out'], level: 'info' },
    environment: { appenders: ['out'], level: 'debug' },
    mail: { appenders: ['out'], level: 'info' },
    mailLocal: { appenders: ['out'], level: 'debug' },
    adminRouter: { appenders: ['out'], level: 'info' },
    historyRouter: { appenders: ['out'], level: 'info' },
    profileRouter: { appenders: ['out'], level: 'info' },
    chatRouter: { appenders: ['out'], level: 'info' },
    adminPipeline: { appenders: ['out'], level: 'info' },
    friendsPipeline: { appenders: ['out'], level: 'info' },
    historyPipeline: { appenders: ['out'], level: 'info' },
    loginPipeline: { appenders: ['out'], level: 'info' },
    santaPipeline: { appenders: ['out'], level: 'info' },
  },
});

export function getLogger(category) {
  return log4js.getLogger(category);
}
