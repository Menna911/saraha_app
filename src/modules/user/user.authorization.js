import { RoleEnum } from "../../common/enums/index.js";
import { profile } from "./user.service.js";

export const endpoint = {
    profile: [RoleEnum.Admin ,RoleEnum.User]
}