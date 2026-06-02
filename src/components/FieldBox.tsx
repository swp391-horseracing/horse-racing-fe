
import type {User} from "../types/user.ts";
import { Label } from "./ui/label.tsx";
import {Input} from "./ui/input.tsx";

type FieldBoxProps = {
    label: string;
    value: string;
    name?: keyof User;
    editing?: boolean;
    draft: Partial<User>;
    setDraft: (fn: (p: Partial<User>) => Partial<User>) => void;
};

export function FieldBox({ label, value, name, editing, draft, setDraft }: FieldBoxProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            {editing && name ? (
                <Input
                    value={(draft[name] as string) ?? value}
                    onChange={(e) =>
                        setDraft((p) => ({ ...p, [name]: e.target.value }))
                    }
                />
            ) : (
                <p className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm">
                    {value}
                </p>
            )}
        </div>
    );
}