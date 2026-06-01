// import { useNavigate } from "react-router-dom";
import type {ProfileTab} from "../../hooks/useUserProfile.ts";

const NAV: { id: ProfileTab; label: string;}[] = [
    { id: "account", label: "Account"},
    { id: "privacy", label: "Privacy"},
    { id: "settings", label: "Settings"},
    { id: "notifications", label: "Notifications"},
];

type Props = {
    activeTab: ProfileTab;
    setActiveTab: (tab: ProfileTab) => void;
    onLogout: () => void;
};

export default function ProfileSidebar({activeTab, setActiveTab, onLogout,}: Props) {
    // const navigate = useNavigate();

    const handleTabClick = (tab: ProfileTab) => {
        setActiveTab(tab);
        // navigate(`/user/${tab}`);
    };

    return (
        <div className="flex flex-col gap-1">
            {NAV.map(({ id, label}) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => handleTabClick(id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-50 ${
                        activeTab === id
                            ? "bg-[#064E3B] text-white font-semibold shadow-sm"
                            : "text-gray-600 dark:text-white hover:bg-green-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                >
                    {label}
                </button>
            ))}

            <hr className="my-2 border-gray-200 dark:border-gray-700" />

            <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left w-full"
            >
                Logout
            </button>
        </div>
    );
}