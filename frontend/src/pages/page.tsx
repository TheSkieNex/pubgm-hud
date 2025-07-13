export default function Page() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Pages</h1>
      <div className="w-full h-full grid grid-cols-3 items-start gap-4">
        <a
          href="/tables"
          className="p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
        >
          Tables
        </a>
        <a
          href="/lottie-files"
          className="p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
        >
          Lottie Files
        </a>
      </div>
    </div>
  );
}
