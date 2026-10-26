// Synthetic sample cards. Every value is fictional and deliberately invalid
// (ID numbers use 0000 in the year position) so it can never match a real person.
import { SILHOUETTE_PNG_BASE64 } from './silhouette.js';

export const SAMPLE_CARDS = [
  {
    id: '784-0000-0000001-0',
    cardNumber: '000000001',
    cardSerialNumber: '0000000000000001',
    fullNameEnglish: 'SAMPLE CARDHOLDER ONE',
    fullNameArabic: 'حامل بطاقة تجريبي واحد',
    nationality: 'United Arab Emirates',
    nationalityArabic: 'الإمارات العربية المتحدة',
    gender: 'M',
    dateOfBirth: '01/01/1990',
    issueDate: '01/01/2024',
    expiryDate: '01/01/2029',
  },
  {
    id: '784-0000-0000002-0',
    cardNumber: '000000002',
    cardSerialNumber: '0000000000000002',
    fullNameEnglish: 'SAMPLE CARDHOLDER TWO',
    fullNameArabic: 'حاملة بطاقة تجريبية اثنان',
    nationality: 'India',
    nationalityArabic: 'الهند',
    gender: 'F',
    dateOfBirth: '15/06/1985',
    issueDate: '10/03/2023',
    expiryDate: '10/03/2026',
  },
  {
    id: '784-0000-0000003-0',
    cardNumber: '000000003',
    cardSerialNumber: '0000000000000003',
    fullNameEnglish: 'SAMPLE MINOR THREE',
    fullNameArabic: 'قاصر تجريبي ثلاثة',
    nationality: 'Egypt',
    nationalityArabic: 'مصر',
    gender: 'M',
    dateOfBirth: '20/09/2012',
    issueDate: '05/05/2025',
    expiryDate: '05/05/2030',
  },
];

export const SAMPLE_NFC_TAGS = [
  { uid: '04A1B2C3', cardType: 'MIFARE_CLASSIC_1K', sak: '0x08' },
  { uid: '04D5E6F7', cardType: 'NTAG', sak: '0x00' },
];

export const SAMPLE_PHOTO = SILHOUETTE_PNG_BASE64;
