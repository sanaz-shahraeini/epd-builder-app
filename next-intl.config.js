/** @type {import('next-intl').NextIntlConfig} */
const config = {
  locales: ['en', 'de'],
  defaultLocale: 'en',
  localeDetection: true
};

export default config;

// @ts-check

// const withNextIntl = require('next-intl/plugin')();

// /** @type {import('next').NextConfig} */
// const config = {};

// module.exports = withNextIntl(config);