import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { useIntl } from 'react-intl';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { ButtonText } from '@strapi/design-system/Text';
import { Stack } from '@strapi/design-system/Stack';
import { SimpleMenu, MenuItem } from '@strapi/design-system/SimpleMenu';
import Plus from '@strapi/icons/Plus';
import { getTrad } from '../../../utils';
import FieldButton from './FieldButton';
import { useLayoutDnd } from '../../../hooks';

const RelationalFields = ({
  relationsLayout,
  editRelationsLayoutRemainingFields,
  onRemoveField,
  onAddField,
}) => {
  const { formatMessage } = useIntl();
  const { setEditFieldToSelect, modifiedData } = useLayoutDnd();

  return (
    <Stack size={4}>
      <div>
        <Box>
          <ButtonText>
            {formatMessage({
              id: getTrad('containers.SettingPage.relations'),
              defaultMessage: 'Relational fields',
            })}
          </ButtonText>
        </Box>
        {/* Since the drag n drop will not be available, this text will be hidden for the moment */}
        {/* <Box>
          <Text small textColor="neutral600">
            {formatMessage({
              id: 'containers.SettingPage.editSettings.description',
              defaultMessage: 'Drag & drop the fields to build the layout',
            })}
          </Text>
        </Box> */}
      </div>
      <Box padding={4} hasRadius borderStyle="dashed" borderWidth="1px" borderColor="neutral300">
        <Stack size={2}>
          {relationsLayout.map((relationName, index) => {
            const relationLabel = get(
              modifiedData,
              ['metadatas', relationName, 'edit', 'label'],
              ''
            );

            return (
              <FieldButton
                onEditField={() => setEditFieldToSelect(relationName)}
                onDeleteField={() => onRemoveField(index)}
                key={relationName}
              >
                {relationLabel || relationName}
              </FieldButton>
            );
          })}
          <SimpleMenu
            id="label"
            label={formatMessage({
              id: 'containers.SettingPage.add.relational-field',
              defaultMessage: 'Insert another relational field',
            })}
            data-testid="add-relation"
            as={Button}
            fullWidth
            startIcon={<Plus />}
            endIcon={null}
            variant="secondary"
            disabled={editRelationsLayoutRemainingFields.length === 0}
          >
            {editRelationsLayoutRemainingFields.map(remainingRelation => (
              <MenuItem
                id={`menuItem-${remainingRelation}`}
                key={`menuItem-${remainingRelation}`}
                onClick={() => onAddField(remainingRelation)}
              >
                {remainingRelation}
              </MenuItem>
            ))}
          </SimpleMenu>
        </Stack>
      </Box>
    </Stack>
  );
};

RelationalFields.propTypes = {
  relationsLayout: PropTypes.array.isRequired,
  editRelationsLayoutRemainingFields: PropTypes.array.isRequired,
  onRemoveField: PropTypes.func.isRequired,
  onAddField: PropTypes.func.isRequired,
};

export default RelationalFields;