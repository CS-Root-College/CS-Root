
import type { IUser } from "../models/user.model";

export const hasAdminAccess = (user: IUser): boolean => {
    return user.role === "admin";
};
