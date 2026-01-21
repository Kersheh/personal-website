const shutdown = () => {
  window.dispatchEvent(new CustomEvent('desktop:shutdown'));
  return 'Shutting down...';
};

export default shutdown;
