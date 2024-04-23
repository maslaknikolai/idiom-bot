export const loader = async () => {
  fetch(`http://localhost:${process.env.BOT_WEBHOOK_PORT}/webhook/message`)
    .catch(() => {})

  return null
};


export default function Index() {
  return (
    <div>
      Супер Игра
    </div>
  );
}
