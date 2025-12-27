// Poll Creator - Popup Script

class PollCreator {
  constructor() {
    this.polls = [];
    this.activePoll = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.questionEl = document.getElementById('question');
    this.optionsEl = document.getElementById('options');
    this.addOptionBtn = document.getElementById('addOption');
    this.createBtn = document.getElementById('createPoll');
    this.activePollSection = document.getElementById('activePoll');
    this.pollViewEl = document.getElementById('pollView');
    this.listEl = document.getElementById('pollsList');
  }

  bindEvents() {
    this.addOptionBtn.addEventListener('click', () => this.addOption());
    this.createBtn.addEventListener('click', () => this.createPoll());
  }

  async loadData() {
    const result = await chrome.storage.local.get(['polls', 'activePoll']);
    if (result.polls) {
      this.polls = result.polls;
    }
    if (result.activePoll) {
      this.activePoll = result.activePoll;
      this.renderActivePoll();
    }
    this.renderPolls();
  }

  async saveData() {
    await chrome.storage.local.set({
      polls: this.polls,
      activePoll: this.activePoll
    });
  }

  addOption() {
    const inputs = this.optionsEl.querySelectorAll('.option-input');
    if (inputs.length >= 6) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option-input';
    input.placeholder = `Option ${inputs.length + 1}`;
    this.optionsEl.appendChild(input);
  }

  createPoll() {
    const question = this.questionEl.value.trim();
    const optionInputs = this.optionsEl.querySelectorAll('.option-input');
    const options = Array.from(optionInputs)
      .map(input => input.value.trim())
      .filter(text => text);

    if (!question || options.length < 2) {
      return;
    }

    const poll = {
      id: Date.now(),
      question,
      options: options.map(text => ({ text, votes: 0 })),
      totalVotes: 0,
      createdAt: Date.now()
    };

    this.polls.unshift(poll);
    this.activePoll = poll;
    this.saveData();

    // Clear form
    this.questionEl.value = '';
    this.optionsEl.innerHTML = `
      <input type="text" class="option-input" placeholder="Option 1">
      <input type="text" class="option-input" placeholder="Option 2">
    `;

    this.renderActivePoll();
    this.renderPolls();
  }

  vote(optionIndex) {
    if (!this.activePoll) return;
    this.activePoll.options[optionIndex].votes++;
    this.activePoll.totalVotes++;
    this.saveData();
    this.renderActivePoll();
  }

  resetVotes() {
    if (!this.activePoll) return;
    this.activePoll.options.forEach(opt => opt.votes = 0);
    this.activePoll.totalVotes = 0;
    this.saveData();
    this.renderActivePoll();
  }

  async copyPoll() {
    if (!this.activePoll) return;
    let text = `📊 ${this.activePoll.question}\n\n`;
    this.activePoll.options.forEach((opt, i) => {
      const percent = this.activePoll.totalVotes > 0
        ? Math.round((opt.votes / this.activePoll.totalVotes) * 100)
        : 0;
      text += `${i + 1}. ${opt.text} - ${opt.votes} votes (${percent}%)\n`;
    });
    text += `\nTotal votes: ${this.activePoll.totalVotes}`;

    await navigator.clipboard.writeText(text);
    const btn = document.querySelector('.copy-poll-btn');
    if (btn) {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy Results', 1000);
    }
  }

  loadPoll(id) {
    const poll = this.polls.find(p => p.id === id);
    if (poll) {
      this.activePoll = poll;
      this.saveData();
      this.renderActivePoll();
    }
  }

  deletePoll(id) {
    this.polls = this.polls.filter(p => p.id !== id);
    if (this.activePoll && this.activePoll.id === id) {
      this.activePoll = null;
      this.activePollSection.style.display = 'none';
    }
    this.saveData();
    this.renderPolls();
  }

  renderActivePoll() {
    if (!this.activePoll) {
      this.activePollSection.style.display = 'none';
      return;
    }

    this.activePollSection.style.display = 'block';
    const total = this.activePoll.totalVotes || 1;

    this.pollViewEl.innerHTML = `
      <div class="poll-question">${this.escapeHtml(this.activePoll.question)}</div>
      ${this.activePoll.options.map((opt, i) => {
        const percent = Math.round((opt.votes / total) * 100);
        return `
          <div class="poll-option">
            <div class="poll-option-bar" data-vote="${i}">
              <span class="poll-option-text">${this.escapeHtml(opt.text)}</span>
              <span class="poll-option-votes">${opt.votes}</span>
            </div>
            <div class="poll-option-progress">
              <div class="poll-option-progress-bar" style="width: ${this.activePoll.totalVotes ? percent : 0}%"></div>
            </div>
          </div>
        `;
      }).join('')}
      <div class="poll-actions">
        <button class="copy-poll-btn">Copy Results</button>
        <button class="reset-btn">Reset</button>
      </div>
    `;

    this.pollViewEl.querySelectorAll('[data-vote]').forEach(el => {
      el.addEventListener('click', () => this.vote(parseInt(el.dataset.vote)));
    });

    this.pollViewEl.querySelector('.copy-poll-btn').addEventListener('click', () => this.copyPoll());
    this.pollViewEl.querySelector('.reset-btn').addEventListener('click', () => this.resetVotes());
  }

  renderPolls() {
    if (this.polls.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved polls yet</div>';
      return;
    }

    this.listEl.innerHTML = this.polls.map(poll => `
      <div class="poll-item">
        <span class="poll-item-question">${this.escapeHtml(poll.question)}</span>
        <div class="poll-item-actions">
          <button class="load-btn" data-load="${poll.id}">Load</button>
          <button class="delete-poll-btn" data-delete="${poll.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadPoll(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deletePoll(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new PollCreator());
