import { useNavigate } from 'react-router-dom';

export function Modal({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    // Click the backdrop to close
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => navigate(-1)}
    >
      {/* Stop clicks inside the card from closing the modal */}
      <div
        className="bg-background border rounded-xl shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
