import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { FaUserCheck, FaUserPlus } from "react-icons/fa";
import { ColorKey } from "../../../style/colorStyle";

interface Props {
    handleFollow: () => void;
    isFollowing: boolean;
}
const FollowButton: React.FC<Props> = ({ handleFollow, isFollowing }) => {
    return (
        <BaseButton
            onClick={handleFollow}
            icon={isFollowing ? <FaUserCheck/> : <FaUserPlus/>}
            label={isFollowing ? "フォロー中" : "フォロー"}
            style={{
                color: {
                    colorKey: isFollowing ? ColorKey.Primary : ColorKey.Secondary
                }
            }}
            bg_color={true}
        />
    );
};

export default FollowButton;