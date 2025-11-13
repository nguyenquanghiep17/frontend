<template>
  <div class="inbox-view">
    <div class="view-header">
      <h2>📥 Inbox</h2>
      <div class="account-selector">
        <label>Account:</label>
        <input 
          v-model="selectedAccount" 
          type="text" 
          placeholder="your-email@gmail.com"
          class="account-input"
        />
        <button @click="loadEmails" class="btn-primary">Load Emails</button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading emails...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="emails.length === 0" class="empty">No emails found</div>
    <div v-else class="email-list">
      <div 
        v-for="email in emails" 
        :key="email.id"
        class="email-item"
        :class="{ 'unread': !email.isRead }"
        @click="selectEmail(email)"
      >
        <div class="email-header">
          <div class="email-from">{{ email.from }}</div>
          <div class="email-date">{{ formatDate(email.date) }}</div>
        </div>
        <div class="email-subject">{{ email.subject || '(No Subject)' }}</div>
        <div class="email-preview">{{ getPreview(email.body) }}</div>
        <div v-if="email.attachments.length > 0" class="email-attachments">
          📎 {{ email.attachments.length }} attachment(s)
        </div>
      </div>
    </div>

    <div v-if="selectedEmail" class="email-detail-modal" @click.self="selectedEmail = null">
      <div class="email-detail-content" @click.stop>
        <button class="close-btn" @click="selectedEmail = null">×</button>
        <div class="email-detail-header">
          <h3>{{ selectedEmail.subject || '(No Subject)' }}</h3>
          <div class="email-detail-meta">
            <div><strong>From:</strong> {{ selectedEmail.from }}</div>
            <div><strong>To:</strong> {{ selectedEmail.to.join(', ') }}</div>
            <div v-if="selectedEmail.cc.length > 0">
              <strong>CC:</strong> {{ selectedEmail.cc.join(', ') }}
            </div>
            <div><strong>Date:</strong> {{ formatDate(selectedEmail.date) }}</div>
          </div>
        </div>
        <div 
          class="email-detail-body"
          :class="{ 'html-content': selectedEmail.isHtml }"
          v-html="selectedEmail.isHtml ? selectedEmail.body : formatText(selectedEmail.body)"
        ></div>
        <div v-if="selectedEmail.attachments.length > 0" class="email-detail-attachments">
          <h4>Attachments:</h4>
          <ul>
            <li v-for="(att, idx) in selectedEmail.attachments" :key="idx">
              {{ att.fileName }} ({{ formatFileSize(att.size) }})
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mailService } from '../services/mailService'

export default {
  name: 'InboxView',
  data() {
    return {
      emails: [],
      loading: false,
      error: null,
      selectedAccount: 'your-email@gmail.com',
      selectedEmail: null
    }
  },
  methods: {
    async loadEmails() {
      if (!this.selectedAccount) {
        this.error = 'Please enter an account email'
        return
      }

      this.loading = true
      this.error = null
      try {
        this.emails = await mailService.getInboxEmails(this.selectedAccount)
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Failed to load emails'
      } finally {
        this.loading = false
      }
    },
    selectEmail(email) {
      this.selectedEmail = email
    },
    formatDate(date) {
      return new Date(date).toLocaleString('vi-VN')
    },
    getPreview(body) {
      if (!body) return ''
      const text = body.replace(/<[^>]*>/g, '').trim()
      return text.length > 100 ? text.substring(0, 100) + '...' : text
    },
    formatText(text) {
      if (!text) return ''
      return text.replace(/\n/g, '<br>')
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.inbox-view {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.view-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.view-header h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.account-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.account-selector label {
  font-weight: 500;
  color: #666;
}

.account-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 250px;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #5568d3;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #e74c3c;
}

.email-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.email-item {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.email-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.email-item.unread {
  border-left: 4px solid #667eea;
  background: #f8f9ff;
}

.email-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.email-from {
  font-weight: 600;
  color: #333;
}

.email-date {
  color: #999;
  font-size: 0.9rem;
}

.email-subject {
  font-weight: 500;
  color: #444;
  margin-bottom: 0.5rem;
}

.email-preview {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.email-attachments {
  margin-top: 0.5rem;
  color: #667eea;
  font-size: 0.85rem;
}

.email-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.email-detail-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.email-detail-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.email-detail-header h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.email-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.email-detail-body {
  line-height: 1.8;
  color: #333;
  margin-bottom: 2rem;
}

.email-detail-body.html-content {
  word-wrap: break-word;
}

.email-detail-attachments {
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.email-detail-attachments h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.email-detail-attachments ul {
  list-style: none;
  padding-left: 0;
}

.email-detail-attachments li {
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
</style>

