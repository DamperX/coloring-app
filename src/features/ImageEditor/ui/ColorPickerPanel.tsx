type Props = {
  colorList: string[];
};

export const ColorPickerPanel = ({ colorList }: Props) => {
  return (
    <div className="fixed bottom-5 right-0 left-0 rounded-2xl p-4">
      <div className="bg-white shadow-2xl p-3 rounded-2xl">
        <div className="flex gap-4">
          {colorList.map((color, index) => (
            <div
              key={index}
              className={`w-12 h-12 rounded-full`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
