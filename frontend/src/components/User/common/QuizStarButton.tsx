import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { FaPlay} from "react-icons/fa";
import { CoreColorKey } from "../../../style/colorStyle";

interface Props {
    navigateQuizStart: () => void;
}
const QuizStartButton: React.FC<Props> = ({ navigateQuizStart }) => {
    return (
        <BaseButton
            onClick={navigateQuizStart}
            icon={<FaPlay/>}
            label={"クイズを開始"}
            style={{
                color: {
                    colorKey: CoreColorKey.Primary,
                }
            }}
            bg_color={true}
        />
    );
};

export default QuizStartButton;