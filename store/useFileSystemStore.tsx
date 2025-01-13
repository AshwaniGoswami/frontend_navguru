import { create } from "zustand";
import axios from "axios";

export type FileSystemItem = {
  _id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  parentId: string | null;
  children?: FileSystemItem[];
};

interface FileSystemStore {
  fileSystem: FileSystemItem[];
  loading: boolean;
  error: string | null;
  fetchFileSystem: () => Promise<void>;
  fetchChildren: (folderId: string) => Promise<void>;
  createFile: (
    name: string,
    parentId: string | null,
    content: string
  ) => Promise<void>;
  createFolder: (name: string, parentId: string | null) => Promise<void>;
  updateItem: (id: string, updates: Partial<FileSystemItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateFileContent: (id: string, content: string) => Promise<void>;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: `https://navguru-prework-backend.onrender.com/`,
});

const useFileSystemStore = create<FileSystemStore>((set) => ({
  fileSystem: [],
  loading: false,
  error: null,

  fetchFileSystem: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<FileSystemItem[]>("/file-system");
      set({ fileSystem: response.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch file system", loading: false });
    }
  },

  fetchChildren: async (folderId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<FileSystemItem[]>(
        `/file-system/${folderId}/children`
      );
      set((state) => ({
        fileSystem: updateChildrenInFileSystem(
          state.fileSystem,
          folderId,
          response.data
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to fetch children", loading: false });
    }
  },

  createFile: async (
    name: string,
    parentId: string | null,
    content: string
  ) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<FileSystemItem>("/file-system/file", {
        name,
        parentId,
        content,
      });
      set((state) => ({
        fileSystem: addItemToFileSystem(
          state.fileSystem,
          parentId,
          response.data
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to create file", loading: false });
    }
  },

  createFolder: async (name: string, parentId: string | null) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<FileSystemItem>("/file-system/folder", {
        name,
        parentId,
      });
      set((state) => ({
        fileSystem: addItemToFileSystem(
          state.fileSystem,
          parentId,
          response.data
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to create folder", loading: false });
    }
  },

  updateItem: async (id: string, updates: Partial<FileSystemItem>) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put<FileSystemItem>(
        `/file-system/${id}`,
        updates
      );
      set((state) => ({
        fileSystem: updateItemInFileSystem(state.fileSystem, id, response.data),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to update item", loading: false });
    }
  },

  deleteItem: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/file-system/${id}`);
      set((state) => ({
        fileSystem: removeItemFromFileSystem(state.fileSystem, id),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to delete item", loading: false });
    }
  },

  updateFileContent: async (id: string, content: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put<FileSystemItem>(
        `/file-system/file/${id}/content`,
        {
          content,
        }
      );
      set((state) => ({
        fileSystem: updateItemInFileSystem(state.fileSystem, id, response.data),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Failed to update file content", loading: false });
    }
  },
}));

// Helper functions
function updateChildrenInFileSystem(
  fileSystem: FileSystemItem[],
  folderId: string,
  children: FileSystemItem[]
): FileSystemItem[] {
  return fileSystem.map((item) => {
    if (item._id === folderId) {
      return { ...item, children };
    }
    if (item.children) {
      return {
        ...item,
        children: updateChildrenInFileSystem(item.children, folderId, children),
      };
    }
    return item;
  });
}

function addItemToFileSystem(
  fileSystem: FileSystemItem[],
  parentId: string | null,
  newItem: FileSystemItem
): FileSystemItem[] {
  if (!parentId) {
    return [...fileSystem, newItem];
  }
  return fileSystem.map((item) => {
    if (item._id === parentId) {
      return { ...item, children: [...(item.children || []), newItem] };
    }
    if (item.children) {
      return {
        ...item,
        children: addItemToFileSystem(item.children, parentId, newItem),
      };
    }
    return item;
  });
}

function updateItemInFileSystem(
  fileSystem: FileSystemItem[],
  id: string,
  updatedItem: FileSystemItem
): FileSystemItem[] {
  return fileSystem.map((item) => {
    if (item._id === id) {
      return { ...item, ...updatedItem };
    }
    if (item.children) {
      return {
        ...item,
        children: updateItemInFileSystem(item.children, id, updatedItem),
      };
    }
    return item;
  });
}

function removeItemFromFileSystem(
  fileSystem: FileSystemItem[],
  id: string
): FileSystemItem[] {
  return fileSystem.filter((item) => {
    if (item._id === id) {
      return false;
    }
    if (item.children) {
      item.children = removeItemFromFileSystem(item.children, id);
    }
    return true;
  });
}

export default useFileSystemStore;
