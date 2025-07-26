import { useFieldSchema, useForm } from "@formily/react";
import { useRequest } from "@nocobase/client";
import { message } from "antd";
import { useEffect, useState } from "react";

export const useSetTargetValues = () => {

    const form = useForm();
    const fieldSchema = useFieldSchema();
    const [valueGetterMap, setValueGetterMap] = useState<any>({});
    const [fetchParamsGetter, setFetchParamsGetter] = useState<any>('');
    const { valueGetterMap: valueGetterMapString, fetchParamsGetter: fetchParamsGetterString } = fieldSchema['x-component-props'] || {};
    
    useEffect(() => {
        if (fetchParamsGetterString) {
            try {
                setFetchParamsGetter(new Function('value', `return (${fetchParamsGetterString})`));
            } catch (error) {
                console.error(error);
                message.error('Failed to parse fetch params getter');
            }
        }
    }, [fetchParamsGetterString]);

    useEffect(() => {
        if (valueGetterMapString) {
            try {
                setValueGetterMap(eval(valueGetterMapString)());
            } catch (error) {
                console.error(error);
                message.error('Failed to parse value getter map');
            }
        }
    }, [valueGetterMapString]);

    const {
        loading,
        data,
        run,
    } = useRequest<any>(
        {
            url: `collections:field_custom_linkage-fetch_data`,
            skipAuth: true,
        },
        { manual: true },
    );

    const setTargetValues = (data: any) => {
        Object.keys(valueGetterMap || {}).forEach((key) => {
            form.query(key).take((f) => {
                if (f) {
                    let value = null;
                    try {
                        const valueGetter = valueGetterMap[key];
                        value = valueGetter && typeof valueGetter === 'function' ? valueGetter(data?.data?.data || {}) : data?.data?.data?.[valueGetter || key] || null;
                    } catch (error) {
                        console.error(error);
                        message.error('Failed to set target values');
                    }
                    (f as any).setValue(value);
                }
            });
        });
    }

    const sourceValueChange = (value: any) => {
        if (value) {
            try {
                fetchParamsGetter && run({
                    data: fetchParamsGetter(value),
                });
            } catch (error) {
                console.error(error);
                message.error('Failed to fetch data');
                setTargetValues(null);
            }
        } else {
            setTargetValues(null);
        }
    };

    useEffect(() => {
        if (!loading) {
            setTargetValues(data);
        }
    }, [data, loading]);

    return {
        sourceValueChange,
    }

}