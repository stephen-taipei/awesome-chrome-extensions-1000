// Job Posting - Popup Script

class JobPosting {
  constructor() {
    this.jobs = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.titleEl = document.getElementById('title');
    this.companyEl = document.getElementById('company');
    this.locationEl = document.getElementById('location');
    this.typeEl = document.getElementById('type');
    this.responsibilitiesEl = document.getElementById('responsibilities');
    this.requirementsEl = document.getElementById('requirements');
    this.benefitsEl = document.getElementById('benefits');
    this.copyBtn = document.getElementById('copyJob');
    this.saveBtn = document.getElementById('saveJob');
    this.listEl = document.getElementById('jobList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyJob());
    this.saveBtn.addEventListener('click', () => this.saveJob());
  }

  async loadData() {
    const result = await chrome.storage.local.get('jobPostings');
    if (result.jobPostings) {
      this.jobs = result.jobPostings;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ jobPostings: this.jobs });
  }

  getTypeLabel(type) {
    const labels = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      contract: 'Contract',
      remote: 'Remote'
    };
    return labels[type] || type;
  }

  formatJob() {
    const title = this.titleEl.value.trim();
    const company = this.companyEl.value.trim();
    const location = this.locationEl.value.trim();
    const type = this.typeEl.value;
    const responsibilities = this.responsibilitiesEl.value.trim();
    const requirements = this.requirementsEl.value.trim();
    const benefits = this.benefitsEl.value.trim();

    let posting = `📋 ${title || 'Job Title'}\n`;
    if (company) posting += `🏢 ${company}\n`;
    if (location) posting += `📍 ${location}`;
    posting += ` | ${this.getTypeLabel(type)}\n\n`;

    if (responsibilities) {
      posting += '📌 Responsibilities:\n';
      responsibilities.split('\n').forEach(r => {
        if (r.trim()) posting += `• ${r.trim()}\n`;
      });
      posting += '\n';
    }

    if (requirements) {
      posting += '✅ Requirements:\n';
      requirements.split('\n').forEach(r => {
        if (r.trim()) posting += `• ${r.trim()}\n`;
      });
      posting += '\n';
    }

    if (benefits) {
      posting += `🎁 Benefits: ${benefits}\n\n`;
    }

    posting += '📧 Apply now!';

    return posting;
  }

  async copyJob() {
    const text = this.formatJob();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveJob() {
    const title = this.titleEl.value.trim();
    if (!title) return;

    const job = {
      id: Date.now(),
      title,
      company: this.companyEl.value.trim(),
      location: this.locationEl.value.trim(),
      type: this.typeEl.value,
      responsibilities: this.responsibilitiesEl.value.trim(),
      requirements: this.requirementsEl.value.trim(),
      benefits: this.benefitsEl.value.trim(),
      created: Date.now()
    };

    this.jobs.unshift(job);
    if (this.jobs.length > 15) {
      this.jobs.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadJob(id) {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      this.titleEl.value = job.title || '';
      this.companyEl.value = job.company || '';
      this.locationEl.value = job.location || '';
      this.typeEl.value = job.type || 'full-time';
      this.responsibilitiesEl.value = job.responsibilities || '';
      this.requirementsEl.value = job.requirements || '';
      this.benefitsEl.value = job.benefits || '';
    }
  }

  deleteJob(id) {
    this.jobs = this.jobs.filter(j => j.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.jobs.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved postings</div>';
      return;
    }

    this.listEl.innerHTML = this.jobs.map(j => `
      <div class="job-item">
        <div class="job-info">
          <div class="job-title">${this.escapeHtml(j.title)}</div>
          <div class="job-type">${this.getTypeLabel(j.type)}</div>
        </div>
        <div class="job-actions">
          <button class="load-btn" data-load="${j.id}">Load</button>
          <button class="delete-btn" data-delete="${j.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadJob(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteJob(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new JobPosting());
