import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { FaEdit} from "react-icons/fa";
import { ColorKey } from "../../../style/colorStyle";

interface Props {
    navigateProfile: () => void;
}
const ProfileEditButton: React.FC<Props> = ({ navigateProfile }) => {
    return (
        <BaseButton
            onClick={navigateProfile}
            icon={<FaEdit/>}
            label={"プロフィールを編集"}
            style={{
                color: {
                    colorKey: ColorKey.Secondary,
                }
            }}
            bg_color={true}
        />
    );
};

export default ProfileEditButton;