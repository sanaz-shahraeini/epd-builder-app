import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales} from './next-intl.config';

// Use the default: `always`
export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({locales});

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: 'Asia/Tehran'
}));