export const ListWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full flex flex-col items-start gap-4 lg:grid lg:grid-cols-3">
      {children}
    </div>
  );
};
