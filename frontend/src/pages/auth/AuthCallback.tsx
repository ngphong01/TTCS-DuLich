import { useParams } from 'react-router-dom';

export default function AuthCallback() {
  const { provider } = useParams();
  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Auth Callback</h1>
      <p>Provider: {provider}</p>
    </div>
  );
}