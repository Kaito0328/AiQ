import { FontWeightKey } from "../../../style/fontWeight";
import { SizeProperty } from "../../../style/size";
import BaseLabel, { LabelStyle } from "../../baseComponents/BaseLabel";
import InLineTextInput, { InLineInputStyle } from "../../baseComponents/InLineTextInput";

interface Props {
  defaultValue?: string;
  value?: string;
    placeholder?: string;
  onChange: (value: string) => void;
    label: string;
  style?: InLineInputStyle;
  password?: boolean;
}

const labelWithInput: React.FC<Props> = ({
  defaultValue,
  value,
  onChange,
  placeholder = "",
  style,
  label,
  password = false
}) => {

    const labelStyle: LabelStyle = {
      size: {
        sizeKey: style?.size?.sizeKey,
        full_width: style?.size?.full_width,
        widthPercent: style?.size?.widthPercent,
        properties: style?.size?.properties ?? [SizeProperty.Text]
      },
      color: {
        colorKey: style?.colorKey
      },
      roundKey: style?.roundKey,
      fontWeightKey: FontWeightKey.Semibold
    }
  return (
    <div className="space-y-4">
        <BaseLabel
            label={label}
            style={labelStyle}
        />
        <InLineTextInput
            onChange={onChange}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            style={style}
            password={password}
        />
    </div>
  );
};

export default labelWithInput;

