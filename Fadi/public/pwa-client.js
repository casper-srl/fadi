(function () {
  const swPath = '/sw.js';
  const installedStorageKey = 'fadi-pwa-installed';
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    setStoredInstalled(false);
    deferredInstallPrompt = event;
    document.dispatchEvent(new CustomEvent('fadi:pwa-install-ready'));
  });

  window.addEventListener('appinstalled', () => {
    setStoredInstalled(true);
    deferredInstallPrompt = null;
    document.dispatchEvent(new CustomEvent('fadi:pwa-installed'));
  });

  function base64UrlToUint8Array(value) {
    const padding = '='.repeat((4 - (value.length % 4)) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;
    return navigator.serviceWorker.register(swPath);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
  }

  function setStoredInstalled(value) {
    try {
      if (value) {
        window.localStorage.setItem(installedStorageKey, 'true');
        return;
      }
      window.localStorage.removeItem(installedStorageKey);
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
  }

  function hasStoredInstall() {
    try {
      return window.localStorage.getItem(installedStorageKey) === 'true';
    } catch {
      return false;
    }
  }

  function isPwaInstalled() {
    return isStandalone() || hasStoredInstall();
  }

  async function detectRelatedInstalledApp() {
    if (!('getInstalledRelatedApps' in navigator)) return false;

    try {
      const apps = await navigator.getInstalledRelatedApps();
      const installed = apps.some((app) => {
        return app.platform === 'webapp'
          || app.id === '/necrologi/'
          || (typeof app.url === 'string' && app.url.includes('/manifest.webmanifest'));
      });

      if (installed) setStoredInstalled(true);
      return installed;
    } catch {
      return false;
    }
  }

  async function refreshInstallState() {
    if (isPwaInstalled()) return true;
    return detectRelatedInstalledApp();
  }

  function getInstallGuidance() {
    const ua = window.navigator.userAgent || '';
    const platform = window.navigator.platform || '';
    const isIos = /iphone|ipad|ipod/i.test(ua)
      || (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(ua);
    const isDesktop = !isIos && !isAndroid;

    if (isPwaInstalled()) {
      return {
        status: "L'app FADI Necrologi e gia installata.",
        steps: 'La trovi nella schermata principale o tra le app del dispositivo.',
        canPrompt: false,
        button: ''
      };
    }

    if (deferredInstallPrompt) {
      return {
        status: 'Apri subito gli annunci funebri dalla schermata principale.',
        steps: 'Tocca Installa e conferma dal browser.',
        canPrompt: true,
        button: 'Installa app'
      };
    }

    if (isIos) {
      return {
        status: 'Installa FADI Necrologi su iPhone o iPad.',
        steps: 'Condividi, poi Aggiungi alla schermata Home.',
        canPrompt: false,
        button: ''
      };
    }

    if (isAndroid) {
      return {
        status: 'Installa FADI Necrologi sul telefono.',
        steps: 'Menu del browser, poi Installa app.',
        canPrompt: false,
        button: ''
      };
    }

    if (isDesktop) {
      return {
        status: 'Installa FADI Necrologi sul computer.',
        steps: "Icona Installa nella barra indirizzi o nel menu del browser.",
        canPrompt: false,
        button: ''
      };
    }

    return {
      status: "Installa l'app FADI Necrologi.",
      steps: 'Usa il comando Installa app o Aggiungi alla schermata Home del browser.',
      canPrompt: false,
      button: ''
    };
  }

  function initInstallControl(root) {
    const button = root.querySelector('[data-pwa-install-button]');
    const status = root.querySelector('[data-pwa-install-status]');
    const steps = root.querySelector('[data-pwa-install-steps]');
    if (!status || !steps) return;

    function render() {
      if (isPwaInstalled()) {
        root.hidden = true;
        if (button) button.hidden = true;
        updateGlobalBannerVisibility();
        return;
      }

      const guidance = getInstallGuidance();
      root.hidden = false;
      status.textContent = guidance.status;
      steps.textContent = guidance.steps;

      if (button) {
        button.hidden = !guidance.canPrompt;
        button.textContent = guidance.button || 'Installa app';
      }

      updateGlobalBannerVisibility();
    }

    button?.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      button.disabled = true;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(() => undefined);
      deferredInstallPrompt = null;
      button.disabled = false;
      render();
    });

    document.addEventListener('fadi:pwa-install-ready', render);
    document.addEventListener('fadi:pwa-installed', render);
    render();
  }

  async function getPublicKey() {
    const response = await fetch('/api/notifications/public-key', {
      headers: { 'Accept': 'application/json' }
    });
    const json = await response.json().catch(() => ({}));
    return json.enabled ? json.publicKey : '';
  }

  function setStatus(root, message, state) {
    const status = root.querySelector('[data-pwa-notifications-status]');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || '';
  }

  async function initNotificationControl(root, registration) {
    const button = root.querySelector('[data-pwa-notifications-button]');
    if (isPwaInstalled() || !button || !registration || !('PushManager' in window) || !('Notification' in window)) {
      root.hidden = true;
      updateGlobalBannerVisibility();
      return;
    }

    root.hidden = false;
    let subscription = await registration.pushManager.getSubscription();

    function render() {
      if (isPwaInstalled()) {
        root.hidden = true;
        updateGlobalBannerVisibility();
        return;
      }

      if (subscription) {
        root.hidden = true;
        updateGlobalBannerVisibility();
        return;
      }

      if (Notification.permission === 'granted') {
        button.textContent = 'Notifiche attive';
        button.dataset.active = 'true';
        setStatus(root, 'Riceverai un avviso quando viene pubblicato un nuovo necrologio.', 'success');
        root.hidden = true;
        updateGlobalBannerVisibility();
        return;
      }

      root.hidden = false;
      button.textContent = Notification.permission === 'denied' ? 'Notifiche bloccate' : 'Attiva notifiche';
      button.dataset.active = 'false';
      setStatus(root, Notification.permission === 'denied'
        ? 'Le notifiche sono bloccate nelle impostazioni del browser.'
        : 'Ricevi un avviso quando viene pubblicato un nuovo necrologio.', Notification.permission === 'denied' ? 'error' : 'idle');
      updateGlobalBannerVisibility();
    }

    button.addEventListener('click', async () => {
      if (subscription) return;

      button.disabled = true;
      setStatus(root, 'Attivazione in corso...', 'idle');

      try {
        const publicKey = await getPublicKey();
        if (!publicKey) throw new Error('Notifiche non configurate.');

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('Permesso notifiche non concesso.');

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToUint8Array(publicKey)
        });

        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscription)
        });

        if (!response.ok) {
          await subscription.unsubscribe();
          subscription = null;
          throw new Error('Non siamo riusciti a salvare la sottoscrizione.');
        }
      } catch (error) {
        setStatus(root, error.message || 'Notifiche non disponibili.', 'error');
      } finally {
        button.disabled = false;
        render();
      }
    });

    document.addEventListener('fadi:pwa-installed', render);
    render();
  }

  function updateGlobalBannerVisibility() {
    document.querySelectorAll('[data-pwa-banner]').forEach((banner) => {
      const visiblePanels = banner.querySelectorAll('[data-pwa-install]:not([hidden]), [data-pwa-notifications]:not([hidden])');
      banner.hidden = visiblePanels.length === 0;
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const registration = await registerServiceWorker().catch(() => null);
    await refreshInstallState();
    document.querySelectorAll('[data-pwa-install]').forEach((root) => {
      initInstallControl(root);
    });
    document.querySelectorAll('[data-pwa-notifications]').forEach((root) => {
      initNotificationControl(root, registration);
    });
    updateGlobalBannerVisibility();
  });
})();
