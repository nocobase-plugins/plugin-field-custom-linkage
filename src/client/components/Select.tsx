import { connect, mapReadPretty, useField } from "@formily/react";
import { Input, Select as AntdSelect } from "antd";
import React, { FC } from "react";
import { useSetTargetValues } from "../hooks/useSetTargetValues";

const useSelectValue = (field: any, value: any) => {
    const options = field && (field as any)?.dataSource || [];
    const option = options.find((option: any) => option.value === value);
    return {
        options,
        value: value,
        label: option?.label || value,
    };
};

const SelectEditable: FC<any> = ({ value, disabled, onChange, ...otherProps }) => {
    
    const field = useField();
    const { options } = useSelectValue(field, value);

    const { sourceValueChange } = useSetTargetValues();

    return <AntdSelect
        value={value}
        options={options}
        disabled={disabled}
        onChange={(value) => {
            sourceValueChange(value);
            onChange(value);
        }}
    />;

}

const SelectReadPretty: FC<any> = ({ value, ...otherProps }) => {
    if (!value) return null;
    const field = useField();
    const { label } = useSelectValue(field, value);
    return <Input value={label} {...otherProps} />;
}

export const FCL_Select: FC<any> = connect(SelectEditable, mapReadPretty(SelectReadPretty));

FCL_Select.displayName = 'FCL_Select';