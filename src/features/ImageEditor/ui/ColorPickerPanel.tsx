import { Color } from '../types';
import { clsx } from 'clsx';

type Props = {
  colorList: Color[];
  onSelect: (colorId: string) => void;
  activeColorId: string | null;
};

export const ColorPickerPanel = ({
  colorList,
  activeColorId,
  onSelect,
}: Props) => {
  return (
    <div className="fixed bottom-5 right-0 left-0 rounded-2xl p-4">
      <div className="bg-white shadow-2xl p-3 rounded-2xl">
        <div className="flex gap-4">
          {colorList.map(({ hex, id }) => {
            const isActive = activeColorId === id;

            return (
              <div
                key={id}
                className={clsx(`w-12 h-12 rounded-full border-2`, {
                  'border-transparent': !isActive,
                  'border-black': isActive,
                })}
                style={{ backgroundColor: hex }}
                onClick={() => onSelect(id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
