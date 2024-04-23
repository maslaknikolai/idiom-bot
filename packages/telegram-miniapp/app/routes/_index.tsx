export const loader = async () => {
  console.log('MY WEBHOOK', process.env.INTERNAL_API_URL + ':5045/webhook/message');

  fetch(process.env.INTERNAL_API_URL + ':5045/webhook/message')
  .catch(() => {})
  return null
};


export default function Index() {
  return (
    <div>
      Игра
    </div>
  );
}
