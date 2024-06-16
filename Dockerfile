FROM node

COPY package.json .
COPY package-lock.json .
COPY tests tests
COPY playwright.config.js .

COPY app.js .
COPY public public
COPY routers routers
COPY templates templates
COPY utils utils
COPY .env .env

RUN npm install
RUN npx playwright install
RUN npx playwright install-deps

ENTRYPOINT npm run test_ci