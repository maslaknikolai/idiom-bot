export function Username() {
  return (
    <div className="text-right">
      {/* <h1>{userName}</h1> */}

      <pre>
        {JSON.stringify(Telegram?.WebApp?.initDataUnsafe, null, 2)}
      </pre>
    </div>
  );
}