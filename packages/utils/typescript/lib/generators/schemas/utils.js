'use strict';

const { factory } = require('typescript');
const {
  flow,
  replace,
  camelCase,
  upperFirst,
  isObject,
  isString,
  isNumber,
  isArray,
  isBoolean,
  propEq,
} = require('lodash/fp');

/**
 * Get all components and content-types in a Strapi application
 *
 * @param {Strapi} strapi
 * @returns {object}
 */
const getAllStrapiSchemas = strapi => ({ ...strapi.contentTypes, ...strapi.components });

/**
 * Extract a valid interface name from a schema uid
 *
 * @param {string} uid
 * @returns {string}
 */
const getSchemaInterfaceName = flow(replace(/(:.)/, ' '), camelCase, upperFirst);

/**
 * Get the parent type name to extend based on the schema's nature
 *
 * @param {object} schema
 * @returns {string}
 */
const getSchemaExtendsTypeName = schema => {
  const base = getSchemaModelType(schema);

  return upperFirst(base) + 'Schema';
};

const getSchemaModelType = schema => {
  const { modelType, kind } = schema;

  // Components
  if (modelType === 'component') {
    return 'component';
  }

  // Content-Types
  else if (modelType === 'contentType') {
    return kind;
  }

  return null;
};

/**
 * Get a type node based on a type and its params
 *
 * @param {string} typeName
 * @param {ts.TypeNode[]} [params]
 * @returns
 */
const getTypeNode = (typeName, params = []) => {
  return factory.createTypeReferenceNode(factory.createIdentifier(typeName), params);
};

/**
 * Transform a regular JavaScript object into an object litteral expression
 * @param {object} data
 * @returns {ts.ObjectLiteralExpression}
 */
const toTypeLitteral = data => {
  if (isString(data)) {
    return factory.createStringLiteral(data, true);
  }

  if (isNumber(data)) {
    return factory.createNumericLiteral(data);
  }

  if (isBoolean(data)) {
    return data ? factory.createTrue() : factory.createFalse();
  }

  if (isArray(data)) {
    return factory.createTupleTypeNode(data.map(item => toTypeLitteral(item)));
  }

  if (!isObject(data)) {
    throw new Error('Cannot convert to object litteral. Unknown type', typeof data);
  }

  const entries = Object.entries(data);

  const props = entries.reduce((acc, [key, value]) => {
    // Handle keys such as content-type-builder & co.
    const identifier = key.includes('-')
      ? factory.createStringLiteral(key, true)
      : factory.createIdentifier(key);

    return [
      ...acc,
      factory.createPropertyDeclaration(
        undefined,
        undefined,
        identifier,
        undefined,
        toTypeLitteral(value)
      ),
    ];
  }, []);

  return factory.createTypeLiteralNode(props);
};

/**
 * Get the number of attributes generated for a given schema definition
 *
 * @param {ts.TypeNode} definition
 * @returns {number | null}
 */
const getDefinitionAttributesCount = definition => {
  const attributesNode = definition.members.find(propEq('name.escapedText', 'attributes'));

  if (!attributesNode) {
    return null;
  }

  return attributesNode.type.members.length;
};

module.exports = {
  getAllStrapiSchemas,
  getSchemaInterfaceName,
  getSchemaExtendsTypeName,
  getSchemaModelType,
  getDefinitionAttributesCount,
  getTypeNode,
  toTypeLitteral,
};