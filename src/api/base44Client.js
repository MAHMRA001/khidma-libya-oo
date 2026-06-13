const ADMIN_EMAIL = 'mraiwamahmod@gmail.com';

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('khidma_user');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore broken localStorage data
  }

  return {
    id: 'guest',
    email: '',
    full_name: 'Guest User',
    account_type: 'client',
    role: 'guest',
  };
};

const saveUser = (email) => {
  const cleanEmail = String(email || '').trim().toLowerCase();

  const user = {
    id: cleanEmail || 'guest',
    email: cleanEmail,
    full_name: cleanEmail ? cleanEmail.split('@')[0] : 'Guest User',
    account_type: 'client',
    role: cleanEmail === ADMIN_EMAIL ? 'admin' : 'user',
  };

  localStorage.setItem('khidma_user', JSON.stringify(user));
  return user;
};

const emptyEntity = {
  async list() {
    return [];
  },
  async filter() {
    return [];
  },
  async get() {
    return null;
  },
  async create(data) {
    return { id: Date.now().toString(), ...data };
  },
  async update(id, data) {
    return { id, ...data };
  },
  async delete() {
    return true;
  },
  subscribe() {
    return () => {};
  },
};

const entities = new Proxy(
  {},
  {
    get() {
      return emptyEntity;
    },
  }
);

export const base44 = {
  auth: {
    async me() {
      return getStoredUser();
    },

    async loginWithEmail(email) {
      return saveUser(email);
    },

    async updateMe(data) {
      const current = getStoredUser();
      const updated = { ...current, ...data };
      localStorage.setItem('khidma_user', JSON.stringify(updated));
      return updated;
    },

    logout() {
      localStorage.removeItem('khidma_user');
      window.location.hash = '#/login';
    },

    redirectToLogin() {
      window.location.hash = '#/login';
    },
  },

  entities,

  integrations: {
    Core: {
      async UploadFile({ file }) {
        return { file_url: file ? URL.createObjectURL(file) : '' };
      },
    },
  },
};