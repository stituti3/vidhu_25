// Letter & Photo Storage Service
// Handles persistence for Contributor Letters & Photos in localStorage + Backend API Sync
import { BAKED_LETTERS } from '../data/baked_letters.js?v=1786659469';
import { BAKED_MEMORIES } from '../data/baked_memories.js?v=1786659469';

const STORAGE_KEYS = {
  MY_LETTER: 'dear_dewey_my_letter_v1',
  COMMUNITY_LETTERS: 'dear_dewey_community_letters_v1',
  DELETED_LETTER_IDS: 'dear_dewey_deleted_letter_ids_v1',
  DELETED_MEMORY_IDS: 'dear_dewey_deleted_memory_ids_v1',
  CUSTOM_MEMORIES: 'dear_dewey_custom_memories_v1',
  LETTER_ORDER: 'dear_dewey_letter_order_v1',
  MEMORY_ORDER: 'dear_dewey_memory_order_v1'
};

class LetterStorageService {
  constructor() {
    this.listeners = new Set();
    this.serverMemories = [];
    this.serverLetters = [];
    
    // Quick reset mechanism for wiping the Polaroid Wall
    if (window.location.search.includes('reset_wall=true')) {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_MEMORIES);
      localStorage.removeItem(STORAGE_KEYS.MEMORY_ORDER);
      localStorage.removeItem(STORAGE_KEYS.DELETED_MEMORY_IDS);
      // Remove query param from URL so it doesn't loop
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    this.fetchBackendData();
  }

  async fetchBackendData() {
    try {
      const [memRes, letRes] = await Promise.all([
        fetch('/api/memories', { cache: 'no-store' }).catch(() => null),
        fetch('/api/letters', { cache: 'no-store' }).catch(() => null)
      ]);
      
      let updated = false;
      if (memRes && memRes.ok) {
        this.serverMemories = await memRes.json();
        updated = true;
      }
      if (letRes && letRes.ok) {
        this.serverLetters = await letRes.json();
        updated = true;
      }
      
      // Auto-sync localStorage state to python backend for baking
      try {
        await fetch('/api/sync_state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memoryOrder: this.getMemoryOrder(),
            letterOrder: this.getLetterOrder(),
            customMemories: localStorage.getItem(STORAGE_KEYS.CUSTOM_MEMORIES) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_MEMORIES)) : [],
            communityLetters: localStorage.getItem(STORAGE_KEYS.COMMUNITY_LETTERS) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_LETTERS)) : []
          })
        });
      } catch (e) {
        // Ignore if sync fails
      }
      
      if (updated) {
        this.notify();
      }
    } catch (e) {
      // Backend not accessible
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('Error notifying letterStorage listener:', e);
      }
    });
  }

  getMyLetters() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MY_LETTER);
      if (!data) return [];
      const parsed = JSON.parse(data);
      // Backwards compatibility: if it's a single object (not array), wrap it in array
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.warn('Error reading my letters from localStorage:', e);
      return [];
    }
  }

  hasSubmittedLetter() {
    return this.getMyLetters().length > 0;
  }

  async fetchCommunityLetters() {
    try {
      const res = await fetch('/api/letters', { cache: 'no-store' });
      if (res.ok) {
        const serverLetters = await res.json();
        if (Array.isArray(serverLetters)) {
          // Merge with local community cache
          const localLetters = this.getCommunityLetters();
          const combinedMap = new Map();

          // Server letters take priority
          serverLetters.forEach((l) => combinedMap.set(l.id, l));
          // Local unsynced letters
          localLetters.forEach((l) => {
            if (!combinedMap.has(l.id)) combinedMap.set(l.id, l);
          });

          // Filter out explicitly deleted letters
          const deletedIds = this.getDeletedLetterIds();
          const merged = Array.from(combinedMap.values()).filter((l) => !deletedIds.includes(l.id));

          this.serverLetters = merged;

          try {
            localStorage.setItem(STORAGE_KEYS.COMMUNITY_LETTERS, JSON.stringify(merged));
          } catch (e) {
            console.warn('localStorage full, relying on server cache for letters');
          }
          this.notify();
          return merged;
        }
      }
    } catch (e) {
      // Backend not accessible, use local cache
    }
    return this.getCommunityLetters();
  }

  saveMyLetter(letterPayload) {
    try {
      const id = letterPayload.id || `let-user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      // Process media list (supports multiple images and videos)
      let media = [];
      if (Array.isArray(letterPayload.media) && letterPayload.media.length > 0) {
        media = letterPayload.media.map((m, idx) => ({
          id: m.id || `media-${Date.now()}-${idx}`,
          type: m.type || 'image',
          url: m.url || m.image,
          caption: (m.caption || '').trim(),
          name: m.name || `Attachment ${idx + 1}`
        })).filter(m => !!m.url);
      } else if (letterPayload.image) {
        media = [{
          id: `media-${Date.now()}-0`,
          type: 'image',
          url: letterPayload.image,
          caption: (letterPayload.caption || '').trim(),
          name: 'Photo Memory'
        }];
      }

      const letterData = {
        id,
        sender: (letterPayload.sender || '').trim(),
        relation: (letterPayload.relation || '').trim(),
        title: (letterPayload.title || '').trim() || 'Heartfelt Note',
        message: (letterPayload.message || '').trim(),
        media: media,
        // Keep primary image & caption for backwards compatibility
        image: media[0]?.url || null,
        caption: media[0]?.caption || (letterPayload.caption || '').trim() || null,
        timestamp: Date.now(),
        isCustom: true
      };

      // 1. Save as contributor's personal letters on this device
      const myLetters = this.getMyLetters();
      const existingMyLetterIdx = myLetters.findIndex(l => l.id === id);
      if (existingMyLetterIdx >= 0) {
        myLetters[existingMyLetterIdx] = letterData;
      } else {
        myLetters.push(letterData);
      }
      localStorage.setItem(STORAGE_KEYS.MY_LETTER, JSON.stringify(myLetters));

      // 2. Sync to local community letters
      const community = this.getCommunityLetters();
      const existingIdx = community.findIndex((l) => l.id === id);
      if (existingIdx >= 0) {
        community[existingIdx] = letterData;
      } else {
        community.unshift(letterData);
      }
      
      this.serverLetters = community;
      
      try {
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_LETTERS, JSON.stringify(community));
      } catch (e) {
        console.warn('localStorage full, relying on server sync for community letters');
      }

      // 3. Sync to backend server if available
      fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letterData)
      }).catch((e) => console.warn('Could not sync to server API:', e));

      this.notify();
      return letterData;
    } catch (e) {
      console.error('Error saving letter to localStorage:', e);
      return null;
    }
  }

  getCommunityLetters() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_LETTERS);
      const localList = data ? JSON.parse(data) : [];
      const deletedIds = this.getDeletedLetterIds();
      
      const combinedMap = new Map();
      this.serverLetters.forEach(l => combinedMap.set(l.id, l));
      localList.forEach(l => {
        if (!combinedMap.has(l.id)) combinedMap.set(l.id, l);
      });
      
      return Array.from(combinedMap.values()).filter(l => !deletedIds.includes(l.id));
    } catch (e) {
      console.warn('Error reading community letters:', e);
      return [];
    }
  }

  getDeletedLetterIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_LETTER_IDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getDeletedMemoryIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_MEMORY_IDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getAllLetters(defaultLetters = []) {
    const community = this.getCommunityLetters();
    const deletedIds = this.getDeletedLetterIds();
    const activeDefaults = defaultLetters.filter((l) => !deletedIds.includes(l.id));

    // Merge baked letters, avoiding duplicates with community/defaults
    const activeBaked = BAKED_LETTERS.filter(
      (b) => !deletedIds.includes(b.id) && 
             !community.some((c) => c.id === b.id) &&
             !activeDefaults.some((d) => d.id === b.id)
    );

    const combined = [...community, ...activeBaked, ...activeDefaults];
    
    // Sort combined letters based on saved order
    const order = this.getLetterOrder();
    if (order && order.length > 0) {
      combined.sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        // If both exist in order array, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // If only A exists, it comes first
        if (indexA !== -1) return -1;
        // If only B exists, it comes first
        if (indexB !== -1) return 1;
        // If neither exists, maintain relative order (or default sorting)
        return 0;
      });
    }

    return combined;
  }

  getLetterOrder() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LETTER_ORDER);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveLetterOrder(orderedIds) {
    try {
      localStorage.setItem(STORAGE_KEYS.LETTER_ORDER, JSON.stringify(orderedIds));
      this.notify();
    } catch (e) {
      console.error('Error saving letter order:', e);
    }
  }

  getMemoryOrder() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORY_ORDER);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveMemoryOrder(orderedIds) {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORY_ORDER, JSON.stringify(orderedIds));
      this.notify();
    } catch (e) {
      console.error('Error saving memory order:', e);
    }
  }

  getCustomMemories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_MEMORIES);
      const list = data ? JSON.parse(data) : [];
      const deletedIds = this.getDeletedMemoryIds();
      
      const activeLocal = list.filter(m => !deletedIds.includes(m.id));
      const activeServer = this.serverMemories.filter(m => !deletedIds.includes(m.id));
      
      const combinedMap = new Map();
      activeServer.forEach(m => combinedMap.set(m.id, m));
      activeLocal.forEach(m => {
        if (!combinedMap.has(m.id)) combinedMap.set(m.id, m);
      });
      const activeCombined = Array.from(combinedMap.values());
      
      const activeBaked = BAKED_MEMORIES.filter(
        b => !deletedIds.includes(b.id) && !activeCombined.some((l) => l.id === b.id)
      );
      
      return [...activeCombined, ...activeBaked];
    } catch (e) {
      console.warn('Error reading custom memories:', e);
      return [];
    }
  }

  addCustomMemory(payload) {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.CUSTOM_MEMORIES);
      const list = existing ? JSON.parse(existing) : [];
      
      const newMemory = {
        id: `custom-mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: payload.type || 'image',
        image: payload.url,
        videoUrl: payload.type === 'video' ? payload.url : null,
        caption: (payload.caption || '').trim(),
        date: 'my memory ♡',
        title: payload.type === 'video' ? 'Video' : 'Photo',
        rotation: (Math.random() - 0.5) * 4,
        isCustom: true
      };

      list.unshift(newMemory);
      this.serverMemories.unshift(newMemory);
      
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_MEMORIES, JSON.stringify(list));
      } catch (e) {
        console.warn('localStorage full, relying on server sync for custom memory');
      }

      // Sync to backend server if available
      fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemory)
      }).catch((e) => console.warn('Could not sync memory to server API:', e));

      this.notify();
      return newMemory;
    } catch (e) {
      console.error('Error saving custom memory to localStorage:', e);
      return null;
    }
  }

  updateMemoryCaption(memId, newCaption) {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.CUSTOM_MEMORIES);
      if (!existing) return false;
      const list = JSON.parse(existing);
      const idx = list.findIndex(m => m.id === memId);
      if (idx !== -1) {
        list[idx].caption = newCaption;
        try {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_MEMORIES, JSON.stringify(list));
        } catch (e) {
          console.warn('localStorage full for updating caption');
        }
        
        // Also update in-memory
        const sIdx = this.serverMemories.findIndex(m => m.id === memId);
        if (sIdx !== -1) this.serverMemories[sIdx].caption = newCaption;
        
        // Sync update to backend
        fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(list[idx])
        }).catch((e) => console.warn('Could not sync memory update to server API:', e));

        this.notify();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating custom memory caption:', e);
      return false;
    }
  }

  getMyUploadedMemories() {
    const myLetters = this.getMyLetters();
    if (myLetters.length === 0) return [];

    const deletedMemIds = this.getDeletedMemoryIds();
    const memories = [];

    myLetters.forEach(myLetter => {
      if (Array.isArray(myLetter.media) && myLetter.media.length > 0) {
        myLetter.media.forEach((m, idx) => {
          const memId = `my-media-${myLetter.id}-${m.id || idx}`;
          if (!deletedMemIds.includes(memId) && !deletedMemIds.includes(`uploaded-${myLetter.id}-${m.id || idx}`)) {
            memories.push({
              id: memId,
              letterId: myLetter.id,
              mediaId: m.id || `m-${idx}`,
              type: m.type || 'image',
              image: m.url,
              videoUrl: m.type === 'video' ? m.url : null,
              caption: m.caption || 'your memory ♡',
              date: myLetter.relation || (myLetter.sender ? `by ${myLetter.sender}` : 'my memory ♡'),
              title: myLetter.sender || (m.type === 'video' ? 'Your Video' : 'Your Photo'),
              rotation: idx % 2 === 0 ? -1.8 : 1.8,
              isCustom: true
            });
          }
        });
      } else if (myLetter.image) {
        const myPhotoId = `my-photo-${myLetter.id}`;
        if (!deletedMemIds.includes(myPhotoId)) {
          memories.push({
            id: myPhotoId,
            letterId: myLetter.id,
            type: 'image',
            image: myLetter.image,
            caption: myLetter.caption || 'your photo memory ♡',
            date: myLetter.relation || (myLetter.sender ? `by ${myLetter.sender}` : 'my memory ♡'),
            title: myLetter.sender || 'Your Photo',
            rotation: -1.8,
            isCustom: true
          });
        }
      }
    });

    return memories;
  }

  getAllMemories(defaultMemories = []) {
    const community = this.getCommunityLetters();
    const deletedLetterIds = this.getDeletedLetterIds();
    const deletedMemIds = this.getDeletedMemoryIds();
    const uploaded = [];

    community.forEach((l, letterIdx) => {
      if (deletedLetterIds.includes(l.id)) return;

      if (Array.isArray(l.media) && l.media.length > 0) {
        l.media.forEach((m, mIdx) => {
          const memId = `uploaded-${l.id}-${m.id || mIdx}`;
          if (!deletedMemIds.includes(memId) && !deletedMemIds.includes(`my-media-${l.id}-${m.id || mIdx}`)) {
            uploaded.push({
              id: memId,
              letterId: l.id,
              mediaId: m.id || `m-${mIdx}`,
              type: m.type || 'image',
              image: m.url,
              videoUrl: m.type === 'video' ? m.url : null,
              caption: m.caption || '',
              date: l.relation || (l.sender ? `from ${l.sender}` : '♡'),
              title: l.sender || (m.type === 'video' ? 'Video Note' : 'Photo Note'),
              rotation: (letterIdx + mIdx) % 2 === 0 ? -1.8 : 1.8,
              isCustom: true
            });
          }
        });
      } else if (l.image) {
        const memId = `uploaded-${l.id}`;
        if (!deletedMemIds.includes(memId)) {
          uploaded.push({
            id: memId,
            letterId: l.id,
            type: 'image',
            image: l.image,
            caption: l.caption || '',
            date: l.relation || (l.sender ? `from ${l.sender}` : '♡'),
            title: l.sender || 'Memory Note',
            rotation: letterIdx % 2 === 0 ? -1.8 : 1.8,
            isCustom: true
          });
        }
      }
    });

    const activeDefaults = defaultMemories
      .filter((m) => m && (m.image || m.videoUrl) && !deletedLetterIds.includes(m.id) && !deletedMemIds.includes(m.id))
      .map(m => ({
        ...m,
        type: m.type || 'image'
      }));

    const customStandalone = this.getCustomMemories();

    const combined = [...customStandalone, ...uploaded, ...activeDefaults];

    // Sort combined memories based on saved order
    const order = this.getMemoryOrder();
    if (order && order.length > 0) {
      combined.sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }

    return combined;
  }

  deleteLetter(letterId) {
    try {
      // 1. Mark as deleted in deletedIds list
      const deletedIds = this.getDeletedLetterIds();
      if (!deletedIds.includes(letterId)) {
        deletedIds.push(letterId);
        localStorage.setItem(STORAGE_KEYS.DELETED_LETTER_IDS, JSON.stringify(deletedIds));
      }

      // Also mark all its attached memories as deleted
      const deletedMemIds = this.getDeletedMemoryIds();
      deletedMemIds.push(`uploaded-${letterId}`);
      deletedMemIds.push(`my-photo-${letterId}`);
      localStorage.setItem(STORAGE_KEYS.DELETED_MEMORY_IDS, JSON.stringify(deletedMemIds));

      // 2. Remove from community letters
      const community = this.getCommunityLetters().filter((l) => l.id !== letterId);
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_LETTERS, JSON.stringify(community));

      // 3. If it was my local letter, remove it too
      const myLetter = this.getMyLetter();
      if (myLetter && myLetter.id === letterId) {
        localStorage.removeItem(STORAGE_KEYS.MY_LETTER);
      }

      // 4. Send delete request to backend API
      fetch(`/api/letters?id=${encodeURIComponent(letterId)}`, {
        method: 'DELETE'
      }).catch((e) => console.warn('Could not sync delete to server API:', e));

      this.notify();
      return true;
    } catch (e) {
      console.error('Error deleting letter:', e);
      return false;
    }
  }

  deleteMemory(memoryId) {
    try {
      // 1. Track deleted memory ID
      const deletedMemIds = this.getDeletedMemoryIds();
      if (!deletedMemIds.includes(memoryId)) {
        deletedMemIds.push(memoryId);
        localStorage.setItem(STORAGE_KEYS.DELETED_MEMORY_IDS, JSON.stringify(deletedMemIds));

        // Sync delete to backend API
        fetch(`/api/memories?id=${encodeURIComponent(memoryId)}`, {
          method: 'DELETE'
        }).catch((e) => console.warn('Could not sync memory deletion to server API:', e));
      }

      // 2. Remove from community letters' media array
      const community = this.getCommunityLetters();
      let updatedCommunity = false;

      community.forEach((l) => {
        if (Array.isArray(l.media)) {
          const origLen = l.media.length;
          l.media = l.media.filter(m => {
            const memId1 = `uploaded-${l.id}-${m.id}`;
            const memId2 = `my-media-${l.id}-${m.id}`;
            return memId1 !== memoryId && memId2 !== memoryId && m.id !== memoryId;
          });
          if (l.media.length !== origLen) {
            updatedCommunity = true;
            l.image = l.media[0]?.url || null;
            l.caption = l.media[0]?.caption || null;
          }
        } else if (`uploaded-${l.id}` === memoryId || `my-photo-${l.id}` === memoryId || l.id === memoryId) {
          l.image = null;
          l.caption = null;
          updatedCommunity = true;
        }

        if (updatedCommunity) {
          fetch('/api/letters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(l)
          }).catch((e) => console.warn('Could not sync memory deletion to server API:', e));
        }
      });

      if (updatedCommunity) {
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_LETTERS, JSON.stringify(community));
      }

      // 3. Update myLetter if applicable
      const myLetter = this.getMyLetter();
      if (myLetter) {
        if (Array.isArray(myLetter.media)) {
          myLetter.media = myLetter.media.filter(m => {
            const memId1 = `uploaded-${myLetter.id}-${m.id}`;
            const memId2 = `my-media-${myLetter.id}-${m.id}`;
            return memId1 !== memoryId && memId2 !== memoryId && m.id !== memoryId;
          });
          myLetter.image = myLetter.media[0]?.url || null;
          myLetter.caption = myLetter.media[0]?.caption || null;
          localStorage.setItem(STORAGE_KEYS.MY_LETTER, JSON.stringify(myLetter));
        } else if (`uploaded-${myLetter.id}` === memoryId || `my-photo-${myLetter.id}` === memoryId || myLetter.id === memoryId) {
          myLetter.image = null;
          myLetter.caption = null;
          localStorage.setItem(STORAGE_KEYS.MY_LETTER, JSON.stringify(myLetter));
        }
      }

      this.notify();
      return true;
    } catch (e) {
      console.error('Error deleting memory:', e);
      return false;
    }
  }

  deleteMyLetter() {
    const existing = this.getMyLetter();
    if (existing) {
      return this.deleteLetter(existing.id);
    }
    return true;
  }
}

export const letterStorage = new LetterStorageService();
