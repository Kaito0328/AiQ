import { SizeKey } from "../../../../../style/size";
import { TextColorKey } from "../../../../../types/color";
import Text from "../../../../baseComponents/Text";

interface Props {
  correctAnswer?: string;
}

const CorrectAnswerText: React.FC<Props> = ({ correctAnswer }) => (
  <div className="flex">
    <Text
      text={correctAnswer}
      sizeKey={SizeKey.LG}
      textColorKey={TextColorKey.Success}
    />
  </div>
);

export default CorrectAnswerText;
