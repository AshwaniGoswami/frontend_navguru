"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import FileItem from "./FileItem";
import useFileSystemStore from "@/store/useFileSystemStore";

export default function FileExplorer() {
  const { fileSystem, fetchFileSystem, createFile, createFolder, loading } =
    useFileSystemStore();

  useEffect(() => {
    fetchFileSystem();
  }, [fetchFileSystem]);

  const handleCreateFile = () => {
    const name = prompt("Enter file name:");
    if (name) {
      createFile(name, null, "");
    }
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:");
    if (name) {
      createFolder(name, null);
    }
  };

  if (loading && fileSystem.length === 0) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-gray-600" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="border rounded p-4">
      <div className="flex justify-end space-x-2 mb-4">
        <Button
          onClick={handleCreateFile}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New File
        </Button>
        <Button
          onClick={handleCreateFolder}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Folder
        </Button>
      </div>
      {fileSystem.map((item) => (
        <FileItem key={item._id} item={item} />
      ))}
    </div>
  );
}
