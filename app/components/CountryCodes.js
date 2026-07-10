import countries from 'i18n-iso-countries';
import englishNames from 'i18n-iso-countries/langs/en.json';
import {getCountries,getCountryCallingCode} from 'libphonenumber-js';

countries.registerLocale(englishNames);
const preferredNames={US:'United States',GB:'United Kingdom'};

const flagFor=(countryCode)=>countryCode
 .toUpperCase()
 .replace(/./g,character=>String.fromCodePoint(127397+character.charCodeAt(0)));

export const CountryCodesList=getCountries()
 .map(value=>({
  name:preferredNames[value]||countries.getName(value,'en')||value,
  code:`(+${getCountryCallingCode(value)})`,
  value,
  flag:flagFor(value)
 }))
 .sort((a,b)=>a.name.localeCompare(b.name));

export default CountryCodesList;

