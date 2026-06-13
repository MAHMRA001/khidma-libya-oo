const dummyUser = {
  id: 'guest',
  email: 'guest@khedma313libya.com',
  full_name: 'Guest User',
  account_type: 'client',
  role: 'user',
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
      return dummyUser;
    },
    async updateMe(data) {
      Object.assign(dummyUser, data);
      return dummyUser;
    },
    logout() {
      window.location.hash = '#/welcome';
    },
    redirectToLogin() {
      window.location.hash = '#/welcome';
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