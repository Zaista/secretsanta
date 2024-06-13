FROM node

COPY package.json .
COPY package-lock.json .
COPY tests tests
COPY playwright.config.js .

RUN npm install
RUN npx playwright install
RUN npx playwright install-deps

ENTRYPOINT npm run test_ci