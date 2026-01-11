const obfuscatedEmail = 'bWF0dGJyZWNrb25AZ21haWwuY29t';

const decodeEmail = () => {
  if (typeof atob === 'function') {
    return atob(obfuscatedEmail);
  }

  return Buffer.from(obfuscatedEmail, 'base64').toString('utf-8');
};

const email = () => decodeEmail();

export default email;
