import ReCAPTCHA from "react-google-recaptcha";

interface ReCaptchaPanelProps {
    onVerify: (token: string | null) => void;
}

export default function ReCaptchaPanel({onVerify,}: ReCaptchaPanelProps) {
    console.log(import.meta.env)
    console.log(import.meta.env.VITE_RECAPTCHA_SITE_KEY);
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcBAAwtAAAAAG2VDU69O5A8uhdOLoTWVW4I2fj_";

    return (
        <div className="flex justify-center">
            <ReCAPTCHA
                sitekey={siteKey}
                onChange={onVerify}
            />
        </div>
    );
}
