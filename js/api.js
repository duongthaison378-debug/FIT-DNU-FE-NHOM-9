// <<<<<<< HEAD

class APIResource {
  constructor(resourceName) {
    this.resourceName = resourceName;
    this.storageKey = `fittrack_${resourceName}`;
  }

  async layDanhSach() {
    const raw = localStorage.getItem(this.storageKey);
    const items = raw ? JSON.parse(raw) : [];
    return items.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async layMotPhan(id) {
    const items = await this.layDanhSach();
    return items.find((item) => item.id === id) || null;
  }

  async themMoi(data) {
    const items = await this.layDanhSach();
    const newItem = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    items.unshift(newItem);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return newItem;
  }

  async capNhat(id, data) {
    const items = await this.layDanhSach();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Không tìm thấy ${this.resourceName} có id = ${id}`);
    }

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return items[index];
  }

  async xoa(id) {
    const items = await this.layDanhSach();
    const filtered = items.filter((item) => item.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return { id };
  }
}
// =======
// >>>>>>> 6d5b315397e7b2d76a698e4c303ad22564bad900