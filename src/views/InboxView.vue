<template>
  <div class="gmail-inbox">
    <div class="mail-toolbar">
      <div class="toolbar-left">
        <div class="toolbar-controls">
          <button class="icon-btn" aria-label="Select">
            ☐
          </button>
          <button class="icon-btn" aria-label="Refresh" @click="loadEmails">
            🔄
          </button>
        </div>
        <div class="toolbar-tabs">
          <button class="tab active">Primary</button>
          <button class="tab">Social</button>
          <button class="tab">Promotions</button>
        </div>
      </div>
      <div class="account-panel">
        <label>Account</label>
        <input 
          v-model="selectedAccount" 
          type="text" 
          placeholder="your-email@gmail.com"
        />
        <button class="primary-btn" @click="loadEmails">Tải thư</button>
      </div>
    </div>

    <div v-if="hasRealtimeError" class="banner warning">
      ⚠️ Không thể kết nối realtime. Vui lòng tải lại thủ công.
    </div>
    <div v-if="error" class="banner error">{{ error }}</div>

    <div class="mail-surface">
      <div class="mail-list" role="list">
        <div v-if="loading" class="mail-state">Đang tải thư...</div>
        <div v-else-if="emails.length === 0" class="mail-state empty">Không có thư nào</div>
        <template v-else>
          <div 
            v-for="email in emails" 
            :key="email.id"
            class="mail-row"
            :class="{ unread: !email.isRead, selected: selectedEmail && selectedEmail.id === email.id }"
            role="listitem"
            @click="selectEmail(email)"
          >
            <div class="row-toggle">
              <input type="checkbox" />
              <button class="star-btn" :class="{ starred: email.isImportant }">☆</button>
            </div>
            <div class="row-main">
              <span class="sender">{{ email.from || 'Không rõ người gửi' }}</span>
              <span class="subject-line">
                <span class="subject">{{ email.subject || '(Không tiêu đề)' }}</span>
                <span class="snippet"> - {{ getPreview(email.body) }}</span>
                <span v-if="email.attachments.length" class="clip">📎</span>
              </span>
            </div>
            <div class="row-date">{{ formatDate(email.date) }}</div>
          </div>
        </template>
      </div>

      <div class="mail-detail" v-if="selectedEmail">
        <div class="detail-header">
          <div>
            <div class="detail-label">Hộp thư đến • Primary</div>
            <h2>{{ selectedEmail.subject || '(Không tiêu đề)' }}</h2>
          </div>
          <div class="detail-actions">
            <button class="icon-btn" @click="selectedEmail = null">✖</button>
          </div>
        </div>

        <div class="detail-meta">
          <div class="author">
            <div class="avatar small">{{ initials(selectedEmail.from) }}</div>
            <div>
              <div class="from">{{ selectedEmail.from }}</div>
              <div class="to">Đến: {{ selectedEmail.to.join(', ') }}</div>
            </div>
          </div>
          <div class="detail-date">{{ formatDate(selectedEmail.date) }}</div>
        </div>

        <div 
          class="detail-body"
          :class="{ 'html-content': selectedEmail.isHtml }"
          v-html="selectedEmail.isHtml ? selectedEmail.body : formatText(selectedEmail.body)"
        ></div>

        <div v-if="selectedEmail.attachments.length > 0" class="detail-attachments">
          <h4>Đính kèm</h4>
          <div class="attachment-chip" v-for="(att, idx) in selectedEmail.attachments" :key="idx">
            <div class="chip-icon">📄</div>
            <div>
              <div class="chip-title">{{ att.fileName }}</div>
              <div class="chip-size">{{ formatFileSize(att.size) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mailService } from '../services/mailService'
import { subscribeToMail } from '../services/realtimeService'

export default {
  name: 'InboxView',
  data() {
    return {
      emails: [],
      loading: false,
      error: null,
      selectedAccount: 'nqhiep@nqhiep.online',
      selectedEmail: null,
      unsubscribeRealtime: null,
      subscribedAccount: null,
      hasRealtimeError: false
    }
  },
  async mounted() {
    await this.loadEmails()
  },
  async beforeUnmount() {
    if (this.unsubscribeRealtime) {
      await this.unsubscribeRealtime()
      this.unsubscribeRealtime = null
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
        await this.setupRealtimeSubscription()
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
      const d = new Date(date)
      const today = new Date()
      if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })
    },
    getPreview(body) {
      if (!body) return ''
      const text = body.replace(/<[^>]*>/g, '').trim()
      return text.length > 80 ? text.substring(0, 80) + '...' : text
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
    },
    async setupRealtimeSubscription() {
      if (this.subscribedAccount === this.selectedAccount && this.unsubscribeRealtime) {
        return
      }

      if (this.unsubscribeRealtime) {
        await this.unsubscribeRealtime()
        this.unsubscribeRealtime = null
        this.subscribedAccount = null
      }

      if (!this.selectedAccount) return

      try {
        this.unsubscribeRealtime = await subscribeToMail(this.selectedAccount, this.handleIncomingEmail)
        this.subscribedAccount = this.selectedAccount
        this.hasRealtimeError = false
      } catch (err) {
        console.error('Failed to subscribe to realtime updates', err)
        this.hasRealtimeError = true
      }
    },
    handleIncomingEmail(email) {
      if (!email || !email.id) return

      const exists = this.emails.some(e => e.id === email.id)
      if (exists) {
        this.emails = this.emails.map(item => item.id === email.id ? email : item)
        return
      }

      this.emails = [email, ...this.emails].sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    initials(value) {
      if (!value) return '??'
      const clean = value.replace(/[<>"]/g, '').trim()
      const parts = clean.split(/\s+/)
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
  }
}
</script>

<style scoped>
@import '../styles/mailLayout.css';
</style>


