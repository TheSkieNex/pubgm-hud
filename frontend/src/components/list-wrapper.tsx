export const ListWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full h-full flex flex-col max-w-2xl gap-4">{children}</div>;
};
