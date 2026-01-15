document.addEventListener('DOMContentLoaded', () => {
  const dueCount = document.getElementById('dueCount');
  const topicInput = document.getElementById('topicInput');
  const notesInput = document.getElementById('notesInput');
  const addTopicBtn = document.getElementById('addTopicBtn');
  const dueList = document.getElementById('dueList');
  const upcomingList = document.getElementById('upcomingList');
  const totalTopics = document.getElementById('totalTopics');
  const reviewedToday = document.getElementById('reviewedToday');
  const avgInterval = document.getElementById('avgInterval');

  loadTopics();

  addTopicBtn.addEventListener('click', addTopic);
  topicInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTopic();
  });

  function addTopic() {
    const name = topicInput.value.trim();
    if (!name) return;

    chrome.storage.local.get(['reviewTopics'], (result) => {
      const topics = result.reviewTopics || [];

      topics.push({
        id: Date.now(),
        name: name,
        notes: notesInput.value.trim(),
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date().toISOString().split('T')[0],
        reviewCount: 0
      });

      chrome.storage.local.set({ reviewTopics: topics }, () => {
        topicInput.value = '';
        notesInput.value = '';
        loadTopics();
      });
    });
  }

  function loadTopics() {
    chrome.storage.local.get(['reviewTopics', 'reviewHistory'], (result) => {
      const topics = result.reviewTopics || [];
      const history = result.reviewHistory || {};
      const today = new Date().toISOString().split('T')[0];

      const dueTopics = topics.filter(t => t.nextReview <= today);
      const upcomingTopics = topics.filter(t => t.nextReview > today)
        .sort((a, b) => a.nextReview.localeCompare(b.nextReview))
        .slice(0, 5);

      dueCount.textContent = dueTopics.length;
      totalTopics.textContent = topics.length;
      reviewedToday.textContent = history[today] || 0;

      const intervals = topics.map(t => t.interval);
      avgInterval.textContent = intervals.length > 0
        ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
        : 0;

      renderDueTopics(dueTopics);
      renderUpcomingTopics(upcomingTopics);
    });
  }

  function renderDueTopics(topics) {
    if (topics.length === 0) {
      dueList.innerHTML = '<p class="empty-message">No topics due today</p>';
      return;
    }

    dueList.innerHTML = topics.map(t => `
      <div class="topic-item due">
        <div class="actions">
          <button class="action-btn delete-btn" data-id="${t.id}">&times;</button>
        </div>
        <div class="name">${escapeHtml(t.name)}</div>
        ${t.notes ? `<div class="notes">${escapeHtml(t.notes)}</div>` : ''}
        <div class="meta">
          <span>Interval: <span class="interval">${t.interval} days</span></span>
          <span>Reviews: ${t.reviewCount}</span>
        </div>
        <div class="quality-buttons">
          <button class="quality-btn hard" data-id="${t.id}" data-quality="hard">Hard</button>
          <button class="quality-btn good" data-id="${t.id}" data-quality="good">Good</button>
          <button class="quality-btn easy" data-id="${t.id}" data-quality="easy">Easy</button>
        </div>
      </div>
    `).join('');

    dueList.querySelectorAll('.quality-btn').forEach(btn => {
      btn.addEventListener('click', () => reviewTopic(parseInt(btn.dataset.id), btn.dataset.quality));
    });

    dueList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteTopic(parseInt(btn.dataset.id)));
    });
  }

  function renderUpcomingTopics(topics) {
    if (topics.length === 0) {
      upcomingList.innerHTML = '<p class="empty-message">No upcoming reviews</p>';
      return;
    }

    upcomingList.innerHTML = topics.map(t => {
      const daysUntil = Math.ceil((new Date(t.nextReview) - new Date()) / (1000 * 60 * 60 * 24));
      return `
        <div class="topic-item upcoming">
          <div class="actions">
            <button class="action-btn delete-btn" data-id="${t.id}">&times;</button>
          </div>
          <div class="name">${escapeHtml(t.name)}</div>
          <div class="meta">
            <span>In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}</span>
            <span class="interval">${t.interval} day interval</span>
          </div>
        </div>
      `;
    }).join('');

    upcomingList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteTopic(parseInt(btn.dataset.id)));
    });
  }

  function reviewTopic(id, quality) {
    chrome.storage.local.get(['reviewTopics', 'reviewHistory'], (result) => {
      const topics = result.reviewTopics || [];
      const history = result.reviewHistory || {};
      const today = new Date().toISOString().split('T')[0];

      const topic = topics.find(t => t.id === id);
      if (!topic) return;

      let qualityScore;
      switch (quality) {
        case 'hard': qualityScore = 2; break;
        case 'good': qualityScore = 3; break;
        case 'easy': qualityScore = 5; break;
        default: qualityScore = 3;
      }

      topic.easeFactor = Math.max(1.3, topic.easeFactor + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02)));

      if (qualityScore < 3) {
        topic.interval = 1;
      } else {
        topic.interval = Math.round(topic.interval * topic.easeFactor);
      }

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + topic.interval);
      topic.nextReview = nextDate.toISOString().split('T')[0];
      topic.reviewCount++;

      history[today] = (history[today] || 0) + 1;

      chrome.storage.local.set({ reviewTopics: topics, reviewHistory: history }, loadTopics);
    });
  }

  function deleteTopic(id) {
    chrome.storage.local.get(['reviewTopics'], (result) => {
      const topics = (result.reviewTopics || []).filter(t => t.id !== id);
      chrome.storage.local.set({ reviewTopics: topics }, loadTopics);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
