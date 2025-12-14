'use client';

type Props = {
  onNavigate: (path: string) => void;
};

const NavButtons = ({ onNavigate }: Props) => {
  return (
    <>
      <div
        onClick={() => onNavigate('/relax')}
        className="hidden md:block bg-jlt-peach text-brand-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm 
          border-b-2 border-orange-300 cursor-pointer hover:translate-y-0.5 transition-transform"
      >
        Relax
      </div>

      <div
        onClick={() => onNavigate('/folders')}
        className="hidden md:block bg-jlt-peach text-brand-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm 
          border-b-2 border-orange-300 cursor-pointer hover:translate-y-0.5 transition-transform"
      >
        My Folder
      </div>

      <div
        onClick={() => onNavigate('/add-audio')}
        className="hidden md:block bg-jlt-peach text-brand-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm 
          border-b-2 border-orange-300 cursor-pointer hover:translate-y-0.5 transition-transform"
      >
        Add Audio
      </div>
    </>
  );
};

export default NavButtons;
