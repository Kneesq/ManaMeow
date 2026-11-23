// Supabase connection configuration for ManaMeow.
// Fill in your Supabase Project URL and anon public key from:
// Supabase Dashboard -> Project Settings -> API
(() => {
  'use strict';

  const config = {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    STORAGE_BUCKET: 'cat-media',
    MAX_PHOTO_BYTES: 10 * 1024 * 1024, // 10 MB
    MAX_VIDEO_BYTES: 50 * 1024 * 1024, // 50 MB
  };

  window.MANAMEOW_SUPABASE = Object.freeze({
    ...config,
    isConfigured() {
      return Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
    },
  });
})();
