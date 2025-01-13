import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useFileSystemStore from "@/store/useFileSystemStore";

type FileContentProps = {
  id: string;
  name: string;
  content: string;
  onClose: () => void;
};

export default function FileContent({
  id,
  name,
  content,
  onClose,
}: FileContentProps) {
  const [editedContent, setEditedContent] = useState(content);
  const updateFileContent = useFileSystemStore(
    (state) => state.updateFileContent
  );

  const handleSave = async () => {
    await updateFileContent(id, editedContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-3/4 h-3/4 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{name}</h2>
          <div>
            <Button onClick={handleSave} className="mr-2">
              Save
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <div className="flex-grow p-4 overflow-auto">
          <Textarea
            className="w-full h-full resize-none border-0 focus:ring-0"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
