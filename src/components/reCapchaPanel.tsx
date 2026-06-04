import ReCAPTCHA from "react-google-recaptcha";

interface ReCaptchaPanelProps {
    onVerify: (token: string | null) => void;
}

export default function ReCaptchaPanel({onVerify,}: ReCaptchaPanelProps) {
    console.log(import.meta.env)
    console.log(import.meta.env.VITE_RECAPTCHA_SITE_KEY);
    return (
        <div className="flex justify-center">
            <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}

                onChange={onVerify}
            />
        </div>
    );
}
