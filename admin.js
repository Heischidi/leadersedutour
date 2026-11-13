document.addEventListener('DOMContentLoaded', () => {
  const cms = window.LEADERS_CMS;
  if (!cms) {
    alert('CMS store (cms-store.js) failed to load.');
    return;
  }

  // ===== STATE =====
  let loaded = cms.loadData();
  let state = {
    data: loaded.data,
    source: loaded.source,
    editingId: loaded.data.stories.length ? loaded.data.stories[0].id : null,
    searchQuery: ''
  };

  // ===== DOM ELEMENTS =====
  const el = {
    storageSourceBadge: document.getElementById('storageSourceBadge'),
    unsavedHeaderBadge: document.getElementById('unsavedHeaderBadge'),
    tabBtnStories: document.getElementById('tabBtnStories'),
    tabBtnPublish: document.getElementById('tabBtnPublish'),
    tabPanelStories: document.getElementById('tabPanelStories'),
    tabPanelPublish: document.getElementById('tabPanelPublish'),

    storyCountBadge: document.getElementById('storyCountBadge'),
    addStoryBtn: document.getElementById('addStoryBtn'),
    storySearchInput: document.getElementById('storySearchInput'),
    storyList: document.getElementById('storyList'),

    editorModeBadge: document.getElementById('editorModeBadge'),
    unsavedBadge: document.getElementById('unsavedBadge'),
    previewReview: document.getElementById('previewReview'),
    previewAvatar: document.getElementById('previewAvatar'),
    previewName: document.getElementById('previewName'),
    previewSchool: document.getElementById('previewSchool'),

    storyForm: document.getElementById('storyForm'),
    storyNameInput: document.getElementById('storyNameInput'),
    storySchoolInput: document.getElementById('storySchoolInput'),
    storyReviewInput: document.getElementById('storyReviewInput'),
    reviewCharCount: document.getElementById('reviewCharCount'),
    discardStoryBtn: document.getElementById('discardStoryBtn'),
    duplicateStoryBtn: document.getElementById('duplicateStoryBtn'),
    deleteCurrentStoryBtn: document.getElementById('deleteCurrentStoryBtn'),

    publishStatusText: document.getElementById('publishStatusText'),
    downloadStoriesJsBtn: document.getElementById('downloadStoriesJsBtn'),
    saveFilePickerBtn: document.getElementById('saveFilePickerBtn'),
    copyStoriesJsBtn: document.getElementById('copyStoriesJsBtn'),
    generatedJsPreview: document.getElementById('generatedJsPreview'),

    ghOwnerInput: document.getElementById('ghOwnerInput'),
    ghRepoInput: document.getElementById('ghRepoInput'),
    ghBranchInput: document.getElementById('ghBranchInput'),
    ghCommitMsgInput: document.getElementById('ghCommitMsgInput'),
    ghTokenInput: document.getElementById('ghTokenInput'),
    ghRememberToken: document.getElementById('ghRememberToken'),
    ghTestBtn: document.getElementById('ghTestBtn'),
    ghPushBtn: document.getElementById('ghPushBtn'),
    ghStatusBanner: document.getElementById('ghStatusBanner'),

    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonBtn: document.getElementById('importJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
    toastContainer: document.getElementById('toastContainer'),

    confirmModal: document.getElementById('confirmModal'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalText: document.getElementById('confirmModalText'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    confirmOkBtn: document.getElementById('confirmOkBtn')
  };

  // ===== CONFIRM MODAL (NO BROWSER POPUPS) =====
  let confirmCallback = null;
  const showConfirmModal = (title, text, okText, onOk) => {
    if (el.confirmModalTitle) el.confirmModalTitle.textContent = title;
    if (el.confirmModalText) el.confirmModalText.textContent = text;
    if (el.confirmOkBtn) el.confirmOkBtn.textContent = okText || 'Confirm';
    confirmCallback = onOk;
    if (el.confirmModal) el.confirmModal.classList.remove('hidden');
  };

  const hideConfirmModal = () => {
    if (el.confirmModal) el.confirmModal.classList.add('hidden');
    confirmCallback = null;
  };

  if (el.confirmCancelBtn) el.confirmCancelBtn.addEventListener('click', hideConfirmModal);
  if (el.confirmOkBtn) {
    el.confirmOkBtn.addEventListener('click', () => {
      const cb = confirmCallback;
      hideConfirmModal();
      if (typeof cb === 'function') cb();
    });
  }
  if (el.confirmModal) {
    el.confirmModal.addEventListener('click', (e) => {
      if (e.target === el.confirmModal) hideConfirmModal();
    });
  }

  // ===== UTILITIES =====
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3400);
  };

  const toBase64Utf8 = (text) => {
    const bytes = new TextEncoder().encode(String(text));
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };

  const findStoryById = (id) => {
    if (!id) return null;
    return state.data.stories.find(s => s.id === id) || null;
  };

  const getFormValues = () => ({
    name: el.storyNameInput.value.trim(),
    school: el.storySchoolInput.value.trim(),
    review: el.storyReviewInput.value.trim()
  });

  const isFormDirty = () => {
    const current = {
      name: el.storyNameInput.value,
      school: el.storySchoolInput.value,
      review: el.storyReviewInput.value
    };
    const original = findStoryById(state.editingId);
    if (!original) {
      return Boolean(current.name.trim() || current.school.trim() || current.review.trim());
    }
    return (
      current.name !== (original.name || '') ||
      current.school !== (original.school || '') ||
      current.review !== (original.review || '')
    );
  };

  const confirmDiscardIfDirty = () => {
    return true;
  };

  const triggerDownload = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ===== RENDERING =====
  const updateDirtyIndicators = () => {
    const dirty = isFormDirty();
    el.unsavedBadge.classList.toggle('hidden', !dirty);
    el.unsavedHeaderBadge.classList.toggle('hidden', !dirty);
  };

  const updateStorageBadge = () => {
    const isLocal = state.source === 'local';
    el.storageSourceBadge.textContent = isLocal ? 'Local Draft Active' : 'Published Defaults';
    el.storageSourceBadge.classList.toggle('is-local', isLocal);

    el.publishStatusText.textContent = isLocal
      ? `You have unpublished changes saved in this browser (${state.data.stories.length} stories). Push to GitHub or replace stories-data.js to make them live for everyone.`
      : `Showing the published defaults from stories-data.js (${state.data.stories.length} stories). No unpublished local browser changes.`;
    el.publishStatusText.className = `status-banner ${isLocal ? 'warning' : 'success'}`;
  };

  const updateLivePreview = () => {
    const rawName = el.storyNameInput.value.trim();
    const rawSchool = el.storySchoolInput.value.trim();
    const rawReview = el.storyReviewInput.value.trim();

    el.previewName.textContent = rawName || 'Student Name';
    el.previewSchool.textContent = rawSchool || 'School / University';
    el.previewReview.textContent = rawReview
      ? `"${rawReview}"`
      : '"Share the student\'s review of Leadersedutour..."';
    el.previewAvatar.textContent = rawName ? cms.getInitials(rawName) : 'ST';
    el.reviewCharCount.textContent = `${el.storyReviewInput.value.length} / 600`;
    updateDirtyIndicators();
  };

  const populateEditor = (storyId) => {
    state.editingId = storyId;
    const story = findStoryById(storyId);

    if (story) {
      const idx = state.data.stories.findIndex(s => s.id === story.id) + 1;
      el.editorModeBadge.textContent = `Editing Story #${idx}`;
      el.storyNameInput.value = story.name;
      el.storySchoolInput.value = story.school;
      el.storyReviewInput.value = story.review;
      el.duplicateStoryBtn.disabled = false;
      el.deleteCurrentStoryBtn.disabled = false;
    } else {
      el.editorModeBadge.textContent = 'New Story';
      el.storyNameInput.value = '';
      el.storySchoolInput.value = '';
      el.storyReviewInput.value = '';
      el.duplicateStoryBtn.disabled = true;
      el.deleteCurrentStoryBtn.disabled = true;
    }

    updateLivePreview();
    renderStoryList();
  };

  const renderStoryList = () => {
    const query = state.searchQuery.trim().toLowerCase();
    const allStories = state.data.stories;
    const filtered = query
      ? allStories.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.school.toLowerCase().includes(query) ||
          s.review.toLowerCase().includes(query)
        )
      : allStories;

    el.storyCountBadge.textContent = String(allStories.length);
    el.storyList.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-list';
      empty.textContent = query
        ? 'No stories match your search.'
        : 'No stories yet. Click "+ New Story" to add the first one.';
      el.storyList.appendChild(empty);
      return;
    }

    filtered.forEach((story) => {
      const realIndex = allStories.findIndex(s => s.id === story.id);
      const item = document.createElement('div');
      item.className = `story-item${story.id === state.editingId ? ' active' : ''}`;

      const main = document.createElement('div');
      main.className = 'story-item-main';

      const avatar = document.createElement('div');
      avatar.className = 'mini-avatar';
      avatar.textContent = cms.getInitials(story.name);

      const info = document.createElement('div');
      info.className = 'story-item-info';

      const nameDiv = document.createElement('div');
      nameDiv.className = 'story-item-name';
      nameDiv.textContent = story.name;

      const schoolDiv = document.createElement('div');
      schoolDiv.className = 'story-item-school';
      schoolDiv.textContent = story.school;

      info.appendChild(nameDiv);
      info.appendChild(schoolDiv);
      main.appendChild(avatar);
      main.appendChild(info);

      const actions = document.createElement('div');
      actions.className = 'story-item-actions';

      const orderLabel = document.createElement('span');
      orderLabel.className = 'story-item-order';
      orderLabel.textContent = `#${realIndex + 1}`;

      const btnGroup = document.createElement('div');
      btnGroup.className = 'icon-btn-group';

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'icon-btn';
      upBtn.textContent = '↑';
      upBtn.title = query ? 'Clear search to reorder' : 'Move up';
      upBtn.disabled = Boolean(query) || realIndex === 0;
      upBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moveStory(realIndex, -1);
      });

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'icon-btn';
      downBtn.textContent = '↓';
      downBtn.title = query ? 'Clear search to reorder' : 'Move down';
      downBtn.disabled = Boolean(query) || realIndex === allStories.length - 1;
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moveStory(realIndex, 1);
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'icon-btn danger';
      delBtn.textContent = 'Delete';
      delBtn.title = 'Delete story';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteStoryById(story.id);
      });

      btnGroup.appendChild(upBtn);
      btnGroup.appendChild(downBtn);
      btnGroup.appendChild(delBtn);

      actions.appendChild(orderLabel);
      actions.appendChild(btnGroup);

      item.appendChild(main);
      item.appendChild(actions);

      item.addEventListener('click', () => {
        if (story.id === state.editingId) return;
        if (!confirmDiscardIfDirty()) return;
        populateEditor(story.id);
      });

      el.storyList.appendChild(item);
    });
  };

  const refreshPublishPreview = () => {
    el.generatedJsPreview.textContent = cms.generateStoriesDataJS(state.data);
    updateStorageBadge();
  };

  const persistData = (toastMessage) => {
    state.data = cms.saveLocalData(state.data);
    state.source = 'local';
    updateStorageBadge();
    refreshPublishPreview();
    if (toastMessage) showToast(toastMessage, 'success');
  };

  // ===== CRUD ACTIONS =====
  const moveStory = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= state.data.stories.length) return;
    const list = state.data.stories;
    const [moved] = list.splice(index, 1);
    list.splice(target, 0, moved);
    persistData('Story order updated.');
    renderStoryList();
    if (state.editingId === moved.id) {
      el.editorModeBadge.textContent = `Editing Story #${target + 1}`;
    }
  };

  const deleteStoryById = (id) => {
    const story = findStoryById(id);
    if (!story) return;

    showConfirmModal(
      'Delete Story',
      `Are you sure you want to delete "${story.name}" from student stories?`,
      'Delete',
      () => {
        const deletedIndex = state.data.stories.findIndex(s => s.id === id);
        state.data.stories = state.data.stories.filter(s => s.id !== id);
        persistData(`Deleted "${story.name}".`);

        if (state.editingId === id) {
          const next = state.data.stories[deletedIndex] || state.data.stories[deletedIndex - 1] || null;
          populateEditor(next ? next.id : null);
        } else {
          renderStoryList();
        }
      }
    );
  };

  // ===== TABS =====
  const switchTab = (tabName) => {
    const isStories = tabName === 'stories';
    el.tabBtnStories.classList.toggle('active', isStories);
    el.tabBtnPublish.classList.toggle('active', !isStories);
    el.tabPanelStories.classList.toggle('hidden', !isStories);
    el.tabPanelPublish.classList.toggle('hidden', isStories);
    if (!isStories) {
      refreshPublishPreview();
    }
  };

  el.tabBtnStories.addEventListener('click', () => switchTab('stories'));
  el.tabBtnPublish.addEventListener('click', () => switchTab('publish'));

  // ===== EDITOR EVENTS =====
  [el.storyNameInput, el.storySchoolInput, el.storyReviewInput].forEach((input) => {
    input.addEventListener('input', updateLivePreview);
  });

  el.storySearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderStoryList();
  });

  el.addStoryBtn.addEventListener('click', () => {
    if (!confirmDiscardIfDirty()) return;
    populateEditor(null);
    el.storyNameInput.focus();
  });

  el.storyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { name, school, review } = getFormValues();

    if (!name || !school || !review) {
      showToast('Please enter Name, School, and Review.', 'error');
      return;
    }

    const existing = findStoryById(state.editingId);
    if (existing) {
      existing.name = name;
      existing.school = school;
      existing.review = review;
      persistData(`Updated "${name}".`);
      populateEditor(existing.id);
    } else {
      const newStory = {
        id: cms.createStoryId(name),
        name,
        school,
        review
      };
      state.data.stories.push(newStory);
      persistData(`Added "${name}".`);
      populateEditor(newStory.id);
    }
  });

  el.discardStoryBtn.addEventListener('click', () => {
    populateEditor(state.editingId);
    showToast('Form reset to saved values.');
  });

  el.duplicateStoryBtn.addEventListener('click', () => {
    if (!confirmDiscardIfDirty()) return;
    const original = findStoryById(state.editingId);
    if (!original) return;
    const copy = {
      id: cms.createStoryId(`${original.name}-copy`),
      name: `${original.name} (Copy)`,
      school: original.school,
      review: original.review
    };
    const idx = state.data.stories.findIndex(s => s.id === original.id);
    state.data.stories.splice(idx + 1, 0, copy);
    persistData(`Duplicated "${original.name}".`);
    populateEditor(copy.id);
  });

  el.deleteCurrentStoryBtn.addEventListener('click', () => {
    if (state.editingId) {
      deleteStoryById(state.editingId);
    }
  });

  // ===== EXPORT & BACKUP =====
  el.downloadStoriesJsBtn.addEventListener('click', () => {
    const code = cms.generateStoriesDataJS(state.data);
    triggerDownload('stories-data.js', code, 'application/javascript;charset=utf-8');
    showToast('Downloaded stories-data.js', 'success');
  });

  el.saveFilePickerBtn.addEventListener('click', async () => {
    const code = cms.generateStoriesDataJS(state.data);
    if (typeof window.showSaveFilePicker !== 'function') {
      triggerDownload('stories-data.js', code, 'application/javascript;charset=utf-8');
      showToast('Direct file picker unavailable here — downloaded stories-data.js instead.');
      return;
    }
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'stories-data.js',
        types: [{
          description: 'JavaScript File',
          accept: { 'application/javascript': ['.js'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(code);
      await writable.close();
      showToast('Saved directly to stories-data.js!', 'success');
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        showToast(`Could not save file: ${err.message}`, 'error');
      }
    }
  });

  el.copyStoriesJsBtn.addEventListener('click', async () => {
    const code = cms.generateStoriesDataJS(state.data);
    try {
      await navigator.clipboard.writeText(code);
      showToast('Copied stories-data.js code to clipboard.', 'success');
    } catch {
      showToast('Clipboard blocked by browser. Use Download instead.', 'error');
    }
  });

  el.exportJsonBtn.addEventListener('click', () => {
    const json = JSON.stringify(state.data, null, 2);
    triggerDownload('leadersedutour-stories-backup.json', json, 'application/json;charset=utf-8');
    showToast('Exported JSON backup.', 'success');
  });

  el.importJsonBtn.addEventListener('click', () => {
    if (!confirmDiscardIfDirty()) return;
    el.importJsonInput.value = '';
    el.importJsonInput.click();
  });

  el.importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const normalized = cms.normalizeData(Array.isArray(parsed) ? { stories: parsed } : parsed);
        state.data = normalized;
        persistData(`Imported ${normalized.stories.length} stories from JSON.`);
        populateEditor(normalized.stories.length ? normalized.stories[0].id : null);
      } catch {
        showToast('Invalid JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  });

  el.resetDefaultsBtn.addEventListener('click', () => {
    showConfirmModal(
      'Reset to Published Defaults',
      'Clear all local browser edits and restore published defaults from stories-data.js?',
      'Reset Defaults',
      () => {
        state.data = cms.clearLocalData();
        state.source = 'default';
        populateEditor(state.data.stories.length ? state.data.stories[0].id : null);
        refreshPublishPreview();
        showToast('Restored published defaults.', 'success');
      }
    );
  });

  // ===== GITHUB DIRECT PUBLISH =====
  const loadGithubConfig = () => {
    try {
      const raw = localStorage.getItem(cms.GITHUB_CONFIG_KEY);
      if (!raw) return;
      const cfg = JSON.parse(raw);
      if (cfg.owner) el.ghOwnerInput.value = cfg.owner;
      if (cfg.repo) el.ghRepoInput.value = cfg.repo;
      if (cfg.branch) el.ghBranchInput.value = cfg.branch;
      if (cfg.token) {
        el.ghTokenInput.value = cfg.token;
        el.ghRememberToken.checked = true;
      }
    } catch {
      // Ignore invalid saved config
    }
  };

  const saveGithubConfigIfChecked = () => {
    try {
      if (el.ghRememberToken.checked) {
        localStorage.setItem(cms.GITHUB_CONFIG_KEY, JSON.stringify({
          owner: el.ghOwnerInput.value.trim(),
          repo: el.ghRepoInput.value.trim(),
          branch: el.ghBranchInput.value.trim(),
          token: el.ghTokenInput.value.trim()
        }));
      } else {
        localStorage.removeItem(cms.GITHUB_CONFIG_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const setGithubBanner = (message, kind) => {
    el.ghStatusBanner.textContent = message;
    el.ghStatusBanner.className = `status-banner ${kind}`;
  };

  const getGithubParams = () => ({
    owner: el.ghOwnerInput.value.trim(),
    repo: el.ghRepoInput.value.trim(),
    branch: el.ghBranchInput.value.trim() || 'main',
    token: el.ghTokenInput.value.trim(),
    message: el.ghCommitMsgInput.value.trim() || 'Update student stories via admin'
  });

  el.ghTestBtn.addEventListener('click', async () => {
    const { owner, repo, branch, token } = getGithubParams();
    if (!owner || !repo || !token) {
      setGithubBanner('Enter Owner, Repository, and Token first.', 'error');
      return;
    }
    saveGithubConfigIfChecked();
    el.ghTestBtn.disabled = true;
    setGithubBanner('Testing GitHub connection...', 'warning');

    try {
      const res = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/stories-data.js?ref=${encodeURIComponent(branch)}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      setGithubBanner(`Connected to ${owner}/${repo} (${branch}). Ready to publish.`, 'success');
    } catch (err) {
      setGithubBanner(`Connection failed: ${err.message}`, 'error');
    } finally {
      el.ghTestBtn.disabled = false;
    }
  });

  el.ghPushBtn.addEventListener('click', async () => {
    const { owner, repo, branch, token, message } = getGithubParams();
    if (!owner || !repo || !token) {
      setGithubBanner('Enter Owner, Repository, and Token first.', 'error');
      return;
    }
    saveGithubConfigIfChecked();
    el.ghPushBtn.disabled = true;
    setGithubBanner('Publishing stories-data.js to GitHub...', 'warning');

    try {
      const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/stories-data.js`;
      let existingSha;

      const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`
        }
      });
      if (getRes.ok) {
        const info = await getRes.json();
        existingSha = info.sha;
      } else if (getRes.status !== 404) {
        const err = await getRes.json().catch(() => ({}));
        throw new Error(err.message || `Failed to read existing file (${getRes.status})`);
      }

      const fileCode = cms.generateStoriesDataJS(state.data);
      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          content: toBase64Utf8(fileCode),
          branch,
          ...(existingSha ? { sha: existingSha } : {})
        })
      });

      const putData = await putRes.json().catch(() => ({}));
      if (!putRes.ok) {
        throw new Error(putData.message || `GitHub push failed (${putRes.status})`);
      }

      const shortSha = putData.commit && putData.commit.sha ? putData.commit.sha.slice(0, 7) : 'ok';
      setGithubBanner(`Published stories-data.js to ${owner}/${repo}@${branch} (commit ${shortSha}).`, 'success');
      showToast('Published to GitHub!', 'success');
    } catch (err) {
      setGithubBanner(`Publish failed: ${err.message}`, 'error');
      showToast('GitHub publish failed.', 'error');
    } finally {
      el.ghPushBtn.disabled = false;
    }
  });

  // ===== SYNC ACROSS TABS =====
  window.addEventListener('storage', (e) => {
    if (e.key === cms.STORAGE_KEY) {
      loaded = cms.loadData();
      state.data = loaded.data;
      state.source = loaded.source;
      const keepId = findStoryById(state.editingId)
        ? state.editingId
        : (state.data.stories[0] ? state.data.stories[0].id : null);
      populateEditor(keepId);
      refreshPublishPreview();
    }
  });

  // ===== INIT =====
  loadGithubConfig();
  populateEditor(state.editingId);
  refreshPublishPreview();
});
