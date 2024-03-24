export const hostApi =
  process.env.NODE_ENV === 'development' ? 'http://localhost' : '';
export const portApi = process.env.NODE_ENV === 'development' ? 8080 : '';
export const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}/api`;

export const localStorageDarkModeKey = 'darkMode';

export const localStorageStyleKey = 'style';

export const containerMaxW = 'xl:max-w-full xl:mx-auto 2xl:mx-20';

export const appTitle = 'created by Flatlogic generator!';

export const getPageTitle = (currentPageTitle: string) =>
  `${currentPageTitle} — ${appTitle}`;

export const pexelsKey =
  'Dl0JL86jwaU4k2l2SP40p0YfunuRB3pjGL321Jo7KwbFYsY9i1VSdv6G';
export const pexelsQuery = 'fabric weave';
