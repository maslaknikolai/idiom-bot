export function Username() {
  return (
    <div className="text-right">
      <h1>
        {Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Loading...'}
      </h1>
    </div>
  );
}