import {  useState } from "react";
import { ChevronDown } from "lucide-react";


export default function Dropdown({ onChange, options, hidden }: { 
    onChange: (value: string) => void 
    options: string[],
    hidden: boolean
}) {
  const [selected, setSelected] = useState<string | null>(options[0])
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    setSelected(option)
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${hidden ? "hidden" : false}`}>
      <button
        className="w-full flex justify-between items-center px-4 py-3 text-left border-2 border-[#181818] rounded-md"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {
          <p className="text-white">
              Order by {selected ? selected : false}
          </p>
        }
        <ChevronDown className={`w-5 h-5 text-white transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-md bg-[#181818] shadow-lg border border-black overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                handleSelect(option)
                onChange(option)
              }}
              className="px-4 py-2 hover:opacity-75 cursor-pointer text-white"
            >
              Place order by {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
