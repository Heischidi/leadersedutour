/* ============================================================
   LEADERSEDUTOUR — Shared Stories Store & Utilities
   Each story stores strictly: id, name, school, review.
   ============================================================ */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'leadersedutour_cms_v1';
  const GITHUB_CONFIG_KEY = 'leadersedutour_github_cfg_v1';

  const FALLBACK_DEFAULT = {
    version: 2,
    updatedAt: new Date().toISOString(),
    stories: []
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getInitials(name) {
    const clean = String(name || '').trim();
    if (!clean) return 'ST';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }

  function createStoryId(name) {
    const base = slugify(name) || 'story';
    const rand = Math.random().toString(36).slice(2, 6);
    return `story-${base}-${rand}`;
  }

  function sanitizeStory(raw, idx) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const name = String(src.name || '').trim() || `Student ${idx + 1}`;
    const legacySchool = [src.university, src.country].filter(Boolean).join(', ');
    const school = String(src.school || legacySchool || '').trim();
    const review = String(src.review || src.quote || '').trim();

    return {
      id: String(src.id || '').trim() || createStoryId(name),
      name,
      school,
      review
    };
  }

  function normalizeData(raw) {
    const def = global.LEADERS_STORIES_DATA
      ? global.LEADERS_STORIES_DATA
      : FALLBACK_DEFAULT;
    const src = raw && typeof raw === 'object' ? raw : {};
    const storiesInput = Array.isArray(src.stories)
      ? src.stories
      : (Array.isArray(def.stories) ? def.stories : []);

    return {
      version: 2,
      updatedAt: src.updatedAt || new Date().toISOString(),
      stories: storiesInput.map(sanitizeStory)
    };
  }

  function getDefaultData() {
    const base = global.LEADERS_STORIES_DATA
      ? deepClone(global.LEADERS_STORIES_DATA)
      : deepClone(FALLBACK_DEFAULT);
    return normalizeData(base);
  }

  function loadData() {
    try {
      const saved = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        return { data: normalizeData(parsed), source: 'local' };
      }
    } catch (err) {
      console.warn('Could not read stories from localStorage:', err);
    }
    return { data: getDefaultData(), source: 'default' };
  }

  function saveLocalData(data) {
    const normalized = normalizeData(data);
    normalized.updatedAt = new Date().toISOString();
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
    } catch (err) {
      console.error('Failed saving stories to localStorage:', err);
      throw err;
    }
    return normalized;
  }

  function clearLocalData() {
    try {
      if (global.localStorage) {
        global.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Could not clear localStorage stories:', err);
    }
    return getDefaultData();
  }

  function generateStoriesDataJS(data) {
    const normalized = normalizeData(data);
    normalized.updatedAt = new Date().toISOString();
    const header = [
      '/* ============================================================',
      '   LEADERSEDUTOUR — Success Stories Data',
      '   Each story contains only: name, school, and review.',
      '   ============================================================ */',
      ''
    ].join('\n');
    return `${header}window.LEADERS_STORIES_DATA = ${JSON.stringify(normalized, null, 2)};\n`;
  }

  global.LEADERS_CMS = {
    STORAGE_KEY,
    GITHUB_CONFIG_KEY,
    deepClone,
    escapeHtml,
    getInitials,
    createStoryId,
    getDefaultData,
    sanitizeStory,
    normalizeData,
    loadData,
    saveLocalData,
    clearLocalData,
    generateStoriesDataJS
  };
})(window);
