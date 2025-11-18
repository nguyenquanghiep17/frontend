<template>
  <div class="gmail-shell">
    <header class="gmail-header">
      <div class="header-left">
        <button class="icon-button" aria-label="Menu">
          <span class="material-icon">☰</span>
        </button>
        <div class="logo">
          <span class="logo-icon">✉️</span>
          <div class="logo-text">
            <span class="brand">Mail</span>
            <span class="brand-sub">Client</span>
          </div>
        </div>
      </div>

      <div class="header-search">
        <span class="material-icon search">🔍</span>
        <input type="text" placeholder="Tìm trong thư" />
      </div>

      <div class="header-actions">
        <button class="icon-button" aria-label="Help">❔</button>
        <button class="icon-button" aria-label="Settings">⚙️</button>
        <button class="avatar">NQ</button>
      </div>
    </header>

    <div class="gmail-body">
      <aside class="gmail-sidebar">
        <button class="compose-btn">
          ✉️ Soạn thư
        </button>
        <nav class="sidebar-nav">
          <router-link to="/inbox" class="nav-item">
            <span>Hộp thư đến</span>
            <span class="badge">6</span>
          </router-link>
          <router-link to="/sent" class="nav-item">
            <span>Đã gửi</span>
          </router-link>
          <div class="nav-label">Danh mục</div>
          <div class="nav-static">Thư nháp</div>
          <div class="nav-static">Thư quan trọng</div>
          <div class="nav-static">Thư rác</div>
        </nav>
      </aside>

      <main class="gmail-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Google Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #f6f8fc;
  color: #202124;
}

.gmail-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.gmail-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background: white;
  border-bottom: 1px solid #dadce0;
  gap: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.icon-button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.icon-button:hover {
  background: rgba(60, 64, 67, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.7rem;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.brand-sub {
  font-size: 0.8rem;
  color: #5f6368;
}

.header-search {
  flex: 1;
  background: #eff3fb;
  border-radius: 999px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 0.5rem;
  height: 44px;
}

.header-search input {
  border: none;
  background: transparent;
  flex: 1;
  font-size: 0.95rem;
  outline: none;
  color: #202124;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #1a73e8;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.gmail-body {
  flex: 1;
  display: flex;
  min-height: calc(100vh - 64px);
}

.gmail-sidebar {
  width: 280px;
  padding: 1rem;
  background: #f6f8fc;
  border-right: 1px solid #e0e0e0;
}

.compose-btn {
  width: 160px;
  height: 48px;
  border-radius: 24px;
  border: none;
  background: white;
  color: #1a73e8;
  font-weight: 600;
  box-shadow: 1px 1px 4px rgba(60, 64, 67, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.95rem;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  color: #202124;
  text-decoration: none;
}

.nav-item.router-link-active {
  background: #e8f0fe;
  color: #1a73e8;
  font-weight: 600;
}

.badge {
  font-size: 0.85rem;
}

.nav-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #5f6368;
  margin: 1rem 0 0.5rem;
}

.nav-static {
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  color: #5f6368;
}

.gmail-content {
  flex: 1;
  padding: 1.5rem 2rem;
  background: #fff;
}

@media (max-width: 960px) {
  .gmail-sidebar {
    display: none;
  }

  .gmail-content {
    padding: 1rem;
  }
}
</style>

