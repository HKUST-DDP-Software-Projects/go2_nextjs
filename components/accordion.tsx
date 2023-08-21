import { ReactNode, useState } from "react";

export interface AccordionItem<T extends ReactNode> {
  title: string;
  content: T;
}

type AccordionProps<T extends ReactNode> = {
  items: AccordionItem<T>[];
  defaultActive: boolean;
};

export default function Accordion<T extends ReactNode>({
  items,
  defaultActive,
}: AccordionProps<T>) {
  const [activeIndex, setActiveIndex] = useState<number[]>(
    defaultActive ? items.map((_, index) => index) : [],
  );

  const handleClick = (index: number) => {
    console.log("handleClick", index);
    if (activeIndex.includes(index)) {
      setActiveIndex(activeIndex.filter((item) => item !== index));
    } else {
      setActiveIndex([...activeIndex, index]);
    }
  };

  return (
    <div className="mx-auto h-full overflow-y-auto">
      {items.map((item, index) => (
        <div
          key={item.title}
          className="border-b border-gray-200 max-h-full flex flex-col"
        >
          <div
            className="flex items-center justify-between py-4 cursor-pointer flex-shrink-0"
            onClick={() => handleClick(index)}
          >
            <h3 className="text-lg font-medium">{item.title}</h3>
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
