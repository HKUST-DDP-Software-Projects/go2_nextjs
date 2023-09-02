import { useState } from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="mx-auto">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              className={`${
                index === activeIndex
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-4`}
              onClick={() => setActiveIndex(index)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">{tabs[activeIndex]?.content}</div>
    </div>
  );
}
