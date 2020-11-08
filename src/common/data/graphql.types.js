import * as graphql from 'graphql';

export const GraphQLRaw = new graphql.GraphQLScalarType({
  name: 'Raw',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    return ast.value;
  },
});

export const GraphQLJSON = new graphql.GraphQLScalarType({
  name: 'JSON',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    return ast.value;
  },
});
