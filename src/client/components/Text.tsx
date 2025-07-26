import { connect, mapReadPretty } from "@formily/react";
import { Input } from "antd";
import React, { FC, useCallback, useEffect, useRef } from "react";
import { useSetTargetValues } from "../hooks/useSetTargetValues";

const TextEditable: FC<any> = ({ value, disabled, onChange, ...otherProps }) => {

    const { sourceValueChange } = useSetTargetValues();
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedChange = useCallback((newValue: string) => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer with 300ms delay
        debounceTimerRef.current = setTimeout(() => {
            sourceValueChange(newValue);
        }, 300);
    }, [sourceValueChange, onChange]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return <Input
        value={value}
        disabled={disabled}
        onChange={(e) => {
            debouncedChange(e.target.value);
            onChange(e.target.value);
        }}
    />;

}

const TextReadPretty: FC<any> = ({ value, ...otherProps }) => {
    if (!value) return null;
    return <Input value={value} {...otherProps} />;
}

export const FCL_Text: FC<any> = connect(TextEditable, mapReadPretty(TextReadPretty));

FCL_Text.displayName = 'FCL_Text';