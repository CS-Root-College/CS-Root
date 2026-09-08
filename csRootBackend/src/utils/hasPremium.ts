import type { IUser } from "../models/user.model";

export const hasPremiumAccess = (
user: IUser
) => {
    if (user.role === "admin") {
        return true;
    }
    
return (
    user.subscription.plan ===
        "premium" &&
    user.subscription.expiresAt !==
        null &&
    user.subscription.expiresAt >
        new Date()
);

};