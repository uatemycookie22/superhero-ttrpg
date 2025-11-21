import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleListItemProps {
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export default function CollapsibleListItem({ title, description, actionButton }: CollapsibleListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded flex justify-between items-start gap-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex-1 text-left flex items-start gap-2"
      >
        <ChevronDown className={`w-5 h-5 mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isExpanded ? description : `${description.slice(0, 50)}...`}
          </p>
        </div>
      </button>
      {actionButton}
    </div>
  );
}
