"use client";
import { useState, useRef, useEffect } from "react";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Plus,
  Pencil,
  Trash,
} from "lucide-react";
import useFileSystemStore, { FileSystemItem } from "@/store/useFileSystemStore";
import { Button } from "@/components/ui/button";
import FileContent from "./FileContent";

type FileItemProps = {
  item: FileSystemItem;
  level?: number;
};

export default function FileItem({ item, level = 0 }: FileItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const { fetchChildren, updateItem, deleteItem, createFile, createFolder } =
    useFileSystemStore();

  const handleToggle = async () => {
    if (!isExpanded && item.type === "folder") {
      await fetchChildren(item._id);
    }
    setIsExpanded(!isExpanded);
  };

  const handleRename = () => {
    const newName = prompt("Enter new name:", item.name);
    if (newName && newName !== item.name) {
      updateItem(item._id, { name: newName });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(item._id);
    }
  };

  const handleOpenFile = () => {
    setIsFileOpen(true);
  };

  const handleCreateFile = () => {
    const name = prompt("Enter file name:");
    if (name) {
      createFile(name, item._id, "");
      setIsContextMenuOpen(false);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:");
    if (name) {
      createFolder(name, item._id);
      setIsContextMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setIsContextMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const indentation = level * 16; // 16px per level

  return (
    <div className="relative">
      <div
        className="flex items-center p-1 rounded-lg hover:bg-gray-50"
        style={{ marginLeft: `${indentation}px` }}
      >
        {item.type === "folder" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="h-8 w-8 p-0 mr-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        {item.type === "folder" ? (
          <Folder className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
        ) : (
          <File className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
        )}
        <span className="flex-grow truncate">{item.name}</span>
        <div className="flex-shrink-0 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsContextMenuOpen(!isContextMenuOpen)}
            ref={moreButtonRef}
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isContextMenuOpen && (
        <div
          ref={contextMenuRef}
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
        >
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {item.type === "folder" && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCreateFile}
                  className="w-full justify-start px-4 py-2 text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New File
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCreateFolder}
                  className="w-full justify-start px-4 py-2 text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              onClick={handleRename}
              className="w-full justify-start px-4 py-2 text-sm"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
            {item.type === "file" && (
              <Button
                variant="ghost"
                onClick={handleOpenFile}
                className="w-full justify-start px-4 py-2 text-sm"
              >
                <File className="mr-2 h-4 w-4" />
                Open
              </Button>
            )}
          </div>
        </div>
      )}

      {item.type === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((childItem) => (
            <FileItem key={childItem._id} item={childItem} level={level + 1} />
          ))}
        </div>
      )}

      {isFileOpen && (
        <FileContent
          id={item._id}
          name={item.name}
          content={item.content || ""}
          onClose={() => setIsFileOpen(false)}
        />
      )}
    </div>
  );
}
