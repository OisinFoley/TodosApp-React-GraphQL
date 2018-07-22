const { GraphQLServer } = require('graphql-yoga')
const mongoose = require('mongoose');

const ToDo = mongoose.model('ToDo', {
  text:  String,
  complete: Boolean
});

mongoose.connect("mongodb://localhost/test5");

const typeDefs = `
  type Query {
    hello(name: String): String!
    todos: [ToDo]
  }
  type ToDo {
    id: ID!
    text: String!
    complete: Boolean!
  }
  type Mutation {
    createTodo(text: String!): ToDo
    updateTodo(id: ID!, complete: Boolean!): Boolean,
    updateTodoText(id: ID!, text: String!): Boolean
    removeTodo(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    todos: () => ToDo.find()
  },
  Mutation: {
    createTodo: async (_, { text }) => {
      const todo = new ToDo({ text, complete: false });
      await todo.save();
      return todo;
    },
    updateTodo: async (_, { id, complete }) => {
      await ToDo.findByIdAndUpdate(id, { complete });
      return true;
    },
    updateTodoText: async (_, { id, text }) => {
      await ToDo.findOneAndUpdate(id, { text });
      return true;
    },
    removeTodo: async (_, { id }) => {
      await ToDo.findByIdAndRemove(id);
      return true;
    }
  }
}

const server = new GraphQLServer({ typeDefs, resolvers });
// server.start(() => console.log('Server is running on localhost:4000'))

mongoose.connection.once("open", function() {
  server.start(() => console.log("server is up and running on :4000"));
})