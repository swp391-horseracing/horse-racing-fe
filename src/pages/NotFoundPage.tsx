import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes.tsx";
import Horse from "../assets/gif/404Horse.gif";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="h-fit w-full flex flex-col items-center justify-top text-center gap-4 py-20">
        <div className="text-4xl text-5xl font-bold tracking-tight text-primary mb-2">
          404 - Page Not Found
        </div>

        <p className="mx-auto max-w-3xl text-lg md:text-2xl leading-relaxed text-[#222] mb-8">
          We searched high and low but couldn’t find what you’re looking for.
          Let’s find a better place for you to go.
        </p>

        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="inline-flex items-center justify-center rounded-full border border-[#6a5b1f] bg-primary px-8 py-4 text-base font-semibold text-[#F4F6F5] shadow-sm transition hover:opacity-90 active:scale-[0.98]"
        >
          Back to Home
        </button>
      </div>
      <div className="flex items-center justify-center text-center py-5">
        <img alt="Not Found" src={Horse} width="40%" />
      </div>
    </>
  );
}
