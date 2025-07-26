/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */
import {
  Plugin,
  useDesignable,
} from '@nocobase/client';
import { tval } from '@nocobase/utils/client';
import { FCL_Text } from './components/Text';
import { FCL_Select } from './components/Select';
import { ISchema, useField, useFieldSchema } from '@formily/react';
import { useTranslation } from 'react-i18next';

// Define namespace constant for our plugin
const NAMESPACE = 'field-custom-linkage';

export class PluginCustomLinkage extends Plugin {
  async load() {
    this.app.addComponents({ FCL_Text, FCL_Select });

    // extends CollectionFieldInterface
    const interfaces = ['checkbox', 'checkboxGroup', 'collection', 'color', 'createdAt', 'createdBy', 'date', 'datetime', 'datetimeNoTz', 'email', 'icon', 'id', 'input', 'integer', 'json', 'linkTo', 'm2m', 'm2o', 'markdown', 'multipleSelect', 'nanoid', 'number', 'o2m', 'o2o', 'oho', 'obo', 'password', 'percent', 'phone', 'radioGroup', 'richText', 'select', 'subTable', 'tableoid', 'textarea', 'time', 'unixTimestamp', 'updatedAt', 'updatedBy', 'url', 'uuid'];
    interfaces.forEach((interfaceName) => {
      let component = 'FCL_Text';
      if (interfaceName === 'select') {
        component = 'FCL_Select';
      }
      this.app.addFieldInterfaceComponentOption(interfaceName, {
        label: tval('CustomLinkage', { ns: NAMESPACE }),
        value: component,
      });
    });

    this.app.schemaSettingsManager.addItem('fieldSettings:FormItem', 'customLinkageSettings', {
      type: 'modal',
      useVisible() {
        const fieldSchema = useFieldSchema();
        const { component } = fieldSchema['x-component-props'] || {};
        return component && ['FCL_Text', 'FCL_Select'].includes(component);
      },
      useComponentProps() {
        const { t } = useTranslation();
        const { dn } = useDesignable();
        const field = useField();
        const fieldSchema = useFieldSchema();
        const { fetchParamsGetter, valueGetterMap } = fieldSchema['x-component-props'] || {};
        return {
          title: t('CustomLinkage', { ns: NAMESPACE }),
          schema: {
            type: 'object',
            title: t('CustomLinkage', { ns: NAMESPACE }),
            properties: {
              fetchParamsGetter: {
                'x-decorator': 'FormItem',
                'x-component': 'Input.TextArea',
                title: t('Fetch params getter', { ns: NAMESPACE }),
                default: fetchParamsGetter || `value => ({
    type: 'api',
    data: {
        url: '...',
        method: 'get',
        headers: {},
        query: { value },
        body: {}
    }
})`,
                'x-component-props': {},
              },
              valueGetterMap: {
                'x-decorator': 'FormItem',
                'x-component': 'Input.TextArea',
                title: t('Value getter map', { ns: NAMESPACE }),
                default: valueGetterMap || `() => ({
    'another_field_name': 'data_key_from_response',
})`,
                'x-component-props': {},
              },
            },
          } as ISchema,
          onSubmit: ({ fetchParamsGetter, valueGetterMap }) => {
            field.componentProps.fetchParamsGetter = fetchParamsGetter;
            field.componentProps.valueGetterMap = valueGetterMap;
            fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
            fieldSchema['x-component-props'].fetchParamsGetter = fetchParamsGetter;
            fieldSchema['x-component-props'].valueGetterMap = valueGetterMap;
            dn.emit('patch', {
              schema: {
                ['x-uid']: fieldSchema['x-uid'],
                'x-component-props': {
                  ...fieldSchema['x-component-props'],
                },
              },
            });
            dn.refresh();
          },
        };
      },
    });
  }
}

export default PluginCustomLinkage;
