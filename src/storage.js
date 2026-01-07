// Sistema de almacenamiento usando localStorage para navegadores web
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return { value };
    } catch (error) {
      console.error('Error al obtener del storage:', error);
      return { value: null };
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { success: true };
    } catch (error) {
      console.error('Error al guardar en storage:', error);
      return { success: false };
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar del storage:', error);
      return { success: false };
    }
  }
};

// Hacer disponible globalmente
window.storage = storage;

export default storage;
