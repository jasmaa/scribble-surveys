export default function Error({ errorCode }) {

  let msg = 'Survey could not be completed due to an error.';
  switch (errorCode) {
    case 404:
      msg = 'Survey does not exist.';
      break;
  }

  return (
    <div>
      <p>{msg}</p>
    </div>
  );
}