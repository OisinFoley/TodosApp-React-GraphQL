import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import Paper from '@material-ui/core/Paper';

import Form from './Form';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';


const ToDosQuery = gql`
{
  todos {
    id
    text
    complete
  }
}
`;

const UpdateMutation = gql`
  mutation($id: ID!, $complete: Boolean!) {
    updateTodo(id: $id, complete: $complete)
  }
`;

const DeleteMutation = gql`
  mutation($id: ID!) {
    removeTodo(id: $id)
  }
`;

const CreateToDoMutation = gql`
  mutation($text: String!) {
    createTodo(text: $text) {
      id
      text
      complete
    }
  }
`;

class App extends Component {

  createTodo = async text => {
    await this.props.createTodo({
      variables: {
        text: text
      },
      update: (store, { data: { createTodo } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ToDosQuery });
        // Add our comment from the mutation to the end.
        data.todos.unshift(createTodo);
        // Write our data back to the cache.
        store.writeQuery({ query: ToDosQuery, data });
      }
    })
  }

  removeTodo = async todo => {
    await this.props.removeTodo({   
      variables: {
        id: todo.id
      },
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ToDosQuery });
        // Add our comment from the mutation to the end.
        data.todos = data.todos.filter(x => x.id !== todo.id)
        // Write our data back to the cache.
        store.writeQuery({ query: ToDosQuery, data });
      }
    });
  };

  updateTodo = async todo => {
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        complete: !todo.complete
      },
      //when we update a value, it would be visible on screen unless we tell the cached store to update
      //otherwise we'd need a refresh to see the update
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ToDosQuery });
        // Add our comment from the mutation to the end.
        data.todos = data.todos.map(
          x => 
            x.id === todo.id
            ? {
              ...todo,
              complete: !todo.complete
            } 
            : x 
        );
        // Write our data back to the cache.
        store.writeQuery({ query: ToDosQuery, data });
      }

    });
  };


  render() {
    console.log(this.props);
    const {data: { todos, loading }} = this.props;
    if (loading) {
      return null;
    }
    
    return (
    <div style={{ display: "flex" }}>
      <div style={{ margin: "auto", width: 400 }}>
        <Paper elevation={1}>
        <Form submit={ this.createTodo }/>
          <List>
          {todos.map(todo => (
            <ListItem
              key={todo.id}
              role={undefined}
              dense
              button
              onClick={() => this.updateTodo(todo)}
            >
              <Checkbox
                checked={todo.complete}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={todo.text} />
              <ListItemSecondaryAction>
                <IconButton onClick={() => this.removeTodo(todo) }>
                  <CloseIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        </Paper>
      </div>
    </div>

    
    )
  }
}

export default compose(
  graphql(CreateToDoMutation, { name: "createTodo" }),
  graphql(DeleteMutation, { name: "removeTodo" }),
  graphql(UpdateMutation, { name: "updateTodo" }),
  graphql(ToDosQuery)
) (App);