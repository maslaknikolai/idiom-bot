export const loader = async () => {
  console.log('MY WEBHOOK', process.env.INTERNAL_API_URL + ':5045/webhook/message');

  fetch('http://localhost:5045/webhook/message')
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
