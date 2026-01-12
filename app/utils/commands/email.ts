// not encrypted - just obfuscated to avoid simple bot scraping
const obfuscatedEmail = 'bWF0dGJyZWNrb25AZ21haWwuY29t';

const decodeEmail = () => {
  if (typeof atob === 'function') {
    return atob(obfuscatedEmail);
  }

  return Buffer.from(obfuscatedEmail, 'base64').toString('utf-8');
};

const email = () => {
  const decodedEmail = decodeEmail();
  return `mailto:${decodedEmail}`;
};

export default email;
