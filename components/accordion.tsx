import { ReactNode, useEffect, useState } from "react";

export interface AccordionItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
}

type AccordionProps = {
  items: AccordionItem[];
  defaultActive: boolean;
  defaultActiveIndex?: number[];
};

export default function Accordion({
  items,
  defaultActive,
  defaultActiveIndex,
}: AccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number[]>(
    defaultActive ? items.map((_, index) => index) : defaultActiveIndex || [],
  );

  // update activeIndex when defaultActiveIndex changes
  useEffect(() => {
    if (defaultActiveIndex) {
      setActiveIndex(defaultActiveIndex);
    }
  }, [defaultActiveIndex]);

  const handleClick = (index: number) => {
    if (activeIndex.includes(index)) {
      setActiveIndex(activeIndex.filter((item) => item !== index));
    } else {
      setActiveIndex([...activeIndex, index]);
    }
  };

  return (
    <div className="mx-auto">
      {items.map((item, index) => (
        <div
          key={item.key}
          className="border-b border-gray-200 max-h-full flex flex-col"
        >
          <div
            className="flex items-center justify-between p-4 cursor-pointer flex-shrink-0"
            onClick={() => handleClick(index)}
          >
            <h3 className="text-lg font-bold">{item.title}</h3>
            <svg
              className={`w-6 h-6 transition-transform ${
                activeIndex.includes(index) ? "transform rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div
            className={`${
              activeIndex.includes(index) ? "block" : "hidden"
            } py-4 px-6 flex-1 overflow-y-auto`}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
