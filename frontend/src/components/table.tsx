export const Table = () => {
  return (
    <div className="w-[344px]">
      <Header />
      <div className="flex flex-col">
        {Array.from({ length: 16 }).map((_, index) => (
          <Team place={index + 1} tag="Test" />
        ))}
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="w-full h-[30px] flex bg-secondary text-white text-xs font-bold">
      <div className="w-[36px] h-full flex items-center justify-center">#</div>
      <div className="w-[144px] h-full flex items-center justify-center">TEAM</div>
      <div className="w-[60px] h-full flex items-center justify-center">ALIVE</div>
      <div className="w-[52px] h-full flex items-center justify-center">PTS</div>
      <div className="w-[52px] h-full flex items-center justify-center">ELIMS</div>
    </div>
  );
};

interface TeamProps {
  place: number;
  tag: string;
}

const Team = ({ place, tag }: TeamProps) => {
  return (
    <div className="w-full h-[42px] flex border-b border-[#EDE9F7] font-circular">
      <div className="w-[36px] h-full flex items-center justify-center bg-dark text-white">
        {place}
      </div>
      <div className="w-[144px] h-full flex items-center bg-white text-black">
        <div className="w-[42px] h-full"></div>
        <div className="ml-2">{tag.toUpperCase()}</div>
      </div>
      <div className="flex flex-1 bg-dark text-white text-lg">
        <div className="w-[60px] h-full flex items-center justify-center gap-[5px]">
          <div className="w-[3px] h-[26px] bg-yellow"></div>
          <div className="w-[3px] h-[26px] bg-yellow"></div>
          <div className="w-[3px] h-[26px] bg-yellow"></div>
          <div className="w-[3px] h-[26px] bg-yellow"></div>
        </div>
        <div className="w-[52px] h-full flex items-center justify-center">111</div>
        <div className="w-[52px] h-full flex items-center justify-center">111</div>
      </div>
    </div>
  );
};
